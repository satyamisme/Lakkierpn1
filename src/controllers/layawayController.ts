import { Request, Response } from 'express';
import Layaway from '../models/Layaway';

export const layawayController = {
  create: async (req: Request, res: Response) => {
    try {
      const layaway = new Layaway(req.body);
      await layaway.save();
      res.status(201).json(layaway);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const layaways = await Layaway.find().populate('customerId', 'name email').populate('saleId');
      res.json(layaways);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const layaway = await Layaway.findById(req.params.id).populate('customerId', 'name email').populate('saleId');
      if (!layaway) return res.status(404).json({ message: 'Layaway plan not found' });
      res.json(layaway);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  addPayment: async (req: Request, res: Response) => {
    try {
      const { amount, scheduleId } = req.body;
      const layaway = await Layaway.findById(req.params.id);
      if (!layaway) return res.status(404).json({ message: 'Layaway plan not found' });

      const payment = (layaway.schedule as any).id(scheduleId);
      if (!payment) return res.status(404).json({ message: 'Payment schedule item not found' });
      
      payment.paid = true;
      payment.paidAt = new Date();
      layaway.depositPaid += amount;
      layaway.remainingBalance -= amount;

      if (layaway.remainingBalance <= 0) {
        layaway.status = 'completed';
      }

      await layaway.save();
      res.json(layaway);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  cancel: async (req: Request, res: Response) => {
    try {
      const layaway = await Layaway.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
      if (!layaway) return res.status(404).json({ message: 'Layaway plan not found' });
      res.json(layaway);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
