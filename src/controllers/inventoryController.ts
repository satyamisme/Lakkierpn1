import { Request, Response } from 'express';
import Product from '../models/Product.js';
import Imei from '../models/Imei.js';
import InventoryTransfer from '../models/InventoryTransfer.js';
import Inventory from '../models/Inventory.js';
import CycleCount from '../models/CycleCount.js';
import mongoose from 'mongoose';

export const inventoryController = {
  getGlobalStock: async (req: Request, res: Response) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getLowStock: async (req: Request, res: Response) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 5;
      const lowStockProducts = await Product.find({ stock: { $lte: threshold } });
      res.json(lowStockProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createTransfer: async (req: Request, res: Response) => {
    try {
      const transfer = new InventoryTransfer(req.body);
      await transfer.save();
      res.status(201).json(transfer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  updateTransferStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const updateData: any = { status };
      if (status === 'shipped') updateData.shippedAt = new Date();
      if (status === 'received') updateData.receivedAt = new Date();

      const transfer = await InventoryTransfer.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!transfer) return res.status(404).json({ error: 'Transfer not found' });
      
      // If received, update actual stock levels
      if (status === 'received') {
        for (const item of (transfer as any).items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }
      }

      res.json(transfer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getTransferList: async (req: Request, res: Response) => {
    try {
      const transfers = await InventoryTransfer.find().sort({ createdAt: -1 });
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  adjustStock: async (req: Request, res: Response) => {
    try {
      const { productId, adjustment, reason } = req.body;
      const product = await Product.findByIdAndUpdate(productId, { $inc: { stock: adjustment } }, { new: true });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getFifoValuation: async (req: Request, res: Response) => {
    try {
      const products = await Product.find();
      const totalValuation = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);
      res.json({ totalValuation, currency: 'KD' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // FIX: 318 - Cycle Count Logic
  startCycleCount: async (req: Request, res: Response) => {
    try {
      const sessionId = 'CC-' + Date.now();
      const { storeId } = req.body;
      const cycleCount = new CycleCount({
        sessionId,
        storeId,
        createdBy: (req as any).user.id,
        status: 'pending'
      });
      await cycleCount.save();
      res.status(201).json({ sessionId });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  submitCycleCount: async (req: Request, res: Response) => {
    try {
      const { sessionId, items } = req.body;
      const cycleCount = await CycleCount.findOne({ sessionId });
      if (!cycleCount) return res.status(404).json({ error: 'Session not found' });
      
      cycleCount.items = items;
      cycleCount.submittedAt = new Date();
      await cycleCount.save();
      res.json(cycleCount);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getPendingCycleCounts: async (req: Request, res: Response) => {
    try {
      const sessions = await CycleCount.find({ status: 'pending' }).populate('createdBy', 'name');
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getCycleCountDiscrepancy: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const cycleCount = await CycleCount.findOne({ sessionId }).populate('items.productId');
      if (!cycleCount) return res.status(404).json({ error: 'Session not found' });
      
      const discrepancies = [];
      for (const item of cycleCount.items) {
        const inventory = await Inventory.findOne({ productId: item.productId, storeId: cycleCount.storeId });
        const expectedQty = inventory ? inventory.quantity : 0;
        if (expectedQty !== item.actualCount) {
          discrepancies.push({
            productId: item.productId,
            sku: item.sku,
            expectedQty,
            actualQty: item.actualCount,
            action: 'investigate'
          });
        }
      }
      
      cycleCount.discrepancies = discrepancies;
      await cycleCount.save();
      res.json(cycleCount);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  resolveCycleCount: async (req: Request, res: Response) => {
    try {
      const { sessionId, resolutions } = req.body;
      const cycleCount = await CycleCount.findOne({ sessionId });
      if (!cycleCount) return res.status(404).json({ error: 'Session not found' });
      
      for (const resItem of resolutions) {
        const disc = cycleCount.discrepancies.find(d => d.productId.toString() === resItem.productId);
        if (disc && resItem.action === 'accept') {
          await Inventory.findOneAndUpdate(
            { productId: resItem.productId, storeId: cycleCount.storeId },
            { quantity: disc.actualQty, $inc: { version: 1 } },
            { upsert: true }
          );
          disc.action = 'accept';
        }
      }
      
      cycleCount.status = 'resolved';
      cycleCount.resolvedBy = (req as any).user.id;
      cycleCount.resolvedAt = new Date();
      await cycleCount.save();
      res.json(cycleCount);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
