import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import imeiRoutes from "./src/routes/imeiRoutes.js";
import saleRoutes from "./src/routes/saleRoutes.js";
import repairRoutes from "./src/routes/repairRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import { ipWhitelistMiddleware } from "./src/middleware/securityMiddleware.js";
import { auditLogger } from "./src/middleware/auditMiddleware.js";
import StoreProfile from "./src/models/StoreProfile.js";
import User from "./src/models/User.js";
import Product from "./src/models/Product.js";

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

  const PORT = 3000;

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/lakki_erp";
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

  app.use(cors());
  app.use(express.json());

  // IP Whitelisting Middleware (ID 186)
  app.use(ipWhitelistMiddleware);
  
  // Audit Logging Middleware (ID 181)
  app.use(auditLogger);

    // Seed Store Profile and Admin User for testing
    const seedData = async () => {
      const storeCount = await StoreProfile.countDocuments();
      if (storeCount === 0) {
        await StoreProfile.create({
          name: "Lakki Phone Main Branch",
          address: "Kuwait City, Kuwait",
          whitelistedIPs: ["127.0.0.1", "::1"],
          location: { latitude: 29.3759, longitude: 47.9774 }, // Kuwait City coords
          geofenceRadius: 500
        });
        console.log("Seeded Store Profile");
      }

      const hashedPassword = await bcrypt.hash("admin123", 10);
      const fullPermissions = Array.from({ length: 300 }, (_, i) => i + 1);
      
      await User.findOneAndUpdate(
        { email: "admin@lakkiphone.com" },
        {
          name: "Super Admin",
          password: hashedPassword,
          role: "admin",
          permissions: [0, ...fullPermissions] // 0 for super admin + all 300 IDs
        },
        { upsert: true, new: true }
      );
      console.log("Seeded/Updated Admin User (admin@lakkiphone.com / admin123) with full permissions [1-300]");

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        { name: "iPhone 15 Pro Max 256GB Natural Titanium", sku: "IP15PM-256-NT", category: "Phones", price: 345.000, cost: 300.000, stock: 12, isImeiRequired: true },
        { name: "Samsung Galaxy S24 Ultra 512GB Titanium Gray", sku: "S24U-512-TG", category: "Phones", price: 310.000, cost: 280.000, stock: 8, isImeiRequired: true },
        { name: "AirPods Pro (2nd Gen) with MagSafe Case", sku: "APP2-MG", category: "Accessories", price: 65.000, cost: 50.000, stock: 45, isImeiRequired: false },
        { name: "Samsung 25W Fast Charger (Type-C)", sku: "SAM-25W-C", category: "Accessories", price: 8.500, cost: 4.000, stock: 120, isImeiRequired: false },
      ];
      await Product.create(sampleProducts);
      console.log("Seeded Sample Products");
    }
  };
  seedData();

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
  app.use("/api/products", productRoutes);
  app.use("/api/imei", imeiRoutes);
  app.use("/api/sales", saleRoutes);
  app.use("/api/repairs", repairRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/reports", reportRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Lakki Phone ERP API is running" });
  });

  // 404 handler for API routes to prevent falling back to index.html
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
