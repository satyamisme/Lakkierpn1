import { Request, Response } from 'express';
import HardwareDevice from '../models/HardwareDevice';

export const hardwareController = {
  create: async (req: Request, res: Response) => {
    try {
      const device = new HardwareDevice(req.body);
      await device.save();
      res.status(201).json(device);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const devices = await HardwareDevice.find();
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const device = await HardwareDevice.findById(req.params.id);
      if (!device) return res.status(404).json({ message: 'Hardware device not found' });
      res.json(device);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const device = await HardwareDevice.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!device) return res.status(404).json({ message: 'Hardware device not found' });
      res.json(device);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const device = await HardwareDevice.findByIdAndDelete(req.params.id);
      if (!device) return res.status(404).json({ message: 'Hardware device not found' });
      res.json({ message: 'Hardware device deleted' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  testDevice: async (req: Request, res: Response) => {
    try {
      const device = await HardwareDevice.findById(req.params.id);
      if (!device) return res.status(404).json({ message: 'Hardware device not found' });
      
      // Logic to test device would go here
      device.lastPing = new Date();
      device.isActive = true; // Mocking successful test
      await device.save();
      
      res.json({ status: 'success', device });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
