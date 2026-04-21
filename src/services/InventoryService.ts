import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import SerialNumber from '../models/Imei.js';
import Inventory from '../models/Inventory.js';
import BatchIntake from '../models/BatchIntake.js';
import ImeiHistory from '../models/ImeiHistory.js';

export class InventoryService {
  /**
   * Process a unified stock intake (Receiving Matrix)
   * Separates Header (Supplier/PO) from Manifest (Items/Serials)
   */
  static async processUnifiedIntake(payload: any, userId: string) {
    const { header, items } = payload;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create BatchIntake Record
      const intake = new BatchIntake({
        month: new Date(header.date || Date.now()).getMonth() + 1,
        year: new Date(header.date || Date.now()).getFullYear(),
        supplierId: header.supplierId,
        targetStoreId: header.storeId,
        notes: header.notes,
        referenceNo: header.referenceNo,
        items: items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          cost: item.costPrice,
          price: item.retailPrice
        }))
      });
      await intake.save({ session });

      for (const item of items) {
        // 2. Global Stock Update
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }).session(session);
        
        if (item.variantId) {
          await Variant.findByIdAndUpdate(item.variantId, { 
            $inc: { stock: item.quantity },
            $set: { cost: item.costPrice, price: item.retailPrice } // Dynamic cost update
          }).session(session);

          // 3. Per-Store Inventory Update
          await Inventory.findOneAndUpdate(
            { variantId: item.variantId, storeId: header.storeId },
            { 
              $inc: { quantity: item.quantity, version: 1 },
              $set: { productId: item.productId }
            },
            { upsert: true, session }
          );
        } else {
          // Simple Product fallback
          await Inventory.findOneAndUpdate(
            { productId: item.productId, storeId: header.storeId, variantId: { $exists: false } },
            { $inc: { quantity: item.quantity, version: 1 } },
            { upsert: true, session }
          );
        }

        // 4. Register Identifiers (IMEIs)
        if (item.serials && Array.isArray(item.serials)) {
          console.log(`Registering ${item.serials.length} serials for product ${item.productId}`);
          
          const serialDocs = item.serials.map((s: string) => ({
            identifier: s,
            productId: item.productId,
            variantId: item.variantId,
            status: 'in_stock',
            storeId: header.storeId,
            receivedFrom: header.supplierId,
            cost: item.costPrice,
            price: item.retailPrice,
            receivedAt: new Date()
          }));

          // Avoid duplicates by using findOneAndUpdate for each or bulkWrite
          // For simplicity and audit requirements, we'll ensure uniqueness
          for (const doc of serialDocs) {
            await SerialNumber.findOneAndUpdate(
              { identifier: doc.identifier },
              { $set: doc },
              { upsert: true, session }
            );

            // 5. Audit History
            await new ImeiHistory({
              imei: doc.identifier,
              eventType: 'purchased',
              referenceId: intake._id,
              userId: userId
            }).save({ session });
          }
        }
      }

      await session.commitTransaction();
      return { success: true, message: "Matrix Receipt Confirmed", intakeId: intake._id };
    } catch (error: any) {
      await session.abortTransaction();
      console.error("Unified Intake Halted:", error);
      throw new Error(error.message);
    } finally {
      session.endSession();
    }
  }
}
