import express from 'express';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Product from '../models/Product.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/suppliers
router.get('/', authenticate, requirePermission(142), async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// GET /api/suppliers/purchase-orders
router.get('/purchase-orders', authenticate, requirePermission(127), async (req, res) => {
  try {
    const pos = await PurchaseOrder.find().populate('supplierId').sort({ createdAt: -1 });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch POs' });
  }
});

// POST /api/suppliers (requires permission 142)
router.post('/', authenticate, requirePermission(142), async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// GET /api/suppliers/debt (list with outstanding)
router.get('/debt', authenticate, requirePermission(142), async (req, res) => {
  try {
    const suppliers = await Supplier.find({ outstandingDebt: { $gt: 0 } }).sort({ outstandingDebt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supplier debt' });
  }
});

// POST /api/purchase-orders (add landed cost fields)
router.post('/purchase-orders', authenticate, requirePermission(127), async (req, res) => {
  try {
    const { supplierId, items, landedCostBreakdown } = req.body;
    
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitCost), 0);
    const totalLanded = subtotal + 
      (landedCostBreakdown.shipping || 0) + 
      (landedCostBreakdown.customs || 0) + 
      (landedCostBreakdown.insurance || 0);

    const po = new PurchaseOrder({
      supplierId,
      items,
      landedCostBreakdown,
      totalLanded,
      status: 'draft'
    });
    
    await po.save();
    res.status(201).json(po);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create PO' });
  }
});

// PATCH /api/purchase-orders/:id/receive (updates inventory cost using FIFO)
router.patch('/purchase-orders/:id/receive', authenticate, requirePermission(124), async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po || po.status === 'received') return res.status(400).json({ error: 'Invalid PO' });

    // Update stock and costs
    for (const item of po.items) {
      // Landed cost per unit (simplified: distribute landed costs proportionally by value)
      const subtotal = po.items.reduce((sum: number, i: any) => sum + (i.quantity * i.unitCost), 0);
      const landedOverhead = po.totalLanded - subtotal;
      const itemValue = item.quantity * item.unitCost;
      const itemLandedShare = (itemValue / subtotal) * landedOverhead;
      const landedUnitCost = (itemValue + itemLandedShare) / item.quantity;

      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
        $set: { cost: landedUnitCost } // FIFO: simplified to update current cost
      });
    }

    po.status = 'received';
    po.receivedAt = new Date();
    await po.save();

    // Update supplier totals
    await Supplier.findByIdAndUpdate(po.supplierId, {
      $inc: { 
        totalPurchased: po.totalLanded,
        outstandingDebt: po.totalLanded // Assume unpaid initially
      }
    });

    res.json(po);
  } catch (error) {
    res.status(500).json({ error: 'Failed to receive PO' });
  }
});

export default router;
