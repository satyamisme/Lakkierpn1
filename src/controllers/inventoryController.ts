import { Request, Response } from 'express';
import Product from '../models/Product.js';
import Imei from '../models/Imei.js';
import mongoose from 'mongoose';

// Mocking some models that might not exist yet but are needed for the logic
// In a real app, these would be imported from ../models/
const InventoryTransfer = mongoose.model('InventoryTransfer', new mongoose.Schema({
  fromStore: String,
  toStore: String,
  items: [{ productId: String, quantity: Number, imei: [String] }],
  status: { type: String, enum: ['pending', 'shipped', 'received', 'cancelled'], default: 'pending' },
  shippedAt: Date,
  receivedAt: Date
}, { timestamps: true }));

export const inventoryController = {
  getGlobalStock: async (req: Request, res: Response) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getLowStock: async (req: Request, res: Response) => {
    try {
      const lowStockProducts = await Product.find({ stock: { $lte: 5 } }); // Assuming 5 is the threshold
      res.json(lowStockProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  createTransfer: async (req: Request, res: Response) => {
    try {
      const transfer = new InventoryTransfer(req.body);
      await transfer.save();
      res.status(201).json(transfer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  updateTransferStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const updateData: any = { status };
      if (status === 'shipped') updateData.shippedAt = new Date();
      if (status === 'received') updateData.receivedAt = new Date();

      const transfer = await InventoryTransfer.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
      
      // If received, update actual stock levels (simplified logic)
      if (status === 'received') {
        for (const item of (transfer as any).items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }
      }

      res.json(transfer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getTransferList: async (req: Request, res: Response) => {
    try {
      const transfers = await InventoryTransfer.find().sort({ createdAt: -1 });
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  adjustStock: async (req: Request, res: Response) => {
    try {
      const { productId, adjustment, reason } = req.body;
      const product = await Product.findByIdAndUpdate(productId, { $inc: { stock: adjustment } }, { new: true });
      if (!product) return res.status(404).json({ message: 'Product not found' });
      
      // Log adjustment (audit log logic would go here)
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getFifoValuation: async (req: Request, res: Response) => {
    try {
      const products = await Product.find();
      const totalValuation = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
      res.json({ totalValuation, currency: 'KD' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
