import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const userController = {
  create: async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, permissions, status, storeId } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        permissions,
        status,
        storeId
      });
      await user.save();
      res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, status: user.status });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { password, role, status, storeId, ...updateData } = req.body;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      
      if (status) updateData.status = status;
      if (storeId) updateData.storeId = storeId;
      
      if (role) {
        updateData.role = role;
        // Auto-assign permissions based on role (ID 14)
        switch (role) {
          case 'cashier':
            updateData.permissions = [1, 121];
            break;
          case 'technician':
            updateData.permissions = [61, 67, 71, 88];
            break;
          case 'manager':
            updateData.permissions = [1, 29, 61, 121, 122, 125, 181, 188, 190, 193];
            break;
          case 'superadmin':
            updateData.permissions = [0, ...Array.from({ length: 350 }, (_, i) => i + 1)];
            break;
        }
      }

      const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { newPassword } = req.body;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = await User.findByIdAndUpdate(req.params.id, { password: hashedPassword }, { new: true });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  updateProfile: async (req: any, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const updateData: any = { name, email };
      
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
