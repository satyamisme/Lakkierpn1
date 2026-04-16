import { Request, Response } from 'express';
import { skuGenerator } from '../services/skuGenerator.js';

export const skuController = {
  generateSku: async (req: Request, res: Response) => {
    try {
      const { productData, variantAttributes, storeCode } = req.body;
      const sku = await skuGenerator.generateSku(productData, variantAttributes, storeCode);
      res.json({ sku });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate SKU' });
    }
  },

  validateSku: async (req: Request, res: Response) => {
    try {
      const { sku } = req.body;
      const available = await skuGenerator.validateSku(sku);
      res.json({ available });
    } catch (error) {
      res.status(500).json({ error: 'Failed to validate SKU' });
    }
  }
};
