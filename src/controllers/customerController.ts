import { Request, Response } from 'express';
import Customer from '../models/Customer.js';

export const customerController = {
  create: async (req: Request, res: Response) => {
    try {
      const customer = new Customer(req.body);
      await customer.save();
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const customers = await Customer.find();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  search: async (req: Request, res: Response) => {
    try {
      const { phone } = req.query;
      if (!phone) return res.status(400).json({ error: 'Phone query parameter is required' });
      const customers = await Customer.find({ 
        phone: new RegExp(phone as string, 'i') 
      });
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: 'Search failed' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) return res.status(404).json({ message: 'Customer not found' });
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!customer) return res.status(404).json({ message: 'Customer not found' });
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      // Anonymise for GDPR (ID 231)
      const customer = await Customer.findById(req.params.id);
      if (!customer) return res.status(404).json({ message: 'Customer not found' });

      customer.name = 'Anonymised User';
      customer.phone = `anon_${customer._id}`;
      customer.email = `anon_${customer._id}@anonymised.com`;
      customer.whatsappNumber = undefined;
      customer.birthday = undefined;
      customer.loyaltyPoints = 0;
      customer.storeCredit = 0;
      customer.consentMarketing = false;
      customer.whatsappOptIn = false;

      await customer.save();
      res.json({ message: 'Customer anonymised successfully for GDPR compliance' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};
