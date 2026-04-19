import { Request, Response } from 'express';
import InventoryForecast from '../models/InventoryForecast.js';

export const inventoryIntelligenceController = {
  getForecast: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const forecast = await InventoryForecast.findOne({ productId }).sort({ generatedAt: -1 });
      if (!forecast) return res.status(404).json({ message: 'Forecast not found for this product' });
      res.json(forecast);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  generateForecast: async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      
      // Logic to generate forecast using historical sales would go here
      const forecast = new InventoryForecast({
        productId,
        predictedDemand: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + (i + 1) * 86400000),
          quantity: Math.floor(Math.random() * 5) + 1 // Dynamic but still simplistic
        })),
        confidence: 0.7
      });
      
      await forecast.save();
      res.status(201).json(forecast);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getStockOptimization: async (req: Request, res: Response) => {
    try {
      const Product = (await import('../models/Product.js')).default;
      const lowStock = await Product.find({ stock: { $lte: 5 }, deletedAt: null }).limit(10);
      const highStock = await Product.find({ stock: { $gte: 100 }, deletedAt: null }).limit(10);
      
      const suggestions = [
        ...lowStock.map(p => ({ productId: p._id, action: 'restock', quantity: 20, reason: `Stock level ${p.stock} below safety threshold` })),
        ...highStock.map(p => ({ productId: p._id, action: 'liquidate', quantity: 10, reason: `Excess inventory for ${p.sku}` }))
      ];

      res.json({ suggestions });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
