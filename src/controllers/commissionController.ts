import { Request, Response } from 'express';
import CommissionRule from '../models/CommissionRule.js';
import CommissionTransaction from '../models/CommissionTransaction.js';

export const commissionController = {
  createRule: async (req: Request, res: Response) => {
    try {
      const rule = new CommissionRule(req.body);
      await rule.save();
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getRules: async (req: Request, res: Response) => {
    try {
      const rules = await CommissionRule.find();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  updateRule: async (req: Request, res: Response) => {
    try {
      const rule = await CommissionRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!rule) return res.status(404).json({ message: 'Commission rule not found' });
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteRule: async (req: Request, res: Response) => {
    try {
      const rule = await CommissionRule.findByIdAndDelete(req.params.id);
      if (!rule) return res.status(404).json({ message: 'Commission rule not found' });
      res.json({ message: 'Commission rule deleted' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getTransactions: async (req: Request, res: Response) => {
    try {
      const transactions = await CommissionTransaction.find().populate('userId', 'name');
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  calculateCommission: async (req: Request, res: Response) => {
    try {
      const { userId, referenceId, referenceType, amount } = req.body;
      
      // Logic to calculate commission based on rules would go here
      const rule = await CommissionRule.findOne({ userRole: 'salesperson', isActive: true });
      const commissionAmount = amount * (rule ? rule.percentage / 100 : 0.05);
      
      const transaction = new CommissionTransaction({
        userId,
        referenceId,
        referenceType,
        amount: commissionAmount
      });
      
      await transaction.save();
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  payCommission: async (req: Request, res: Response) => {
    try {
      const transaction = await CommissionTransaction.findByIdAndUpdate(req.params.id, { paid: true, paidAt: new Date() }, { new: true });
      if (!transaction) return res.status(404).json({ message: 'Commission transaction not found' });
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
