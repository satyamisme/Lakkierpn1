import express from 'express';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Imei from '../models/Imei.js';
import ImeiReservation from '../models/ImeiReservation.js';
import Customer from '../models/Customer.js';
import { sendTemplate } from '../services/whatsappService.js';
import mongoose from 'mongoose';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST / (create sale) - requires permission 1
router.post('/', authenticate, requirePermission(1), async (req, res) => {
  try {
    const { items, payments, subtotal, discount, total, status, sessionId, customerId, storeId } = req.body;
    console.log(`Processing sale: ${status}, Total: ${total}`);
    
    // 0. Validate IMEI and Stock for products
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.isImeiRequired && !item.imei) {
        throw new Error(`IMEI required for product: ${product.name}`);
      }
      if (item.imei) {
        const imeiDoc = await Imei.findOne({ imei: item.imei, productId: item.productId });
        if (!imeiDoc) {
          throw new Error(`IMEI ${item.imei} not found in system for this product.`);
        }
        if (imeiDoc.status !== 'in_stock' && status === 'completed') {
          throw new Error(`IMEI ${item.imei} is not available (Status: ${imeiDoc.status})`);
        }
      }
      if (status === 'completed') {
        const inventory = await Inventory.findOne({ productId: item.productId, storeId });
        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name} at this store.`);
        }
      }
    }

    // 1. Validate total payments equals sale total
    if (status === 'completed') {
      const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (Math.abs(totalPaid - total) > 0.001) {
        return res.status(400).json({ error: `Payment mismatch: Total paid (${totalPaid.toFixed(3)}) must equal sale total (${total.toFixed(3)})` });
      }
    }

    // 2. Process payments (Store Credit, Card simulation)
    for (const p of payments) {
      if (p.method === 'store_credit' && customerId) {
        const customer = await Customer.findById(customerId);
        if (!customer || customer.storeCredit < p.amount) {
          throw new Error('Insufficient store credit');
        }
        customer.storeCredit -= p.amount;
        await customer.save();
      }
    }

    // 3. Create Sale record
    const saleNumber = 'INV-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
    const sale = new Sale({ items, payments, subtotal, discount, total, status, sessionId, customerId, storeId, saleNumber });
    await sale.save();
    
    if (status === 'completed') {
      // 4. Deduct stock and mark IMEIs as sold
      for (const item of items) {
        // FIX: 1A - Atomic stock deduction
        const inventory = await Inventory.findOne({ productId: item.productId, storeId });
        const currentVersion = inventory ? inventory.version : 0;
        
        const result = await Inventory.findOneAndUpdate(
          { 
            productId: item.productId, 
            storeId, 
            quantity: { $gte: item.quantity }, 
            version: currentVersion 
          },
          { 
            $inc: { quantity: -item.quantity, version: 1 } 
          },
          { new: true }
        );

        if (!result) {
          throw new Error(`Stock changed or insufficient for product: ${item.productId}. Please refresh cart.`);
        }

        // Also update global product stock for backward compatibility/reporting
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        
        if (item.imei) {
          await Imei.findOneAndUpdate(
            { imei: item.imei },
            { status: 'sold', soldAt: new Date(), customerId }
          );
          // FIX: 1B - Delete reservation
          await ImeiReservation.deleteOne({ imei: item.imei });
        }
      }

      // 5. WhatsApp Receipt (ID 24)
      if (customerId) {
        const customer = await Customer.findById(customerId);
        if (customer?.whatsappOptIn && customer.phone) {
          try {
            await sendTemplate(customer.phone, 'receipt', { 
              amount: total.toString(),
              receiptUrl: `${process.env.APP_URL}/receipt/${sale._id}`
            });
          } catch (e) {
            console.error("WhatsApp notification failed:", e);
          }
        }
      }
    }
    
    res.status(201).json(sale);
  } catch (error: any) {
    console.error("Sale processing error:", error);
    res.status(500).json({ error: error.message || 'Sale failed' });
  }
});

// GET /held to list all held sales
router.get('/held', authenticate, async (req, res) => {
  try {
    const sales = await Sale.find({ status: 'held' }).sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch held sales' });
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
