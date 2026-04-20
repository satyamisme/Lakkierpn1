import { Request, Response } from 'express';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import SerialNumber, { Imei } from '../models/Imei.js';

export const productController = {
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : null;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = page ? (page - 1) * limit : 0;

      let products;
      let total;

      if (page) {
        products = await Product.find({ deletedAt: null }).skip(skip).limit(limit).sort({ createdAt: -1 }).lean();
        total = await Product.countDocuments({ deletedAt: null });
      } else {
        products = await Product.find({ deletedAt: null }).sort({ createdAt: -1 }).lean();
        total = products.length;
      }

      const productsWithVariants = await Promise.all(products.map(async (p: any) => {
        const variants = await Variant.find({ productId: p._id }).lean();
        return { ...p, variants };
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
      console.error("GetAllProducts error:", error);
      res.status(500).json({ error: 'Failed to fetch products', details: error.message });
    }
  },

  getProductById: async (req: Request, res: Response) => {
    try {
      const product = await Product.findOne({ _id: req.params.id, deletedAt: null }).lean();
      if (!product) return res.status(404).json({ error: 'Product not found' });
      const variants = await Variant.find({ productId: product._id, deletedAt: null }).lean();
      res.json({ ...product, variants });
    } catch (error: any) {
      console.error("GetProductById error:", error);
      res.status(500).json({ error: 'Failed to fetch product', details: error.message });
    }
  },

  createProduct: async (req: Request, res: Response) => {
    try {
      const { variants, isConfigurable, attributes, ...baseData } = req.body;
      
      const product = new Product({
        ...baseData,
        isConfigurable: !!isConfigurable,
        attributes: attributes || []
      });
      await product.save();

      const createdVariants = [];
      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const variantData of variants) {
          const variant = new Variant({
            ...variantData,
            productId: product._id
          });
          await variant.save();
          createdVariants.push(variant);
        }
      } else {
        // Create a default variant for simple products
        const variant = new Variant({
          productId: product._id,
          sku: product.sku,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          trackingMethod: product.isImeiRequired ? 'imei' : (product.isSerialRequired ? 'serial' : 'none'),
          binLocation: product.binLocation,
          attributes: {}
        });
        await variant.save();
        createdVariants.push(variant);
      }

      return res.status(201).json({ product, variants: createdVariants });
    } catch (error: any) {
      console.error("Create product error:", error);
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
      
      // Check if variant has associated serials/IMEIs that are sold or not in_stock
      const linkedSerials = await SerialNumber.countDocuments({ 
        variantId: id, 
        status: { $ne: 'in_stock' } 
      });
      
      if (linkedSerials > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete variant with sold or active units. Consider discontinuing instead.' 
        });
      }

      await Variant.findByIdAndUpdate(id, { deletedAt: new Date(), status: 'discontinued' });
      
      // Also soft-delete any in-stock serials
      await SerialNumber.updateMany(
        { variantId: id, status: 'in_stock' },
        { deletedAt: new Date() }
      );

      res.json({ message: 'Variant soft-deleted' });
    } catch (error) {
      console.error("Delete variant error:", error);
      res.status(500).json({ error: 'Failed to delete variant' });
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

  updateProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      // Ownership Logic: Only allow owner or admin (ID 122)
      // Check for user role from the auth middleware
      const user = (req as any).user;
      const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
      
      if (!isAdmin && product.userId && product.userId.toString() !== user.id) {
        return res.status(403).json({ error: 'Access Denied: Not Owner or Admin' });
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (error: any) {
      console.error("UpdateProduct error:", error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  deleteProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Admin check for deletion
      const user = (req as any).user;
      const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
      if (!isAdmin) return res.status(403).json({ error: "Admin access required for product deletion" });

      // Cascade soft-delete to all variants
      await Variant.updateMany(
        { productId: id, deletedAt: null },
        { deletedAt: new Date(), status: 'discontinued' }
      );

      // Cascade soft-delete to in-stock serials
      await SerialNumber.updateMany(
        { productId: id, status: 'in_stock' },
        { deletedAt: new Date() }
      );

      const product = await Product.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json({ message: 'Product and associated variants/serials deleted successfully' });
    } catch (error: any) {
      console.error("Delete product error:", error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  },

  updateStock: async (req: Request, res: Response) => {
    try {
      const { stock, imeiHistory, newSerials } = req.body;
      const updateData: any = { stock };
      if (imeiHistory) updateData.imeiHistory = imeiHistory;
      
      const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!product) return res.status(404).json({ error: 'Product not found' });

      // If new serials are provided, create Imei documents (ID 6)
      if (newSerials && Array.isArray(newSerials)) {
        for (const imei of newSerials) {
          await Imei.findOneAndUpdate(
            { imei },
            { productId: product._id, status: 'in_stock' },
            { upsert: true, new: true }
          );
        }
      }
      
      res.json(product);
    } catch (error: any) {
      console.error("Update stock error:", error);
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
      if (!query) {
        const products = await Product.find({ deletedAt: null }).limit(20).lean();
        const productsWithVariants = await Promise.all(products.map(async (p) => {
          const variants = await Variant.find({ productId: p._id, deletedAt: null }).lean();
          return { ...p, variants };
        }));
        return res.json(productsWithVariants);
      }

      // Identifier-First Search: Check SerialNumber/Imei (ID 319)
      const assetMatches = await SerialNumber.find({
        identifier: query,
        status: 'in_stock'
      }).populate('productId').populate('variantId').lean();

      if (assetMatches.length > 0) {
        return res.json(assetMatches.map(a => ({
          ...((a.variantId as any) || {}),
          _id: (a.variantId as any)?._id || a.productId,
          name: (a.productId as any).name,
          brand: (a.productId as any).brand,
          isVariant: !!a.variantId,
          parentProduct: a.productId,
          imei: a.identifier,
          stock: 1 // for direct match
        })));
      }

      // Search products
      const products = await Product.find({
        deletedAt: null,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } }
        ]
      }).limit(20).lean();

      // Search variants
      const variants = await Variant.find({
        deletedAt: null,
        $or: [
          { sku: { $regex: query, $options: 'i' } },
          { barcode: { $regex: query, $options: 'i' } }
        ]
      }).limit(20).populate('productId').lean();

      // Combine and format for UI
      // If a variant is found, we want to return it as a "sellable item"
      // If a product is found, we might want to return its variants
      
      const results: any[] = [];
      
      // Add variants found directly
      variants.forEach(v => {
        results.push({
          ...v,
          _id: v._id,
          name: (v.productId as any)?.name || 'Unknown Product',
          brand: (v.productId as any)?.brand || '',
          isVariant: true,
          parentProduct: v.productId
        });
      });

      // Add products found directly (if not already represented by variants)
      for (const p of products) {
        const pVariants = await Variant.find({ productId: p._id }).lean();
        if (pVariants.length > 0) {
          pVariants.forEach(v => {
            if (!results.find(r => r._id.toString() === v._id.toString())) {
              results.push({
                ...v,
                _id: v._id,
                name: p.name,
                brand: p.brand,
                isVariant: true,
                parentProduct: p
              });
            }
          });
        } else {
          results.push({
            ...p,
            isVariant: false
          });
        }
      }

      res.json(results);
    } catch (error: any) {
      console.error("SearchProducts error:", error);
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
  }
};
