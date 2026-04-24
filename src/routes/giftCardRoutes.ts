import express from 'express';
import GiftCard from '../models/GiftCard.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all gift cards
router.get('/', authenticate, async (req, res) => {
  try {
    const cards = await GiftCard.find({ storeId: (req as any).user.storeId }).populate('customerId');
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gift cards' });
  }
});

// GET gift card by code
router.get('/:code', authenticate, async (req, res) => {
  try {
    const card = await GiftCard.findOne({ 
      code: req.params.code, 
      storeId: (req as any).user.storeId,
      status: 'active'
    });
    if (!card) return res.status(404).json({ error: 'Valid gift card not found' });
    
    if (card.expiryDate && new Date() > card.expiryDate) {
      card.status = 'expired';
      await card.save();
      return res.status(400).json({ error: 'Gift card has expired' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gift card' });
  }
});

// CREATE a gift card (Sale of a gift card)
router.post('/', authenticate, async (req, res) => {
  try {
    const { code, initialAmount, expiryDate, customerId } = req.body;
    const balance = initialAmount;
    const newCard = new GiftCard({
      code,
      initialBalance: balance,
      currentBalance: balance,
      expiryDate,
      customerId: customerId || undefined,
      storeId: (req as any).user.storeId
    });
    await newCard.save();
    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create gift card' });
  }
});

// USE a gift card
router.post('/redeem', authenticate, async (req, res) => {
  try {
    const { code, amount } = req.body;
    const card = await GiftCard.findOne({ 
      code, 
      storeId: (req as any).user.storeId,
      status: 'active'
    });
    
    if (!card) return res.status(404).json({ error: 'Valid gift card not found' });
    if (card.currentBalance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    card.currentBalance -= amount;
    if (card.currentBalance === 0) card.status = 'exhausted';
    
    await card.save();
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to redeem gift card' });
  }
});

export default router;
