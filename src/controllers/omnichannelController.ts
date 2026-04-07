import { Request, Response } from 'express';
import OmnichannelOrder from '../models/OmnichannelOrder';

export const omnichannelController = {
  createOrder: async (req: Request, res: Response) => {
    try {
      const order = new OmnichannelOrder(req.body);
      await order.save();
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllOrders: async (req: Request, res: Response) => {
    try {
      const orders = await OmnichannelOrder.find().populate('customerId', 'name email');
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getOrderById: async (req: Request, res: Response) => {
    try {
      const order = await OmnichannelOrder.findById(req.params.id).populate('customerId', 'name email');
      if (!order) return res.status(404).json({ message: 'Omnichannel order not found' });
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  updateOrderStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const order = await OmnichannelOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!order) return res.status(404).json({ message: 'Omnichannel order not found' });
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  handleWebhook: async (req: Request, res: Response) => {
    try {
      const source = req.params.source as 'shopify' | 'woocommerce';
      const payload = req.body;
      
      // Logic to handle webhooks from Shopify/WooCommerce would go here
      // This would typically involve creating or updating an OmnichannelOrder
      
      res.status(200).json({ message: 'Webhook received' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
