import express from 'express';
import Product from '../models/Product.js';
import Transfer from '../models/Transfer.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /low-stock (ID 125)
router.get('/low-stock', authenticate, requirePermission(125), async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lte: 5 } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch low stock' });
  }
});

// POST /transfers (request, requires 122)
router.post('/transfers', authenticate, requirePermission(122), async (req, res) => {
  try {
    const transfer = new Transfer({ ...req.body, requestedBy: (req as any).user.id });
    await transfer.save();
    res.status(201).json(transfer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to request transfer' });
  }
});

// PATCH /transfers/:id/ship (requires 123)
router.patch('/transfers/:id/ship', authenticate, requirePermission(123), async (req, res) => {
  try {
    const transfer = await Transfer.findByIdAndUpdate(req.params.id, { 
      status: 'shipped', 
      shippedBy: (req as any).user.id 
    }, { new: true });
    res.json(transfer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to ship transfer' });
  }
});

// PATCH /transfers/:id/receive (requires 124, updates stock)
router.patch('/transfers/:id/receive', authenticate, requirePermission(124), async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ error: 'Transfer not found' });
    
    // Update stock for each item
    for (const item of transfer.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    
    transfer.status = 'received';
    transfer.receivedBy = (req as any).user.id;
    await transfer.save();
    
    res.json(transfer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to receive transfer' });
  }
});

// GET /global-stock (ID 121) – returns stock across all stores
router.get('/global-stock', authenticate, requirePermission(121), async (req, res) => {
  try {
    // In a multi-store setup, we'd aggregate across store collections
    // For now, return all products with store context
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global stock' });
  }
});

export default router;
