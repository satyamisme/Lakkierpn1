import express from 'express';
import Return from '../models/Return.js';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import SerialNumber from '../models/Imei.js';
import ImeiHistory from '../models/ImeiHistory.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { saleId, items, refundMethod, totalRefund } = req.body;

    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const returnNumber = `RET-${Math.floor(100000 + Math.random() * 900000)}`;

    const newReturn = new Return({
      returnNumber,
      saleId,
      items,
      totalRefund,
      refundMethod,
      processedBy: (req as any).user.id
    });

    await newReturn.save();

    // Process each item
    for (const item of items) {
      // 1. Restock if condition is restock
      if (item.condition === 'restock') {
        if (item.variantId) {
          await Product.updateOne(
            { 'variants._id': item.variantId },
            { $inc: { 'variants.$.stock': item.quantity } }
          );
        } else {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity }
          });
        }

        // 2. Handle IMEI if applicable
        if (item.identifier) {
          await SerialNumber.findOneAndUpdate(
            { 'imeis.imei': item.identifier },
            { $set: { 'imeis.$.status': 'available' } }
          );

          await new ImeiHistory({
            imei: item.identifier,
            eventType: 'returned',
            referenceId: newReturn._id,
            userId: (req as any).user.id,
            notes: `Returned from Sale ${sale.saleNumber}`
          }).save();
        }
      }
    }

    res.status(201).json(newReturn);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sale/:saleId', authenticate, async (req, res) => {
  try {
    const returns = await Return.find({ saleId: req.params.saleId });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
});

export default router;
