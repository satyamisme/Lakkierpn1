import { Request, Response } from 'express';
import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import Repair from '../models/Repair.js';

export const customerController = {
// ... existing code ...
  getCustomerSummary: async (req: Request, res: Response) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) return res.status(404).json({ message: 'Customer not found' });

      const [sales, repairs] = await Promise.all([
        Sale.find({ customerId: customer._id }).sort({ createdAt: -1 }),
        Repair.find({ customerId: customer._id }).sort({ createdAt: -1 })
      ]);

      res.json({
        customer,
        sales,
        repairs,
        stats: {
          totalSpend: sales.reduce((sum, s) => sum + s.total, 0),
          repairCount: repairs.length,
          lastVisit: sales[0]?.createdAt || repairs[0]?.createdAt || null
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
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
      const { q } = req.query;
      if (!q) return res.status(400).json({ error: 'Search query parameter (q) is required' });
      const customers = await Customer.find({ 
        $or: [
          { phone: new RegExp(q as string, 'i') },
          { name: new RegExp(q as string, 'i') }
        ]
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
