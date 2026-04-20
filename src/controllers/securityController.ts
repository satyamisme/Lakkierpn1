import { Request, Response } from 'express';
import SecurityConfig from '../models/SecurityConfig.js';

export const securityController = {
  getTerminalPin: async (req: Request, res: Response) => {
    try {
      let config = await SecurityConfig.findOne({ configKey: 'terminal_purge_pin' });
      if (!config) {
        // Initialize with default if not present
        config = await SecurityConfig.create({ 
          configKey: 'terminal_purge_pin', 
          configValue: '1212' 
        });
      }
      res.json({ pin: config.configValue });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateTerminalPin: async (req: Request, res: Response) => {
    try {
      const { newPin } = req.body;
      if (!newPin || newPin.length < 4) {
        return res.status(400).json({ error: 'PIN must be at least 4 digits' });
      }

      const config = await SecurityConfig.findOneAndUpdate(
        { configKey: 'terminal_purge_pin' },
        { 
          configValue: newPin,
          updatedBy: (req as any).user?.id
        },
        { upsert: true, new: true }
      );

      res.json({ success: true, message: 'Terminal Security PIN updated successfully', pin: config.configValue });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
