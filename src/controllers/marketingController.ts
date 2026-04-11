import { Request, Response } from 'express';
import MarketingCampaign from '../models/MarketingCampaign.js';

export const marketingController = {
  create: async (req: Request, res: Response) => {
    try {
      const campaign = new MarketingCampaign(req.body);
      await campaign.save();
      res.status(201).json(campaign);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const campaigns = await MarketingCampaign.find();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const campaign = await MarketingCampaign.findById(req.params.id);
      if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const campaign = await MarketingCampaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const campaign = await MarketingCampaign.findByIdAndDelete(req.params.id);
      if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
      res.json({ message: 'Campaign deleted' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  sendCampaign: async (req: Request, res: Response) => {
    try {
      const campaign = await MarketingCampaign.findById(req.params.id);
      if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
      
      // Logic to send campaign via email/sms/whatsapp would go here
      campaign.status = 'active';
      campaign.sentCount += 100; // Mocking sent count
      await campaign.save();
      
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
