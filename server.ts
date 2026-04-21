import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import securityRoutes from "./src/routes/securityRoutes.js";
import auditRoutes from "./src/routes/auditRoutes.js";
import quoteRoutes from "./src/routes/quoteRoutes.js";
import bulkRoutes from "./src/routes/bulkRoutes.js";
import featureToggleRoutes from "./src/routes/featureToggleRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import imeiRoutes from "./src/routes/imeiRoutes.js";
import saleRoutes from "./src/routes/saleRoutes.js";
import repairRoutes from "./src/routes/repairRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import financeRoutes from "./src/routes/financeRoutes.js";
import hrRoutes from "./src/routes/hrRoutes.js";
import crmRoutes from "./src/routes/crmRoutes.js";
import iotRoutes from "./src/routes/iotRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import supplierRoutes from "./src/routes/supplierRoutes.js";
import shiftRoutes from "./src/routes/shiftRoutes.js";
import giftCardRoutes from "./src/routes/giftCardRoutes.js";
import layawayRoutes from "./src/routes/layawayRoutes.js";
import marketingRoutes from "./src/routes/marketingRoutes.js";
import attributeRoutes from "./src/routes/attributeRoutes.js";
import customerGroupRoutes from "./src/routes/customerGroupRoutes.js";
import warehouseRoutes from "./src/routes/warehouseRoutes.js";
import supplierPortalRoutes from "./src/routes/supplierPortalRoutes.js";
import omnichannelRoutes from "./src/routes/omnichannelRoutes.js";
import hardwareRoutes from "./src/routes/hardwareRoutes.js";
import customerPortalRoutes from "./src/routes/customerPortalRoutes.js";
import imeiTimelineRoutes from "./src/routes/imeiTimelineRoutes.js";
import inventoryIntelligenceRoutes from "./src/routes/inventoryIntelligenceRoutes.js";
import commissionRoutes from "./src/routes/commissionRoutes.js";
import complianceRoutes from "./src/routes/complianceRoutes.js";
import qualityControlRoutes from "./src/routes/qualityControlRoutes.js";
import rmaRoutes from "./src/routes/rmaRoutes.js";
import returnRoutes from "./src/routes/returnRoutes.js";
import webhookRoutes from "./src/routes/webhookRoutes.js";
import storeRoutes from "./src/routes/storeRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import leaveRoutes from "./src/routes/leaveRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import valuationRoutes from "./src/routes/valuationRoutes.js";
import { trainingModeMiddleware } from "./src/middleware/trainingMode.js";
import { ipWhitelistMiddleware } from "./src/middleware/securityMiddleware.js";
import { auditLogger } from "./src/middleware/auditMiddleware.js";
import { initBackupCron } from "./src/services/backupService.js";
import StoreProfile from "./src/models/StoreProfile.js";
import SecurityConfig from "./src/models/SecurityConfig.js";
import User from "./src/models/User.js";
import Product from "./src/models/Product.js";
import Store from "./src/models/Store.js";

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  initBackupCron();

  const PORT = 3000;

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/lakki_erp";
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

  app.use(cors());
  app.use(express.json());

  // Attach IO to request for routes to use
  app.use((req: any, res, next) => {
    req.io = io;
    next();
  });

  // IP Whitelisting Middleware (ID 186)
  app.use(ipWhitelistMiddleware);
  
  // Audit Logging Middleware (ID 181)
  app.use(auditLogger);

    // Seed Store Profile and Admin User for testing
    const seedData = async () => {
      const storeCount = await StoreProfile.countDocuments();
      if (storeCount === 0) {
        await StoreProfile.create({
          name: "Lakki Phone Main Branch Profile",
          address: "Kuwait City, Kuwait",
          whitelistedIPs: ["127.0.0.1", "::1"],
          location: { latitude: 29.3759, longitude: 47.9774 }, // Kuwait City coords
          geofenceRadius: 500
        });
        console.log("Seeded Store Profile");
      }

      const actualStoreCount = await Store.countDocuments();
      let defaultStoreId = null;
      if (actualStoreCount === 0) {
        const defaultStore = await Store.create({
          name: "Main Branch (OBSIDIAN)",
          address: "Kuwait City, Al-Hamra Tower",
          phone: "+965 2222 1111",
          status: "active"
        });
        defaultStoreId = defaultStore._id;
        console.log("Seeded Main Store");
      } else {
        const store = await Store.findOne();
        defaultStoreId = store?._id;
      }

      const hashedPassword = await bcrypt.hash("admin123", 10);
      const fullPermissions = Array.from({ length: 350 }, (_, i) => i + 1);
      
      await User.findOneAndUpdate(
        { email: "admin@lakkiphone.com" },
        {
          name: "Super Admin",
          password: hashedPassword,
          role: "superadmin",
          storeId: defaultStoreId,
          permissions: [0, ...fullPermissions]
        },
        { upsert: true, new: true }
      );

      await User.findOneAndUpdate(
        { email: "satyamisme@gmail.com" },
        {
          name: "Satyam Admin",
          password: hashedPassword,
          role: "superadmin",
          storeId: defaultStoreId,
          permissions: [0, ...fullPermissions]
        },
        { upsert: true, new: true }
      );
      
      // Migration: Grant all permissions to all existing superadmins
      await User.updateMany(
        { role: 'superadmin' },
        { $set: { permissions: [0, ...fullPermissions] } }
      );
      
      console.log("Seeded/Updated Admin User (admin@lakkiphone.com / admin123) with full permissions [1-350]");

      // Seed Default PIN (ID 408)
      const pinCount = await SecurityConfig.countDocuments({ configKey: 'terminal_purge_pin' });
      if (pinCount === 0) {
        await SecurityConfig.create({ configKey: 'terminal_purge_pin', configValue: '1212' });
        console.log("Seeded Default Terminal PIN: 1212");
      }

  };
  await seedData();

  // Socket.io Real-time Job Status (ID 67)
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    
    socket.on("update_job_status", (data) => {
      // Broadcast status change to all clients
      io.emit("status_changed", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/security", securityRoutes);
  app.use("/api/audit", auditRoutes);
  app.use("/api/quotes", quoteRoutes);
  app.use("/api/bulk", bulkRoutes);
  app.use("/api/feature-toggles", featureToggleRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/imei", imeiRoutes);
  app.use("/api/sales", saleRoutes);
  app.use("/api/repairs", repairRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/finance", financeRoutes);
  app.use("/api/hr", hrRoutes);
  app.use("/api/crm", crmRoutes);
  app.use("/api/iot", iotRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/suppliers", supplierRoutes);
  app.use("/api/shift", shiftRoutes);
  app.use("/api/gift-cards", giftCardRoutes);
  app.use("/api/layaway", layawayRoutes);
  app.use("/api/marketing", marketingRoutes);
  app.use("/api/attributes", attributeRoutes);
  app.use("/api/customer-groups", customerGroupRoutes);
  app.use("/api/warehouse", warehouseRoutes);
  app.use("/api/supplier-portal", supplierPortalRoutes);
  app.use("/api/omnichannel", omnichannelRoutes);
  app.use("/api/hardware", hardwareRoutes);
  app.use("/api/customer-portal", customerPortalRoutes);
  app.use("/api/imei-timeline", imeiTimelineRoutes);
  app.use("/api/inventory-intelligence", inventoryIntelligenceRoutes);
  app.use("/api/commission", commissionRoutes);
  app.use("/api/compliance", complianceRoutes);
  app.use("/api/quality-control", qualityControlRoutes);
  app.use("/api/returns", rmaRoutes);
  app.use("/api/pos-returns", returnRoutes);
  app.use("/api/webhooks", webhookRoutes);
  app.use("/api/stores", storeRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/customers", customerRoutes);
  app.use("/api/leave", leaveRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/valuation", valuationRoutes);

  // Training Mode Middleware (ID 227)
  app.use(trainingModeMiddleware);

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "Lakki Phone ERP API is running",
      env: {
        stripe: !!process.env.STRIPE_SECRET_KEY,
        gsma: !!process.env.GSMA_API_KEY,
        shopify: !!process.env.SHOPIFY_API_KEY,
        woocommerce: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
        mongodb: mongoose.connection.readyState === 1
      }
    });
  });

  // 404 handler for API routes to prevent falling back to index.html
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("Vite server error:", err);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  try {
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Server failed to start:", err);
  }
}

try {
  startServer();
} catch (err) {
  console.error("Fatal error during server startup:", err);
}
