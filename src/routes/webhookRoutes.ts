import { Router, Request, Response } from 'express';
import OmnichannelOrder from '../models/OmnichannelOrder';

const router = Router();

// Shopify Webhook
router.post('/shopify', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    // Basic verification logic would go here (HMAC)
    
    const order = new OmnichannelOrder({
      source: 'shopify',
      externalId: payload.id.toString(),
      customer: {
        name: `${payload.customer?.first_name || ''} ${payload.customer?.last_name || ''}`.trim() || 'Shopify Customer',
        email: payload.customer?.email,
        phone: payload.customer?.phone
      },
      items: payload.line_items.map((item: any) => ({
        productId: null, // Need to map Shopify SKU to internal Product ID
        sku: item.sku,
        name: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price)
      })),
      total: parseFloat(payload.total_price),
      status: 'pending'
    });

    await order.save();
    res.status(200).send('Webhook received');
  } catch (error: any) {
    console.error('Shopify Webhook Error:', error);
    res.status(400).send('Webhook error');
  }
});

// WooCommerce Webhook
router.post('/woocommerce', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const order = new OmnichannelOrder({
      source: 'woocommerce',
      externalId: payload.id.toString(),
      customer: {
        name: `${payload.billing?.first_name || ''} ${payload.billing?.last_name || ''}`.trim() || 'WooCommerce Customer',
        email: payload.billing?.email,
        phone: payload.billing?.phone
      },
      items: payload.line_items.map((item: any) => ({
        productId: null, // Need to map WooCommerce SKU to internal Product ID
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price)
      })),
      total: parseFloat(payload.total),
      status: 'pending'
    });

    await order.save();
    res.status(200).send('Webhook received');
  } catch (error: any) {
    console.error('WooCommerce Webhook Error:', error);
    res.status(400).send('Webhook error');
  }
});

export default router;
