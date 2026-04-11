import { Request, Response } from 'express';
import RmaReturn from '../models/RmaReturn.js';

export const rmaController = {
  create: async (req: Request, res: Response) => {
    try {
      const rma = new RmaReturn(req.body);
      await rma.save();
      res.status(201).json(rma);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const rmas = await RmaReturn.find().sort({ createdAt: -1 }).populate('customerId', 'name email').populate('originalSaleId');
      res.json(rmas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const rma = await RmaReturn.findById(req.params.id).populate('customerId', 'name email').populate('originalSaleId');
      if (!rma) return res.status(404).json({ message: 'RMA not found' });
      res.json(rma);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const rma = await RmaReturn.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!rma) return res.status(404).json({ message: 'RMA not found' });
      res.json(rma);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const rma = await RmaReturn.findByIdAndDelete(req.params.id);
      if (!rma) return res.status(404).json({ message: 'RMA not found' });
      res.json({ message: 'RMA deleted' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
