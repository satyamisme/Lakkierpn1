import { Request, Response } from 'express';
import GiftCard from '../models/GiftCard.js';

export const giftCardController = {
  create: async (req: Request, res: Response) => {
    try {
      const { code, amount, expiresAt, issuedTo } = req.body;
      const giftCard = new GiftCard({
        code,
        amount,
        balance: amount,
        expiresAt,
        issuedTo,
        issuedBy: (req as any).user.id
      });
      await giftCard.save();
      res.status(201).json(giftCard);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const giftCards = await GiftCard.find().populate('issuedTo', 'name email').populate('issuedBy', 'name');
      res.json(giftCards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const giftCard = await GiftCard.findById(req.params.id).populate('issuedTo', 'name email').populate('issuedBy', 'name');
      if (!giftCard) return res.status(404).json({ message: 'Gift card not found' });
      res.json(giftCard);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  redeem: async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      const giftCard = await GiftCard.findOne({ code: req.params.code, status: 'active' });
      
      if (!giftCard) return res.status(404).json({ message: 'Valid gift card not found' });
      if (giftCard.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });
      if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
        giftCard.status = 'void';
        await giftCard.save();
        return res.status(400).json({ message: 'Gift card expired' });
      }

      giftCard.balance -= amount;
      if (giftCard.balance === 0) giftCard.status = 'redeemed';
      
      await giftCard.save();
      res.json(giftCard);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  void: async (req: Request, res: Response) => {
    try {
      const giftCard = await GiftCard.findByIdAndUpdate(req.params.id, { status: 'void' }, { new: true });
      if (!giftCard) return res.status(404).json({ message: 'Gift card not found' });
      res.json(giftCard);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
