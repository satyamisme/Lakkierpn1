import { Request, Response } from 'express';
import CustomerGroup from '../models/CustomerGroup';

export const customerGroupController = {
  create: async (req: Request, res: Response) => {
    try {
      const group = new CustomerGroup(req.body);
      await group.save();
      res.status(201).json(group);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const groups = await CustomerGroup.find().populate('customers', 'name email');
      res.json(groups);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const group = await CustomerGroup.findById(req.params.id).populate('customers', 'name email');
      if (!group) return res.status(404).json({ message: 'Customer group not found' });
      res.json(group);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const group = await CustomerGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!group) return res.status(404).json({ message: 'Customer group not found' });
      res.json(group);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const group = await CustomerGroup.findByIdAndDelete(req.params.id);
      if (!group) return res.status(404).json({ message: 'Customer group not found' });
      res.json({ message: 'Customer group deleted' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  addCustomer: async (req: Request, res: Response) => {
    try {
      const { customerId } = req.body;
      const group = await CustomerGroup.findById(req.params.id);
      if (!group) return res.status(404).json({ message: 'Customer group not found' });
      
      if (!group.customers.includes(customerId)) {
        group.customers.push(customerId);
        await group.save();
      }
      
      res.json(group);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
