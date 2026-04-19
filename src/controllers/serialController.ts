import { Request, Response } from 'express';
import SerialNumber from '../models/Imei.js';
import Variant from '../models/Variant.js';

export const serialController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const { status, type, variantId, search } = req.query;
      const query: any = { deletedAt: null };
      
      if (status) query.status = status;
      if (type) query.type = type;
      if (variantId) query.variantId = variantId;
      if (search) {
        query.identifier = { $regex: search as string, $options: 'i' };
      }
      
      const serials = await SerialNumber.find(query)
        .populate('productId', 'name brand')
        .populate({
          path: 'variantId',
          select: 'sku attributes'
        })
        .sort({ createdAt: -1 });
        
      res.json(serials);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch serials' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { warrantyExpiry, status, batchNotes, identifier, type } = req.body;
      
      const serial = await SerialNumber.findById(id);
      if (!serial) return res.status(404).json({ error: 'Record not found' });
      
      // If updating identifier, check for uniqueness
      if (identifier && identifier !== serial.identifier) {
        const existing = await SerialNumber.findOne({ identifier, deletedAt: null });
        if (existing) return res.status(400).json({ error: 'Identifier already exists' });
      }

      const updated = await SerialNumber.findByIdAndUpdate(
        id, 
        { warrantyExpiry, status, batchNotes, identifier, type },
        { new: true }
      );
      
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update record' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const serial = await SerialNumber.findById(id);
      if (!serial) return res.status(404).json({ error: 'Record not found' });
      
      if (serial.status !== 'in_stock') {
        return res.status(400).json({ error: 'Only in-stock items can be deleted' });
      }

      await SerialNumber.findByIdAndUpdate(id, { deletedAt: new Date() });
      
      // Update variant stock if necessary
      if (serial.variantId) {
        await Variant.findByIdAndUpdate(serial.variantId, { $inc: { stock: -1 } });
      }

      res.json({ message: 'Record deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete record' });
    }
  },

  validate: async (req: Request, res: Response) => {
    try {
      const { identifier, type } = req.body;
      
      if (!identifier) return res.status(400).json({ error: 'Identifier required' });
      
      // Luhn check for IMEI
      if (type === 'imei') {
        if (!/^\d{15}$/.test(identifier)) {
          return res.json({ valid: false, error: 'IMEI must be 15 digits' });
        }
        
        let sum = 0;
        for (let i = 0; i < 15; i++) {
          let digit = parseInt(identifier[i]);
          if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
        }
        
        if (sum % 10 !== 0) {
          return res.json({ valid: false, error: 'Invalid IMEI checksum (Luhn check failed)' });
        }
      }

      const existing = await SerialNumber.findOne({ identifier, deletedAt: null });
      if (existing) {
        return res.json({ valid: false, error: 'Identifier already recorded in system' });
      }

      res.json({ valid: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Validation failed' });
    }
  }
};
