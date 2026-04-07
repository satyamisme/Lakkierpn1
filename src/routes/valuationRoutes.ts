import express from 'express';
import Product from '../models/Product.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /fifo-value (ID 141) – calculates inventory value using FIFO method
router.get('/fifo-value', authenticate, requirePermission(141), async (req, res) => {
  try {
    const products = await Product.find();
    let totalValue = 0;
    
    // Simplified FIFO: Using current cost * stock
    // In real app, we'd iterate through purchase order history
    products.forEach(p => {
      totalValue += (p.cost || 0) * (p.stock || 0);
    });
    
    res.json({ totalValue, currency: 'KD' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate valuation' });
  }
});

export default router;
