import express from 'express';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Imei from '../models/Imei.js';
import Customer from '../models/Customer.js';
import { sendTemplate } from '../services/whatsappService.js';
import mongoose from 'mongoose';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST / (create sale) - requires permission 1
router.post('/', authenticate, requirePermission(1), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, payments, subtotal, discount, total, status, sessionId, customerId } = req.body;
    
    // 1. Validate total payments equals sale total
    const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    if (Math.abs(totalPaid - total) > 0.001) {
      return res.status(400).json({ error: 'Payment mismatch: total paid must equal sale total' });
    }

    // 2. Process payments (Store Credit, Card simulation)
    for (const p of payments) {
      if (p.method === 'store_credit' && customerId) {
        const customer = await Customer.findById(customerId).session(session);
        if (!customer || customer.storeCredit < p.amount) {
          throw new Error('Insufficient store credit');
        }
        customer.storeCredit -= p.amount;
        await customer.save({ session });
      } else if (['card', 'knet'].includes(p.method)) {
        // Simulate gateway (ID 237)
        if (!process.env.STRIPE_SECRET_KEY) {
          console.log(`[MOCK GATEWAY] Processing ${p.method} payment of ${p.amount} KD`);
        } else {
          // Real Stripe logic would go here
        }
      }
    }

    // 3. Create Sale record
    const sale = new Sale({ items, payments, subtotal, discount, total, status, sessionId, customerId });
    await sale.save({ session });
    
    if (status === 'completed') {
      // 4. Deduct stock and mark IMEIs as sold
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } }).session(session);
        if (item.imei) {
          await Imei.findOneAndUpdate(
            { imei: item.imei },
            { status: 'sold', soldAt: new Date() }
          ).session(session);
        }
      }

      // 5. WhatsApp Receipt (ID 24)
      if (customerId) {
        const customer = await Customer.findById(customerId).session(session);
        if (customer?.whatsappOptIn && customer.phone) {
          await sendTemplate(customer.phone, 'receipt', { 
            amount: total.toString(),
            receiptUrl: `${process.env.APP_URL}/receipt/${sale._id}`
          });
        }
      }
    }
    
    await session.commitTransaction();
    res.status(201).json(sale);
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message || 'Sale failed' });
  } finally {
    session.endSession();
  }
});

// GET /hold/:sessionId to resume
router.get('/hold/:sessionId', authenticate, async (req, res) => {
  try {
    const sale = await Sale.findOne({ sessionId: req.params.sessionId, status: 'held' });
    if (!sale) return res.status(404).json({ error: 'Held sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch held sale' });
  }
});

// PATCH /:id/void (requires permission 29)
router.patch('/:id/void', authenticate, requirePermission(29), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    
    if (sale.status === 'completed') {
      // Restore stock and IMEI status
      for (const item of sale.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }).session(session);
        if (item.imei) {
          await Imei.findOneAndUpdate(
            { imei: item.imei },
            { status: 'in_stock', $unset: { soldAt: 1 } }
          ).session(session);
        }
      }
    }
    
    sale.status = 'voided';
    await sale.save({ session });
    
    await session.commitTransaction();
    res.json(sale);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Voiding failed' });
  } finally {
    session.endSession();
  }
});

export default router;
