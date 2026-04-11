import { Request, Response } from 'express';
import OmnichannelOrder from '../models/OmnichannelOrder.js';

export const supplierPortalController = {
  getOrders: async (req: Request, res: Response) => {
    try {
      // Logic to get supplier specific orders
      const orders = await OmnichannelOrder.find({ status: 'pending' }).populate('customerId', 'name');
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  updateOrderStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const order = await OmnichannelOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getInventoryAlerts: async (req: Request, res: Response) => {
    try {
      // Logic to get low stock alerts for supplier
      res.json([
        { productId: 'mock-id-1', sku: 'SKU-001', currentStock: 5, threshold: 10 },
        { productId: 'mock-id-2', sku: 'SKU-002', currentStock: 2, threshold: 5 }
      ]);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
