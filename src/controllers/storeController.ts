import { Request, Response } from 'express';
import Store from '../models/Store.js';
import StoreProfile from '../models/StoreProfile.js';
import Product from '../models/Product.js';

export const storeController = {
  create: async (req: Request, res: Response) => {
    try {
      const store = new Store(req.body);
      await store.save();
      res.status(201).json(store);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const stores = await Store.find().populate('managerId', 'name email');
      res.json(stores);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const store = await Store.findById(req.params.id).populate('managerId', 'name email');
      if (!store) return res.status(404).json({ message: 'Store not found' });
      res.json(store);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!store) return res.status(404).json({ message: 'Store not found' });
      res.json(store);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      // Soft delete with inventory check
      // Check if there are products associated with this store (if we had a storeId in Product)
      // For now, we'll just check if the store exists and mark as inactive
      const store = await Store.findById(req.params.id);
      if (!store) return res.status(404).json({ message: 'Store not found' });

      // In a real multi-store ERP, we'd check Product.find({ storeId: store._id, stock: { $gt: 0 } })
      // Since our current Product model doesn't have storeId, we'll just deactivate
      store.status = 'inactive';
      await store.save();
      
      res.json({ message: 'Store deactivated successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getProfile: async (req: Request, res: Response) => {
    try {
      let profile = await StoreProfile.findOne();
      if (!profile) {
        profile = new StoreProfile({
          name: "Main Store",
          address: "Kuwait City",
          location: { latitude: 29.3759, longitude: 47.9774 }
        });
        await profile.save();
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    try {
      const profile = await StoreProfile.findOneAndUpdate({}, req.body, { new: true, upsert: true });
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
