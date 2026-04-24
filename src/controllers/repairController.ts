import { Request, Response } from 'express';
import Repair from '../models/Repair.js';

export const repairController = {
  getAllRepairs: async (req: Request, res: Response) => {
    try {
      const repairs = await Repair.find()
        .populate('customerId')
        .populate('technicianId')
        .populate('partsConsumed.productId')
        .sort({ createdAt: -1 });
      res.json(repairs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createRepair: async (req: Request, res: Response) => {
    try {
      // Logic ID 212: Generate Sequential Repair ID
      const count = await Repair.countDocuments();
      const repairNumber = `REP-${(count + 1).toString().padStart(6, '0')}`;
      
      // Automatic Workload Balancing (Logic ID 82)
      let autoTechnicianId = req.body.technicianId;
      if (!autoTechnicianId) {
        // Find technician with least active repairs
        const techLoads = await Repair.aggregate([
          { $match: { status: { $nin: ['collected', 'cancelled'] } } },
          { $group: { _id: '$technicianId', count: { $sum: 1 } } },
          { $sort: { count: 1 } }
        ]);
        if (techLoads.length > 0 && techLoads[0]._id) {
          autoTechnicianId = techLoads[0]._id;
        }
      }

      const repair = new Repair({
        ...req.body,
        repairNumber,
        technicianId: autoTechnicianId
      });
      await repair.save();
      res.status(201).json(repair);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateRepair: async (req: Request, res: Response) => {
    try {
      const repair = await Repair.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!repair) return res.status(404).json({ error: 'Repair not found' });
      res.json(repair);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getRepairById: async (req: Request, res: Response) => {
    try {
      const repair = await Repair.findById(req.params.id)
        .populate('customerId')
        .populate('technicianId')
        .populate('partsConsumed.productId');
      if (!repair) return res.status(404).json({ error: 'Repair not found' });
      res.json(repair);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
