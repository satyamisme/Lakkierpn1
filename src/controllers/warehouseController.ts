import { Request, Response } from 'express';
import WarehouseTask from '../models/WarehouseTask.js';

export const warehouseController = {
  createTask: async (req: Request, res: Response) => {
    try {
      const task = new WarehouseTask(req.body);
      await task.save();
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllTasks: async (req: Request, res: Response) => {
    try {
      const tasks = await WarehouseTask.find().populate('assignedTo', 'name').populate('items.productId', 'name sku binLocation');
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getTaskById: async (req: Request, res: Response) => {
    try {
      const task = await WarehouseTask.findById(req.params.id).populate('assignedTo', 'name').populate('items.productId', 'name sku binLocation');
      if (!task) return res.status(404).json({ message: 'Warehouse task not found' });
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  updateTaskStatus: async (req: Request, res: Response) => {
    try {
      const { status, scannedQuantity, productId } = req.body;
      const task = await WarehouseTask.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Warehouse task not found' });

      if (status) task.status = status;
      if (productId && scannedQuantity !== undefined) {
        const item = task.items.find(i => i.productId.toString() === productId);
        if (item) item.scannedQuantity = scannedQuantity;
      }

      if (task.status === 'completed') {
        task.completedAt = new Date();
      }

      await task.save();
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  assignTask: async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const task = await WarehouseTask.findByIdAndUpdate(req.params.id, { assignedTo: userId, status: 'in_progress' }, { new: true });
      if (!task) return res.status(404).json({ message: 'Warehouse task not found' });
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getPickingLists: async (req: Request, res: Response) => {
    try {
      const tasks = await WarehouseTask.find({ type: 'picking', status: { $ne: 'completed' } })
        .populate('items.productId', 'name sku binLocation');
      
      const formatted = tasks.map(t => ({
        id: t._id,
        orderId: t.referenceId,
        status: t.status,
        items: t.items.map(i => ({
          productId: i.productId._id,
          name: (i.productId as any).name,
          sku: i.sku,
          quantity: i.quantity,
          location: (i.productId as any).binLocation || 'N/A',
          picked: i.scannedQuantity >= i.quantity
        }))
      }));
      res.json(formatted);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getPackingLists: async (req: Request, res: Response) => {
    try {
      const tasks = await WarehouseTask.find({ type: 'packing', status: { $ne: 'completed' } })
        .populate('items.productId', 'name sku binLocation');
      
      const formatted = tasks.map(t => ({
        id: t._id,
        orderId: t.referenceId,
        status: t.status,
        items: t.items.map(i => ({
          productId: i.productId._id,
          name: (i.productId as any).name,
          sku: i.sku,
          quantity: i.quantity,
          packed: i.scannedQuantity >= i.quantity
        }))
      }));
      res.json(formatted);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  completePicking: async (req: Request, res: Response) => {
    try {
      const task = await WarehouseTask.findByIdAndUpdate(req.params.id, { status: 'completed', completedAt: new Date() }, { new: true });
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  completePacking: async (req: Request, res: Response) => {
    try {
      const task = await WarehouseTask.findByIdAndUpdate(req.params.id, { status: 'completed', completedAt: new Date() }, { new: true });
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
