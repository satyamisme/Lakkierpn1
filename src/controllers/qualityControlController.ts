import { Request, Response } from 'express';
import QualityControlInspection from '../models/QualityControlInspection.js';

export const qualityControlController = {
  create: async (req: Request, res: Response) => {
    try {
      const inspection = new QualityControlInspection({
        ...req.body,
        inspectorId: (req as any).user.id
      });
      await inspection.save();
      res.status(201).json(inspection);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const inspections = await QualityControlInspection.find().sort({ createdAt: -1 }).populate('inspectorId', 'name');
      res.json(inspections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const inspection = await QualityControlInspection.findById(req.params.id).populate('inspectorId', 'name');
      if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
      res.json(inspection);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const inspection = await QualityControlInspection.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
      res.json(inspection);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const inspection = await QualityControlInspection.findByIdAndDelete(req.params.id);
      if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
      res.json({ message: 'Inspection deleted' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
