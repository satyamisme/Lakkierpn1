import { Request, Response } from 'express';
import ImeiHistory from '../models/ImeiHistory';

export const imeiTimelineController = {
  getHistory: async (req: Request, res: Response) => {
    try {
      const { imei } = req.params;
      const history = await ImeiHistory.find({ imei })
        .sort({ timestamp: -1 })
        .populate('userId', 'name');
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  addEvent: async (req: Request, res: Response) => {
    try {
      const { imei, eventType, referenceId } = req.body;
      const event = new ImeiHistory({
        imei,
        eventType,
        referenceId,
        userId: (req as any).user.id
      });
      await event.save();
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
