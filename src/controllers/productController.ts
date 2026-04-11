import { Request, Response } from 'express';
import Product from '../models/Product.js';

export const productController = {
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  createProduct: async (req: Request, res: Response) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create product' });
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
      const { stock } = req.body;
      const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (error: any) {
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
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } }
        ]
      });
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: 'Search failed' });
    }
  }
};
