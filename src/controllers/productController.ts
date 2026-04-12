import { Request, Response } from 'express';
import Product from '../models/Product.js';
import Imei from '../models/Imei.js';

export const productController = {
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : null;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = page ? (page - 1) * limit : 0;

      if (page) {
        const products = await Product.find().skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await Product.countDocuments();
        return res.json({
          products,
          total,
          page,
          pages: Math.ceil(total / limit)
        });
      } else {
        const products = await Product.find().sort({ createdAt: -1 });
        return res.json(products);
      }
    } catch (error: any) {
      console.error("GetAllProducts error:", error);
      res.status(500).json({ error: 'Failed to fetch products', details: error.message });
    }
  },

  getProductById: async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (error: any) {
      console.error("GetProductById error:", error);
      res.status(500).json({ error: 'Failed to fetch product', details: error.message });
    }
  },

  createProduct: async (req: Request, res: Response) => {
    try {
      const { sku } = req.body;
      const existing = await Product.findOne({ sku });
      if (existing) {
        return res.status(409).json({ error: `Product with SKU ${sku} already exists.` });
      }
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Create product error:", error);
      res.status(500).json({ error: error.message || 'Failed to create product' });
    }
  },

  updateProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  deleteProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
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
      const products = await Product.find({ stock: { $lte: threshold } });
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch low stock products' });
    }
  },

  searchProducts: async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        const products = await Product.find().limit(20);
        return res.json(products);
      }
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } }
        ]
      }).limit(50);
      res.json(products);
    } catch (error: any) {
      console.error("SearchProducts error:", error);
      res.status(500).json({ error: 'Search failed', details: error.message });
    }
  }
};
