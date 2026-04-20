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

      const query = { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };

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
      const query = { _id: req.params.id, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };
      const product = await Product.findOne(query).lean();
      if (!product) return res.status(404).json({ error: 'Product not found' });
      const variantsQuery = { productId: product._id, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };
      const variants = await Variant.find(variantsQuery).lean();
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
      const user = (req as any).user;
      const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

      // 🛡️ ADMIN OVERRIDE
      if (isAdmin) {
        await Variant.findByIdAndDelete(id);
        await SerialNumber.deleteMany({ variantId: id });
        return res.json({ success: true, message: "Variant Purged by Admin" });
      }

      // Check if variant exists and check ownership if not admin
      const variant = await Variant.findById(id);
      if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

      const product = await Product.findById(variant.productId);
      const userId = user.id || user._id;

      if (!product || (product.userId && product.userId.toString() !== userId?.toString())) {
        return res.status(403).json({ success: false, message: "Unauthorized delete" });
      }

      // Perform HARD DELETE
      await Variant.findByIdAndDelete(id);
      await SerialNumber.deleteMany({ variantId: id });

      res.json({ success: true, message: "Variant permanently removed" });
    } catch (error: any) {
      console.error("Delete variant error:", error);
      res.status(500).json({ success: false, error: error.message });
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
      const { id } = req.params;
      const user = (req as any).user;
      const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
      
      // Bypass ownership for Admins to fix "Unable to Modify" bug
      const updateQuery = isAdmin ? { _id: id } : { _id: id, userId: user.id };
      const updated = await Product.findOneAndUpdate(updateQuery, req.body, { new: true });
      
      if (!updated) {
        return res.status(404).json({ message: "Product not found or unauthorized" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("UpdateProduct error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  deleteProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const userId = user.id || user._id; // Handle both ID formats
      const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

      // 🛡️ ADMIN OVERRIDE: If admin, delete regardless of ownership
      if (isAdmin) {
        await Product.findByIdAndDelete(id);
        await Variant.deleteMany({ productId: id });
        await SerialNumber.deleteMany({ productId: id });
        return res.json({ success: true, message: "Admin Purge Successful" });
      }

      // 👤 OWNER CHECK: For non-admins
      const product = await Product.findById(id);
      if (!product || (product.userId && product.userId.toString() !== userId?.toString())) {
        return res.status(403).json({ success: false, message: "Unauthorized or Product Not Found" });
      }

      await Product.findByIdAndDelete(id);
      await Variant.deleteMany({ productId: id });
      await SerialNumber.deleteMany({ productId: id });
      res.json({ success: true, message: "Owner Delete Successful" });
    } catch (error: any) {
      console.error("Delete product error:", error);
      res.status(500).json({ success: false, error: error.message });
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
  },

  repairDatabase: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { fullPurge } = req.body;
      const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
      if (!isAdmin) return res.status(403).json({ error: "Only admins can perform DB repair" });

      const userId = user.id || user._id;

      if (fullPurge === true) {
        await Product.deleteMany({});
        await Variant.deleteMany({});
        await SerialNumber.deleteMany({});
        return res.json({ success: true, message: "DATABASE ATOMIC PURGE COMPLETE - ALL ITEMS REMOVED" });
      }

      // 1. Permanently remove all items marked with deletedAt
      const productDeletions = await Product.deleteMany({ deletedAt: { $ne: null } });
      const variantDeletions = await Variant.deleteMany({ deletedAt: { $ne: null } });
      const serialDeletions = await SerialNumber.deleteMany({ deletedAt: { $ne: null } });

      // 2. Cleanup orphaned variants and redundant soft-deletes
      const variants = await Variant.find().lean();
      let orphanedVariantsCount = 0;
      for (const v of variants) {
        const p = await Product.findById(v.productId);
        if (!p) {
          await Variant.findByIdAndDelete(v._id);
          orphanedVariantsCount++;
        }
      }

      // 3. Fix missing userId on products (assign to current admin for tracking)
      const missingUserProducts = await Product.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: userId } }
      );

      res.json({
        success: true,
        summary: {
          purgedProducts: productDeletions.deletedCount,
          purgedVariants: variantDeletions.deletedCount,
          purgedSerials: serialDeletions.deletedCount,
          orphanedVariantsRemoved: orphanedVariantsCount,
          productsOwnershipFixed: missingUserProducts.modifiedCount
        }
      });
    } catch (error: any) {
      console.error("Repair DB error:", error);
      res.status(500).json({ error: error.message });
    }
  }
};
