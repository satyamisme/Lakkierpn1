import { Request, Response } from 'express';
import InventoryForecast from '../models/InventoryForecast';

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
      
      // Logic to generate forecast using AI/ML would go here
      const forecast = new InventoryForecast({
        productId,
        predictedDemand: [
          { date: new Date(Date.now() + 86400000), quantity: 10 },
          { date: new Date(Date.now() + 172800000), quantity: 12 },
          { date: new Date(Date.now() + 259200000), quantity: 8 }
        ],
        confidence: 0.85
      });
      
      await forecast.save();
      res.status(201).json(forecast);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getStockOptimization: async (req: Request, res: Response) => {
    try {
      // Logic to get stock optimization suggestions would go here
      res.json({
        suggestions: [
          { productId: 'mock-id-1', action: 'restock', quantity: 50, reason: 'High predicted demand' },
          { productId: 'mock-id-2', action: 'liquidate', quantity: 20, reason: 'Low turnover rate' }
        ]
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
