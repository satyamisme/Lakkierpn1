import { Request, Response } from 'express';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import SerialNumber, { Imei } from '../models/Imei.js';
import SecurityConfig from '../models/SecurityConfig.js';
import { ProductService } from '../services/ProductService.js';

import Inventory from '../models/Inventory.js';

async function getTerminalPin() {
  const config = await SecurityConfig.findOne({ configKey: 'terminal_purge_pin' });
  return config ? config.configValue : '1212';
}

export const productController = {
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : null;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = page ? (page - 1) * limit : 0;
      const showDeleted = req.query.showDeleted === 'true';

      const query: any = showDeleted 
        ? { deletedAt: { $ne: null } }
        : { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };

      let products;
      let total;

      if (page) {
        products = await Product.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean();
        total = await Product.countDocuments(query);
      } else {
        products = await Product.find(query).sort({ createdAt: -1 }).lean();
        total = products.length;
      }

      const productsWithVariants = await Promise.all(products.map(async (p: any) => {
        const variantQuery = showDeleted 
          ? { productId: p._id, deletedAt: { $ne: null } }
          : { productId: p._id, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };
        
        const [variants, storeInventory] = await Promise.all([
          Variant.find(variantQuery).lean(),
          Inventory.find({ productId: p._id }).lean()
        ]);

        // Attach inventory to variants as well if needed
        const variantsWithInv = variants.map((v: any) => ({
          ...v,
          storeInventory: storeInventory.filter((inv: any) => inv.variantId?.toString() === v._id.toString())
        }));

        return { 
          ...p, 
          variants: variantsWithInv,
          storeInventory: storeInventory.filter((inv: any) => !inv.variantId) 
        };
      }));

      if (page) {
        return res.json({
          products: productsWithVariants,
          total,
          page,
          pages: Math.ceil(total / limit)
        });
      } else {
        return res.json(productsWithVariants);
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch products', details: error.message });
    }
  },

  getProductById: async (req: Request, res: Response) => {
    try {
      const query = { _id: req.params.id, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };
      const product = await Product.findOne(query).lean();
      if (!product) return res.status(404).json({ error: 'Product not found' });
      const variantsQuery = { productId: product._id, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };
      const variants = await Variant.find(variantsQuery).lean();
      res.json({ ...product, variants });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch product', details: error.message });
    }
  },

  createProduct: async (req: Request, res: Response) => {
    try {
      const result = await ProductService.createProduct(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create product' });
    }
  },

  getVariants: async (req: Request, res: Response) => {
    try {
      const variants = await Variant.find({ productId: req.params.id, deletedAt: null });
      res.json(variants);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch variants' });
    }
  },

  getAvailableSerials: async (req: Request, res: Response) => {
    try {
      const serials = await SerialNumber.find({ 
        variantId: req.params.variantId, 
        status: 'in_stock' 
      });
      res.json(serials);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch serials' });
    }
  },

  updateVariant: async (req: Request, res: Response) => {
    try {
      const variant = await Variant.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!variant) return res.status(404).json({ error: 'Variant not found' });
      res.json(variant);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update variant' });
    }
  },

  deleteVariant: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { pin } = req.body;
      const ADMIN_PIN = await getTerminalPin();
      if (pin !== ADMIN_PIN) return res.status(403).json({ error: "INVALID SECURITY PIN" });

      const deleteDate = new Date();
      await Variant.findByIdAndUpdate(id, { $set: { deletedAt: deleteDate } });
      await SerialNumber.updateMany({ variantId: id }, { $set: { deletedAt: deleteDate } });
      res.json({ success: true, message: "Variant moved to Recycle Bin" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  updateProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
      const updateQuery = isAdmin ? { _id: id } : { _id: id, userId: user.id };
      const updated = await Product.findOneAndUpdate(updateQuery, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: "Product not found or unauthorized" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { pin } = req.body;
      const ADMIN_PIN = await getTerminalPin();
      if (pin !== ADMIN_PIN) return res.status(403).json({ error: "INVALID SECURITY PIN" });

      const deleteDate = new Date();
      await Product.findByIdAndUpdate(id, { $set: { deletedAt: deleteDate } });
      await Variant.updateMany({ productId: id }, { $set: { deletedAt: deleteDate } });
      await SerialNumber.updateMany({ productId: id }, { $set: { deletedAt: deleteDate } });
      res.json({ success: true, message: "Asset moved to Recycle Bin" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  restoreProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { pin } = req.body;
      const ADMIN_PIN = await getTerminalPin();
      if (pin !== ADMIN_PIN) return res.status(403).json({ error: "Invalid PIN" });

      await Product.findByIdAndUpdate(id, { $set: { deletedAt: null } });
      await Variant.updateMany({ productId: id }, { $set: { deletedAt: null } });
      await SerialNumber.updateMany({ productId: id }, { $set: { deletedAt: null } });
      res.json({ success: true, message: "Asset restored" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  purgeProductPermanent: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { pin } = req.body;
      const ADMIN_PIN = await getTerminalPin();
      if (pin !== ADMIN_PIN) return res.status(403).json({ error: "Invalid PIN" });

      await Product.findByIdAndDelete(id);
      await Variant.deleteMany({ productId: id });
      await SerialNumber.deleteMany({ productId: id });
      res.json({ success: true, message: "Asset permanently purged" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  bulkDelete: async (req: Request, res: Response) => {
    try {
      const { ids, pin } = req.body;
      const ADMIN_PIN = await getTerminalPin();
      if (pin !== ADMIN_PIN) return res.status(403).json({ error: "Invalid PIN" });
      const deleteDate = new Date();
      await Product.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: deleteDate } });
      await Variant.updateMany({ productId: { $in: ids } }, { $set: { deletedAt: deleteDate } });
      res.json({ success: true, message: `${ids.length} items moved to bin` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  bulkRestore: async (req: Request, res: Response) => {
    try {
      const { ids, pin } = req.body;
      const ADMIN_PIN = await getTerminalPin();
      if (pin !== ADMIN_PIN) return res.status(403).json({ error: "Invalid PIN" });
      await Product.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: null } });
      await Variant.updateMany({ productId: { $in: ids } }, { $set: { deletedAt: null } });
      res.json({ success: true, message: `${ids.length} items restored` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  bulkPurgePermanent: async (req: Request, res: Response) => {
    try {
      const { ids, pin } = req.body;
      const ADMIN_PIN = await getTerminalPin();
      if (pin !== ADMIN_PIN) return res.status(403).json({ error: "Invalid PIN" });
      await Product.deleteMany({ _id: { $in: ids } });
      await Variant.deleteMany({ productId: { $in: ids } });
      res.json({ success: true, message: `${ids.length} items purged` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  bulkUpdatePrice: async (req: Request, res: Response) => {
    try {
      const { ids, percentage } = req.body;
      const factor = 1 + (percentage / 100);
      await Product.updateMany({ _id: { $in: ids } }, [{ $set: { price: { $multiply: ["$price", factor] } } }]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  updateStock: async (req: Request, res: Response) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, { stock: req.body.stock }, { new: true });
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update stock' });
    }
  },

  getLowStock: async (req: Request, res: Response) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 5;
      const products = await Product.find({ stock: { $lte: threshold }, deletedAt: null });
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch low stock products' });
    }
  },

  searchProducts: async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const results = await ProductService.searchAssets(query);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: 'Search failed', details: error.message });
    }
  },
  
  validateSku: async (req: Request, res: Response) => {
    try {
      const { sku } = req.query;
      if (!sku) return res.json({ available: true });
      const existingProduct = await Product.findOne({ sku: sku as string });
      const existingVariant = await Variant.findOne({ sku: sku as string });
      res.json({ available: !existingProduct && !existingVariant });
    } catch (error) {
      res.status(500).json({ error: 'Validation failed' });
    }
  },

  repairDatabase: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { fullPurge, pin } = req.body;
      const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
      if (!isAdmin) return res.status(403).json({ error: "Only admins can perform DB repair" });

      const ADMIN_PIN = await getTerminalPin();
      if (pin !== ADMIN_PIN) return res.status(403).json({ error: "INVALID SECURITY PIN" });

      if (fullPurge === true) {
        await Product.deleteMany({});
        await Variant.deleteMany({});
        await SerialNumber.deleteMany({});
        return res.json({ success: true, message: "DATABASE ATOMIC PURGE COMPLETE" });
      }

      res.json({ success: true, message: "Database Integrity Check Complete" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
