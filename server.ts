import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes";
import { ipWhitelistMiddleware } from "./src/middleware/securityMiddleware";
import StoreProfile from "./src/models/StoreProfile";
import User from "./src/models/User";
import Product from "./src/models/Product";
import Repair from "./src/models/Repair";

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
        { name: "iPhone 15 Pro Max 256GB Natural Titanium", sku: "IP15PM-256-NT", category: "Phones", price: 345.000, stock: 12, isPhone: true },
        { name: "Samsung Galaxy S24 Ultra 512GB Titanium Gray", sku: "S24U-512-TG", category: "Phones", price: 310.000, stock: 8, isPhone: true },
        { name: "AirPods Pro (2nd Gen) with MagSafe Case", sku: "APP2-MG", category: "Accessories", price: 65.000, stock: 45, isPhone: false },
        { name: "Samsung 25W Fast Charger (Type-C)", sku: "SAM-25W-C", category: "Accessories", price: 8.500, stock: 120, isPhone: false },
        { name: "iPhone 13 128GB Midnight (Used - Grade A)", sku: "IP13-128-MID-U", category: "Phones", price: 145.000, stock: 3, isPhone: true },
        { name: "Apple Watch Series 9 45mm GPS Midnight", sku: "AW9-45-GPS-MID", category: "Accessories", price: 125.000, stock: 5, isPhone: false },
        { name: "Google Pixel 8 Pro 128GB Obsidian", sku: "GP8P-128-OBS", category: "Phones", price: 245.000, stock: 4, isPhone: true },
        { name: "Anker PowerCore 20K Power Bank", sku: "ANK-PC-20K", category: "Accessories", price: 15.000, stock: 30, isPhone: false },
      ];
      await Product.create(sampleProducts);
      console.log("Seeded Sample Products");
    }
  };
  seedData();

  // Middleware to check permissions
  const checkPermission = (permissionId: number) => {
    return async (req: any, res: any, next: any) => {
      // For now, we assume req.user is populated. 
      // In a real app, this would come from a JWT auth middleware.
      // Mocking a super admin or checking permissions array:
      const user = req.user || { role: 'admin', permissions: [0] }; // Mocking super admin for now
      
      const hasPerm = user.permissions.includes(0) || user.permissions.includes(permissionId);
      
      if (!hasPerm) {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }
      next();
    };
  };

  // PATCH /api/users/:id/permissions
  app.patch("/api/users/:id/permissions", checkPermission(185), async (req, res) => {
    try {
      const { id } = req.params;
      const { permissions } = req.body;

      const User = mongoose.model('User');
      const user: any = await User.findByIdAndUpdate(id, { permissions }, { new: true });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Real-time Sync: Emit PERMISSION_UPDATE
      io.emit("PERMISSION_UPDATE", { userId: id, permissions: user.permissions });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

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

  // ID 3: Elastic Search Bar - Search by Name, SKU, or IMEI
  app.get("/api/products/search", async (req, res) => {
    try {
      const { q } = req.query;
      let query = {};
      
      if (q) {
        query = {
          $or: [
            { $text: { $search: q as string } },
            { sku: { $regex: q as string, $options: 'i' } },
            { name: { $regex: q as string, $options: 'i' } }
          ]
        };
      }

      const products = await Product.find(query).limit(50); // Limit results for performance
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // ID 6: Duplicate IMEI Prevention - Validate IMEI
  app.get("/api/products/validate-imei", async (req, res) => {
    try {
      const { imei } = req.query;
      if (!imei) return res.status(400).json({ error: "IMEI required" });

      // Check if IMEI exists in any product's history (already sold)
      const exists = await Product.findOne({ imeiHistory: imei });
      res.json({ exists: !!exists });
    } catch (error) {
      res.status(500).json({ error: "Validation failed" });
    }
  });
  
  // ID 1: Process Sale - POST /api/sales
  app.post("/api/sales", checkPermission(1), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { items, total, payments, orderId } = req.body;
      
      // 1. Record the sale (Mocking a Sale model for now or just logging)
      console.log(`Recording sale ${orderId} for total ${total}`);
      
      // 2. Decrement stock for each item (ID 31, 34)
      for (const item of items) {
        const product = await Product.findOne({ sku: item.sku }).session(session);
        if (product) {
          if (product.stock < 1) {
            throw new Error(`Product ${product.name} is out of stock`);
          }
          product.stock -= 1;
          // If it's a phone, record the IMEI in history
          if (item.imei) {
            product.imeiHistory = product.imeiHistory || [];
            product.imeiHistory.push(item.imei);
          }
          await product.save({ session });
        }
      }
      
      await session.commitTransaction();
      res.status(201).json({ success: true, orderId });
    } catch (error: any) {
      await session.abortTransaction();
      res.status(400).json({ error: error.message || "Sale failed" });
    } finally {
      session.endSession();
    }
  });

  // ID 61: Repair Job Card Intake - POST /api/repairs
  app.post("/api/repairs", checkPermission(61), async (req, res) => {
    try {
      const repair = new Repair(req.body);
      await repair.save();
      
      // Real-time Sync: Emit status_changed (ID 67)
      io.emit("status_changed", { repairId: repair._id, status: repair.status });
      
      res.status(201).json(repair);
    } catch (error) {
      res.status(500).json({ error: "Failed to create job card" });
    }
  });

  // ID 63: Repair Bench Queue - GET /api/repairs
  app.get("/api/repairs", checkPermission(63), async (req, res) => {
    try {
      const { status } = req.query;
      const query = status ? { status: status as string } : {};
      const repairs = await Repair.find(query).sort({ createdAt: -1 });
      res.json(repairs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch repairs" });
    }
  });

  // ID 63: Start Repair - PATCH /api/repairs/:id/status
  app.patch("/api/repairs/:id/status", checkPermission(63), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const repair = await Repair.findByIdAndUpdate(id, { status, updatedAt: Date.now() }, { new: true });
      if (!repair) return res.status(404).json({ error: "Repair not found" });
      
      // Real-time Sync: Emit status_changed (ID 67)
      io.emit("status_changed", { repairId: id, status });
      
      res.json(repair);
    } catch (error) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // ID 71: QC Checklist - PATCH /api/repairs/:id/qc
  app.patch("/api/repairs/:id/qc", checkPermission(71), async (req, res) => {
    try {
      const { id } = req.params;
      const { qcResults } = req.body;
      
      // We'll store QC results in a new field or just update status to 'ready' if all passed
      const repair = await Repair.findByIdAndUpdate(id, { 
        qcResults, 
        status: 'ready', 
        updatedAt: Date.now() 
      }, { new: true });
      
      if (!repair) return res.status(404).json({ error: "Repair not found" });
      
      // Real-time Sync: Emit status_changed (ID 67)
      io.emit("status_changed", { repairId: id, status: 'ready' });
      
      res.json(repair);
    } catch (error) {
      res.status(500).json({ error: "Failed to save QC results" });
    }
  });

  // ID 141: Repair Pickup & Billing - PATCH /api/repairs/:id/pickup
  app.patch("/api/repairs/:id/pickup", checkPermission(141), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { paymentMethod, partsUsed } = req.body; // partsUsed is array of SKUs
      
      const repair = await Repair.findByIdAndUpdate(id, { 
        status: 'delivered', 
        paymentMethod,
        deliveredAt: Date.now(),
        updatedAt: Date.now() 
      }, { new: true }).session(session);
      
      if (!repair) {
        throw new Error("Repair not found");
      }
      
      // ID 121: Real stock deduction for parts used
      if (partsUsed && Array.isArray(partsUsed)) {
        for (const sku of partsUsed) {
          const product = await Product.findOne({ sku }).session(session);
          if (product && product.stock > 0) {
            product.stock -= 1;
            await product.save({ session });
            console.log(`Stock decremented for part ${sku}`);
          }
        }
      }
      
      await session.commitTransaction();
      
      // Real-time Sync: Emit status_changed (ID 67)
      io.emit("status_changed", { repairId: id, status: 'delivered' });
      
      res.json(repair);
    } catch (error: any) {
      await session.abortTransaction();
      res.status(500).json({ error: error.message || "Failed to process pickup" });
    } finally {
      session.endSession();
    }
  });

  // ID 34: Low-Stock Alarms - GET /api/inventory/alerts
  app.get("/api/inventory/alerts", checkPermission(34), async (req, res) => {
    try {
      const threshold = 5;
      const alerts = await Product.find({ stock: { $lt: threshold } }).sort({ stock: 1 });
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock alerts" });
    }
  });

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
