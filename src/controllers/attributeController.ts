import { Request, Response } from 'express';
import Product from '../models/Product.js';

export const attributeController = {
  getAttributeSuggestions: async (req: Request, res: Response) => {
    const { field } = req.query; // brand, color, storage, simType, condition, ram
    try {
      if (!field) return res.status(400).json({ error: 'Field required' });
      
      const list = await Product.distinct(field as string);
      const defaults: Record<string, string[]> = {
        storage: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '4TB'],
        ram: ['4GB', '8GB', '12GB', '16GB', '32GB', '64GB'],
        simType: ['Physical SIM', 'eSIM', 'Dual Nano', 'Nano+eSIM'],
        condition: ['New', 'Used', 'Open Box'],
        brand: ["Apple", "Samsung", "Huawei", "Xiaomi", "Google", "Oppo", "Vivo"],
        color: ['Black', 'White', 'Silver', 'Gold', 'Titanium Blue', 'Natural Titanium']
      };

      const combined = [...new Set([...(defaults[field as string] || []), ...list])];
      res.json(combined);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
