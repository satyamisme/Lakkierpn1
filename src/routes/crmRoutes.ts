import express from 'express';
import Customer from '../models/Customer.js';
import LoyaltyTransaction from '../models/LoyaltyTransaction.js';
import BopisOrder from '../models/BopisOrder.js';
import Sale from '../models/Sale.js';
import Repair from '../models/Repair.js';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/customers/search (by phone)
router.get('/customers/search', authenticate, async (req, res) => {
  try {
    const { phone } = req.query;
    const customers = await Customer.find({ phone: new RegExp(phone as string, 'i') });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// POST /api/customers (create/update)
router.post('/customers', authenticate, async (req, res) => {
  try {
    const { phone, name, email, consentMarketing, birthday } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { phone },
      { name, email, consentMarketing, birthday },
      { upsert: true, new: true }
    );
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save customer' });
  }
});

// POST /api/loyalty/accrue (ID 18)
router.post('/loyalty/accrue', authenticate, requirePermission(18), async (req, res) => {
  try {
    const { customerId, saleId, amount } = req.body;
    const points = Math.floor(amount); // 1 KD = 1 Point
    
    const transaction = new LoyaltyTransaction({
      customerId,
      saleId,
      pointsEarned: points,
      reason: 'Sale Accrual'
    });
    await transaction.save();
    
    await Customer.findByIdAndUpdate(customerId, { 
      $inc: { loyaltyPoints: points, totalSpent: amount } 
    });
    
    res.json({ pointsEarned: points });
  } catch (error) {
    res.status(500).json({ error: 'Loyalty accrual failed' });
  }
});

// POST /api/loyalty/redeem (ID 19)
router.post('/loyalty/redeem', authenticate, requirePermission(19), async (req, res) => {
  try {
    const { customerId, points } = req.body;
    const customer = await Customer.findById(customerId);
    
    if (!customer || customer.loyaltyPoints < points) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    const transaction = new LoyaltyTransaction({
      customerId,
      pointsRedeemed: points,
      reason: 'Sale Redemption'
    });
    await transaction.save();
    
    await Customer.findByIdAndUpdate(customerId, { $inc: { loyaltyPoints: -points } });
    
    res.json({ redeemed: true, discount: points * 0.1 }); // 10 Points = 1 KD
  } catch (error) {
    res.status(500).json({ error: 'Loyalty redemption failed' });
  }
});

// POST /api/bopis (ID 241)
router.post('/bopis', authenticate, requirePermission(241), async (req, res) => {
  try {
    const bopis = new BopisOrder({
      ...req.body,
      orderId: 'BOPIS-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      pickupDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    });
    await bopis.save();
    res.status(201).json(bopis);
  } catch (error) {
    res.status(500).json({ error: 'BOPIS order failed' });
  }
});

// GET /api/customer/:id/360 (ID 256)
router.get('/customer/:id/360', authenticate, requirePermission(256), async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    const sales = await Sale.find({ customerId: req.params.id }).sort({ createdAt: -1 });
    const repairs = await Repair.find({ customerPhone: customer?.phone }).sort({ createdAt: -1 });
    const loyalty = await LoyaltyTransaction.find({ customerId: req.params.id }).sort({ createdAt: -1 });
    
    res.json({
      customer,
      history: {
        sales,
        repairs,
        loyalty
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer 360' });
  }
});

export default router;
