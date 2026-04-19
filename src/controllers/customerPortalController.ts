import { Request, Response } from 'express';
// Assuming we use existing models for orders and repairs
// For now, mocking the logic as per frontend service requirements

export const customerPortalController = {
  getOrders: async (req: Request, res: Response) => {
    try {
      const Sale = (await import('../models/Sale.js')).default;
      const customerEmail = (req as any).user.email;
      const orders = await Sale.find({ 'customer.email': customerEmail }).sort({ createdAt: -1 });
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getRepairStatus: async (req: Request, res: Response) => {
    try {
      const Repair = (await import('../models/Repair.js')).default;
      const customerEmail = (req as any).user.email;
      const repairs = await Repair.find({ 'customer.email': customerEmail }).sort({ createdAt: -1 });
      res.json(repairs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getLoyaltyPoints: async (req: Request, res: Response) => {
    try {
      const Customer = (await import('../models/Customer.js')).default;
      const customerEmail = (req as any).user.email;
      const customer = await Customer.findOne({ email: customerEmail });
      res.json({ points: customer?.loyaltyPoints || 0, tier: customer?.tier || 'bronze' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
