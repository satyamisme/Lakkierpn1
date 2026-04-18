import express from 'express';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import Inventory from '../models/Inventory.js';
import SerialNumber, { Imei } from '../models/Imei.js';
import ImeiReservation from '../models/ImeiReservation.js';
import Customer from '../models/Customer.js';
import LoyaltyTransaction from '../models/LoyaltyTransaction.js';
import Return from '../models/Return.js';
import ImeiHistory from '../models/ImeiHistory.js';
import { sendTemplate } from '../services/whatsappService.js';
import mongoose from 'mongoose';
import { authenticate, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET / (list sales)
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 50, status } = req.query;
    const query: any = {};
    if (status) query.status = status;
    
    const sales = await Sale.find(query)
      .populate('customerId', 'name phone')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
      
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// GET /search (search sale by number or other criteria)
router.get('/search', authenticate, async (req, res) => {
  try {
    const { number } = req.query;
    if (!number) return res.status(400).json({ error: 'Search term required' });

    const sale = await Sale.findOne({ saleNumber: number })
      .populate('customerId')
      .populate('items.productId')
      .populate('items.variantId');

    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// POST / (create sale) - requires permission 1
router.post('/', authenticate, requirePermission(1), async (req, res) => {
  try {
    const { items, payments, subtotal, discount, total, status, sessionId, customerId, storeId } = req.body;
    
    // 0. Validate IMEI and Stock for products/variants
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      let variant = null;
      if (item.variantId) {
        variant = await Variant.findById(item.variantId);
        if (!variant) throw new Error(`Variant not found: ${item.variantId}`);
      }

      const trackingMethod = variant ? variant.trackingMethod : 'none';
      const requiresImei = trackingMethod === 'imei' || trackingMethod === 'serial';

      if (requiresImei && !item.imei) {
        throw new Error(`Serial/IMEI required for item: ${variant ? Object.values(variant.attributes).join('/') : product.name}`);
      }

      if (item.imei) {
        const serialDoc = await SerialNumber.findOne({ 
          identifier: item.imei, 
          productId: item.productId,
          ...(item.variantId ? { variantId: item.variantId } : {})
        });
        if (!serialDoc) {
          throw new Error(`Serial/IMEI ${item.imei} not found in system for this item.`);
        }
        if (serialDoc.status !== 'in_stock' && status === 'completed') {
          throw new Error(`Serial/IMEI ${item.imei} is not available (Status: ${serialDoc.status})`);
        }
      }

      if (status === 'completed') {
        const inventoryQuery = item.variantId 
          ? { variantId: item.variantId, storeId }
          : { productId: item.productId, storeId };
          
        const inventory = await Inventory.findOne(inventoryQuery);
        if (!inventory || inventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for item at this store.`);
        }
      }
    }

    // 1. Validate total payments equals sale total (unless it's a layaway)
    if (status === 'completed') {
      const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (Math.abs(totalPaid - total) > 0.001) {
        return res.status(400).json({ error: `Payment mismatch: Total paid (${totalPaid.toFixed(3)}) must equal sale total (${total.toFixed(3)})` });
      }
    } else if (status === 'layaway') {
      const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (totalPaid <= 0) {
        return res.status(400).json({ error: 'Down payment required for layaway' });
      }
      if (totalPaid >= total) {
        return res.status(400).json({ error: 'Full payment detected. Use "completed" status instead of "layaway".' });
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
    const sale = new Sale({ 
      items, 
      payments, 
      subtotal, 
      discount, 
      total, 
      status, 
      sessionId, 
      customerId, 
      storeId, 
      saleNumber,
      userId: (req as any).user.id 
    });
    await sale.save();
    
    if (status === 'completed') {
      // 4. Deduct stock and mark IMEIs as sold
      for (const item of items) {
        const inventoryQuery = item.variantId 
          ? { variantId: item.variantId, storeId }
          : { productId: item.productId, storeId };

        const inventory = await Inventory.findOne(inventoryQuery);
        const currentVersion = inventory ? inventory.version : 0;
        
        const result = await Inventory.findOneAndUpdate(
          { 
            ...inventoryQuery,
            quantity: { $gte: item.quantity }, 
            version: currentVersion 
          },
          { 
            $inc: { quantity: -item.quantity, version: 1 } 
          },
          { new: true }
        );

        if (!result) {
          throw new Error(`Stock changed or insufficient for item: ${item.productId}. Please refresh cart.`);
        }

        // Update variant stock if applicable
        if (item.variantId) {
          await Variant.findByIdAndUpdate(item.variantId, { $inc: { stock: -item.quantity } });
        }
        
        // Update global product stock
        const productData = await Product.findById(item.productId);
        if (productData) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
          
          // ID 127: Product Bundling Logic
          if (productData.isBundle && productData.bundledProducts) {
            for (const bundleItem of productData.bundledProducts) {
              const bundleQty = bundleItem.quantity * item.quantity;
              
              const bInvQuery = bundleItem.variantId 
                ? { variantId: bundleItem.variantId, storeId }
                : { productId: bundleItem.productId, storeId };
                
              await Inventory.findOneAndUpdate(bInvQuery, { $inc: { quantity: -bundleQty, version: 1 } });
              if (bundleItem.variantId) {
                await Variant.findByIdAndUpdate(bundleItem.variantId, { $inc: { stock: -bundleQty } });
              }
              await Product.findByIdAndUpdate(bundleItem.productId, { $inc: { stock: -bundleQty } });
            }
          }
        }
        
        if (item.imei) {
          await SerialNumber.findOneAndUpdate(
            { identifier: item.imei },
            { status: 'sold', soldAt: new Date(), customerId }
          );
          await ImeiReservation.deleteOne({ imei: item.imei });

          // Create history record
          await new ImeiHistory({
            imei: item.imei,
            eventType: 'sold',
            referenceId: sale._id,
            userId: (req as any).user.id
          }).save();
        }
      }

      // ID 18: Auto-Accrue Loyalty Points
      if (customerId) {
        const points = Math.floor(total); 
        await Customer.findByIdAndUpdate(customerId, { 
          $inc: { loyaltyPoints: points, totalSpent: total } 
        });
        await new LoyaltyTransaction({
          customerId,
          saleId: sale._id,
          pointsEarned: points,
          reason: 'Sale Accrual'
        }).save();
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
        if (item.variantId) {
          await Variant.findByIdAndUpdate(item.variantId, { $inc: { stock: item.quantity } }).session(session);
        }
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }).session(session);
        
        if (item.imei) {
          await SerialNumber.findOneAndUpdate(
            { identifier: item.imei },
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

// GET /lookup?q=... (lookup sale by receipt or IMEI)
router.get('/lookup', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json(null);

    // Search by saleNumber
    let sale = await Sale.findOne({ saleNumber: q as string }).populate('customerId');
    
    if (!sale) {
      // Search by IMEI in items
      sale = await Sale.findOne({ 'items.imei': q as string }).populate('customerId');
    }

    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// POST /returns (process return) - requires permission 330 (Manager PIN)
router.post('/returns', authenticate, requirePermission(330), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { saleId, items, refundMethod, totalRefund } = req.body;
    
    const sale = await Sale.findById(saleId).session(session);
    if (!sale) throw new Error('Sale not found');

    const returnNumber = 'RET-' + Date.now().toString().slice(-6);
    const returnDoc = new Return({
      returnNumber,
      saleId,
      items,
      totalRefund,
      refundMethod,
      processedBy: (req as any).user.id
    });
    await returnDoc.save({ session });

    for (const item of items) {
      // Update SerialNumber status
      if (item.identifier) {
        const newStatus = item.condition === 'restock' ? 'in_stock' : 'defective';
        await SerialNumber.findOneAndUpdate(
          { identifier: item.identifier },
          { status: newStatus, $unset: { soldAt: 1 } }
        ).session(session);

        // Create history record
        await new ImeiHistory({
          imei: item.identifier,
          eventType: 'returned',
          referenceId: returnDoc._id,
          userId: (req as any).user.id
        }).save({ session });
      }

      // Update stock if restocking
      if (item.condition === 'restock') {
        if (item.variantId) {
          await Variant.findByIdAndUpdate(item.variantId, { $inc: { stock: item.quantity } }).session(session);
        }
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }).session(session);
        
        // Update store inventory
        const inventoryQuery = item.variantId 
          ? { variantId: item.variantId, storeId: sale.storeId }
          : { productId: item.productId, storeId: sale.storeId };
          
        await Inventory.findOneAndUpdate(
          inventoryQuery,
          { $inc: { quantity: item.quantity, version: 1 } }
        ).session(session);
      }
    }

    await session.commitTransaction();
    res.status(201).json(returnDoc);
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Return processing error:", error);
    res.status(500).json({ error: error.message || 'Return failed' });
  } finally {
    session.endSession();
  }
});

export default router;
