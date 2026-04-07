import express from 'express';
import Product from '../models/Product.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET / (all products)
router.get('/', authenticate, requirePermission(121), async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST / (create product) - requires permission 1
router.post('/', authenticate, requirePermission(1), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PATCH /:id/stock (update stock) - requires permission 132
router.patch('/:id/stock', authenticate, requirePermission(132), async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// GET /low-stock?threshold=5 - requires permission 125
router.get('/low-stock', authenticate, requirePermission(125), async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 5;
    const products = await Product.find({ stock: { $lte: threshold } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// GET /search?q=...
router.get('/search', authenticate, async (req, res) => {
  try {
    const query = req.query.q as string;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
