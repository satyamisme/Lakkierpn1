import { Request, Response } from 'express';
import ComplianceLog from '../models/ComplianceLog.js';

export const complianceController = {
  createLog: async (req: Request, res: Response) => {
    try {
      const { type, data } = req.body;
      const log = new ComplianceLog({
        type,
        data,
        generatedBy: (req as any).user.id
      });
      await log.save();
      res.status(201).json(log);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getLogs: async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string;
      const filter = type ? { type } : {};
      const logs = await ComplianceLog.find(filter).sort({ createdAt: -1 }).populate('generatedBy', 'name');
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getLogById: async (req: Request, res: Response) => {
    try {
      const log = await ComplianceLog.findById(req.params.id).populate('generatedBy', 'name');
      if (!log) return res.status(404).json({ message: 'Compliance log not found' });
      res.json(log);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  generateZReport: async (req: Request, res: Response) => {
    try {
      // Logic to generate Z-Report would go here
      const data = {
        totalSales: 5000,
        totalRefunds: 200,
        netSales: 4800,
        taxCollected: 400,
        cashInDrawer: 5200
      };
      
      const log = new ComplianceLog({
        type: 'zreport',
        data,
        generatedBy: (req as any).user.id
      });
      
      await log.save();
      res.status(201).json(log);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  exportTaxReport: async (req: Request, res: Response) => {
    try {
      // Logic to export tax report would go here
      res.json({ message: 'Tax report exported successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  checkImei: async (req: Request, res: Response) => {
    try {
      const { imei } = req.params;
      // Search for any flags in ComplianceLog
      const flag = await ComplianceLog.findOne({ 
        'data.imei': imei, 
        type: { $in: ['blacklist', 'rma', 'fraud'] } 
      });
      
      res.json({ 
        isFlagged: !!flag,
        flagReason: flag ? flag.type : null
      });
    } catch (error: any) {
      res.status(500).json({ isFlagged: false });
    }
  }
};
