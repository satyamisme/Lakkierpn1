import { Request, Response } from 'express';
import Product from '../models/Product.js';

export const attributeController = {
  getAttributeSuggestions: async (req: Request, res: Response) => {
    const { field } = req.query; // brand, color, storage, category
    try {
      if (!field) return res.status(400).json({ error: 'Field required' });
      
      // Collect unique values existing in the DB to suggest to the user
      const suggestions = await Product.distinct(field as string);
      res.json(suggestions || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
