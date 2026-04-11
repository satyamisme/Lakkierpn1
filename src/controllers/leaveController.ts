import { Request, Response } from 'express';
import LeaveRequest from '../models/LeaveRequest.js';

export const leaveController = {
  create: async (req: Request, res: Response) => {
    try {
      const leave = new LeaveRequest({
        ...req.body,
        userId: (req as any).user.id
      });
      await leave.save();
      res.status(201).json(leave);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const leaves = await LeaveRequest.find().populate('userId', 'name role');
      res.json(leaves);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  approve: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const leave = await LeaveRequest.findByIdAndUpdate(
        req.params.id,
        { status, approvedBy: (req as any).user.id },
        { new: true }
      );
      if (!leave) return res.status(404).json({ message: 'Leave request not found' });
      res.json(leave);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
