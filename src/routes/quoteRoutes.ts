import express from 'express';
import Quote from '../models/Quote.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// POST / (create quote)
router.post('/', async (req, res) => {
  try {
    const { items, subtotal, discount, total, customerId } = req.body;
    const quoteNumber = 'QT-' + Date.now().toString().slice(-6);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days expiry

    const quote = new Quote({
      items,
      subtotal,
      discount,
      total,
      customerId,
      quoteNumber,
      expiryDate
    });

    await quote.save();
    res.status(201).json(quote);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create quote' });
  }
});

// GET / (list quotes)
router.get('/', async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

export default router;
