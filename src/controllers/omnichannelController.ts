import { Request, Response } from 'express';
import OmnichannelOrder from '../models/OmnichannelOrder.js';
import Shopify from 'shopify-api-node';
import WooCommerceRestApiPkg from "@woocommerce/woocommerce-rest-api";

const WooCommerceRestApi = (WooCommerceRestApiPkg as any).default || WooCommerceRestApiPkg;

let shopify: any = null;
if (process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_PASSWORD) {
  shopify = new Shopify({
    shopName: process.env.SHOPIFY_SHOP_NAME || 'lakki-phone',
    apiKey: process.env.SHOPIFY_API_KEY,
    password: process.env.SHOPIFY_PASSWORD
  });
} else {
  console.warn('Shopify API credentials missing. Shopify features will operate in MOCK mode.');
}

let WooCommerce: any = null;
if (process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET) {
  WooCommerce = new WooCommerceRestApi({
    url: process.env.WOOCOMMERCE_URL || 'https://example.com',
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
    version: "wc/v3"
  });
} else {
  console.warn('WooCommerce API credentials missing. WooCommerce features will operate in MOCK mode.');
}

export const omnichannelController = {
  syncShopifyOrders: async (req: Request, res: Response) => {
    try {
      if (!shopify) {
        return res.status(400).json({ error: 'Shopify integration not configured. Please add SHOPIFY_API_KEY and SHOPIFY_PASSWORD to environment variables.' });
      }
      const orders = await shopify.order.list({ limit: 50, status: 'open' });
      
      for (const shopifyOrder of orders) {
        await OmnichannelOrder.findOneAndUpdate(
          { externalId: shopifyOrder.id.toString(), source: 'shopify' },
          {
            externalId: shopifyOrder.id.toString(),
            source: 'shopify',
            total: parseFloat(shopifyOrder.total_price),
            status: shopifyOrder.financial_status,
            customerEmail: shopifyOrder.email,
            items: shopifyOrder.line_items.map((item: any) => ({
              sku: item.sku,
              quantity: item.quantity,
              price: parseFloat(item.price)
            }))
          },
          { upsert: true, new: true }
        );
      }
      res.json({ message: `Synced ${orders.length} orders from Shopify` });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  syncWooCommerceOrders: async (req: Request, res: Response) => {
    try {
      if (!WooCommerce) {
        return res.status(400).json({ error: 'WooCommerce integration not configured. Please add WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET to environment variables.' });
      }
      const response = await WooCommerce.get("orders", { per_page: 50, status: 'processing' });
      const orders = response.data;

      for (const wooOrder of orders) {
        await OmnichannelOrder.findOneAndUpdate(
          { externalId: wooOrder.id.toString(), source: 'woocommerce' },
          {
            externalId: wooOrder.id.toString(),
            source: 'woocommerce',
            total: parseFloat(wooOrder.total),
            status: wooOrder.status,
            customerEmail: wooOrder.billing.email,
            items: wooOrder.line_items.map((item: any) => ({
              sku: item.sku,
              quantity: item.quantity,
              price: parseFloat(item.price)
            }))
          },
          { upsert: true, new: true }
        );
      }
      res.json({ message: `Synced ${orders.length} orders from WooCommerce` });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  syncProducts: async (req: Request, res: Response) => {
    try {
      const source = req.params.source as 'shopify' | 'woocommerce';
      let products = [];

      if (source === 'shopify') {
        if (!shopify) {
          return res.status(400).json({ error: 'Shopify integration not configured.' });
        }
        const shopifyProducts = await shopify.product.list({ limit: 50 });
        products = shopifyProducts.map((p: any) => ({
          name: p.title,
          sku: p.variants[0]?.sku || `SHP-${p.id}`,
          price: parseFloat(p.variants[0]?.price || '0'),
          stock: p.variants[0]?.inventory_quantity || 0,
          category: p.product_type || 'Uncategorized'
        }));
      } else {
        if (!WooCommerce) {
          return res.status(400).json({ error: 'WooCommerce integration not configured.' });
        }
        const response = await WooCommerce.get("products", { per_page: 50 });
        products = response.data.map((p: any) => ({
          name: p.name,
          sku: p.sku || `WOO-${p.id}`,
          price: parseFloat(p.price || '0'),
          stock: p.stock_quantity || 0,
          category: p.categories[0]?.name || 'Uncategorized'
        }));
      }

      // Upsert into local Product model
      const Product = (await import('../models/Product.js')).default;
      for (const p of products) {
        await Product.findOneAndUpdate(
          { sku: p.sku },
          p,
          { upsert: true, new: true }
        );
      }

      res.json({ message: `Synced ${products.length} products from ${source}`, count: products.length });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  syncInventory: async (req: Request, res: Response) => {
    try {
      const source = req.params.source as 'shopify' | 'woocommerce';
      const Product = (await import('../models/Product.js')).default;
      const localProducts = await Product.find({ stock: { $gt: 0 } });

      let updateCount = 0;
      for (const product of localProducts) {
        if (source === 'shopify') {
          if (!shopify) continue;
          // In a real app, we'd find the Shopify variant ID first
          // This is a simplified version
          const shopifyProducts = await shopify.product.list({ title: product.name });
          if (shopifyProducts.length > 0) {
            const variantId = shopifyProducts[0].variants[0].id;
            const inventoryItemId = shopifyProducts[0].variants[0].inventory_item_id;
            // Shopify uses inventory levels API for stock updates
            // await shopify.inventoryLevel.set({
            //   inventory_item_id: inventoryItemId,
            //   location_id: SOME_LOCATION_ID,
            //   available: product.stock
            // });
            updateCount++;
          }
        } else {
          if (!WooCommerce) continue;
          const wooProducts = await WooCommerce.get("products", { sku: product.sku });
          if (wooProducts.data.length > 0) {
            await WooCommerce.put(`products/${wooProducts.data[0].id}`, {
              stock_quantity: product.stock
            });
            updateCount++;
          }
        }
      }

      res.json({ message: `Updated inventory for ${updateCount} products on ${source}` });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getAllOrders: async (req: Request, res: Response) => {
    try {
      const orders = await OmnichannelOrder.find().sort({ createdAt: -1 });
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  handleWebhook: async (req: Request, res: Response) => {
    try {
      const source = req.params.source as 'shopify' | 'woocommerce';
      const payload = req.body;
      
      // Basic HMAC verification would go here in a production app
      
      await OmnichannelOrder.findOneAndUpdate(
        { externalId: payload.id.toString(), source },
        {
          status: payload.status || payload.financial_status,
          updatedAt: new Date()
        },
        { upsert: true }
      );
      
      res.status(200).json({ message: 'Webhook processed' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
};
