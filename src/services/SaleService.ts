import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import Inventory from '../models/Inventory.js';
import SerialNumber from '../models/Imei.js';
import ImeiReservation from '../models/ImeiReservation.js';
import Customer from '../models/Customer.js';
import LoyaltyTransaction from '../models/LoyaltyTransaction.js';
import ImeiHistory from '../models/ImeiHistory.js';

export class SaleService {
  static async processSale(payload: any, userId: string) {
    const { items, payments, total, status, customerId, storeId } = payload;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Stock & Integrity Validations
      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) throw new Error(`Product mapping failed for ${item.productId}`);

        if (status === 'completed') {
           const invQuery = item.variantId 
            ? { variantId: item.variantId, storeId }
            : { productId: item.productId, storeId };
            
          const inventory = await Inventory.findOne(invQuery).session(session);
          if (!inventory || inventory.quantity < item.quantity) {
             throw new Error(`Inventory Depleted: ${product.name} at specified store.`);
          }
        }

        if (item.imei) {
          const serialDoc = await SerialNumber.findOne({ identifier: item.imei }).session(session);
          if (!serialDoc || (serialDoc.status !== 'in_stock' && status === 'completed')) {
             throw new Error(`Serial Conflict: ${item.imei} status is ${serialDoc?.status || 'missing'}`);
          }
        }
      }

      // 2. Financial Clearing
      const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (status === 'completed' && Math.abs(totalPaid - total) > 0.001) {
        throw new Error("Financial Mismatch: Payment != Total");
      }

      // 3. Immutable Transaction Record
      const saleNumber = 'INV-' + Date.now().toString().slice(-8);
      const sale = new Sale({
        ...payload,
        saleNumber,
        userId
      });
      await sale.save({ session });

      if (status === 'completed') {
        // 4. Atomic Stock Depletion
        for (const item of items) {
          const invQuery = item.variantId 
            ? { variantId: item.variantId, storeId }
            : { productId: item.productId, storeId };

          await Inventory.findOneAndUpdate(invQuery, { $inc: { quantity: -item.quantity, version: 1 } }).session(session);
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } }).session(session);
          if (item.variantId) {
            await Variant.findByIdAndUpdate(item.variantId, { $inc: { stock: -item.quantity } }).session(session);
          }

          if (item.imei) {
            await SerialNumber.findOneAndUpdate(
              { identifier: item.imei },
              { $set: { status: 'sold', soldAt: new Date(), customerId } }
            ).session(session);
            
            await new ImeiHistory({
              imei: item.imei,
              eventType: 'sold',
              referenceId: sale._id,
              userId
            }).save({ session });
          }
        }

        // 5. Loyalty Accrual
        if (customerId) {
          const points = Math.floor(total);
          await Customer.findByIdAndUpdate(customerId, { 
            $inc: { loyaltyPoints: points, totalSpent: total } 
          }).session(session);
        }
      }

      await session.commitTransaction();
      return sale;
    } catch (error: any) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
