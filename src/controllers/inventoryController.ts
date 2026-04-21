import { Request, Response } from 'express';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import SerialNumber from '../models/Imei.js';
import InventoryTransfer from '../models/InventoryTransfer.js';
import Inventory from '../models/Inventory.js';
import CycleCount from '../models/CycleCount.js';
import Store from '../models/Store.js';
import mongoose from 'mongoose';

import BatchIntake from '../models/BatchIntake.js';
import ImeiHistory from '../models/ImeiHistory.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import BinLocation from '../models/BinLocation.js';
import Supplier from '../models/Supplier.js';

import { InventoryService } from '../services/InventoryService.js';

export const inventoryController = {
  unifiedIntake: async (req: Request, res: Response) => {
    try {
      const result = await InventoryService.processUnifiedIntake(req.body, (req as any).user.id);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  batchIntake: async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { month, year, supplierId, targetStoreId, notes, items } = req.body;
      
      // Resolve store ID if it's a name
      let resolvedStoreId = targetStoreId;
      if (!mongoose.Types.ObjectId.isValid(targetStoreId)) {
        const store = await Store.findOne({ name: targetStoreId }).session(session);
        if (store) {
          resolvedStoreId = store._id;
        } else {
          // Fallback: create the store if it doesn't exist (for development convenience)
          const newStore = new Store({ 
            name: targetStoreId,
            address: 'Default Address',
            phone: '00000000'
          });
          await newStore.save({ session });
          resolvedStoreId = newStore._id;
        }
      }

      const intake = new BatchIntake({
        month,
        year,
        supplierId,
        targetStoreId: resolvedStoreId.toString(),
        notes,
        items
      });
      await intake.save({ session });

      for (const item of items) {
        // Update variant stock and bin location
        const variantUpdate: any = { $inc: { stock: item.quantity } };
        if (item.binLocation) {
          variantUpdate.$set = { binLocation: item.binLocation };
        }
        
        const variant = await Variant.findByIdAndUpdate(item.productId, variantUpdate, { new: true }).session(session);
        
        if (variant) {
          // Update parent product global stock
          await Product.findByIdAndUpdate(variant.productId, { $inc: { stock: item.quantity } }).session(session);
          
          // Update per-store inventory (using variantId)
          await Inventory.findOneAndUpdate(
            { variantId: variant._id, storeId: resolvedStoreId },
            { 
              $inc: { quantity: item.quantity, version: 1 },
              $set: { productId: variant.productId }
            },
            { upsert: true, session }
          );
        } else {
          // Fallback for simple products without variants (legacy)
          const product = await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }).session(session);
          if (product) {
            await Inventory.findOneAndUpdate(
              { productId: product._id, storeId: resolvedStoreId, variantId: { $exists: false } },
              { $inc: { quantity: item.quantity, version: 1 } },
              { upsert: true, session }
            );
          }
        }

        // Create SerialNumber records if present
        if (item.units && Array.isArray(item.units)) {
          for (const unit of item.units) {
            if (unit.imei || unit.serial || unit.identifier) {
              const identifier = unit.identifier || unit.imei || unit.serial;
              await SerialNumber.findOneAndUpdate(
                { identifier },
                { 
                  variantId: variant ? variant._id : undefined,
                  productId: variant ? variant.productId : item.productId,
                  status: 'in_stock',
                  storeId: resolvedStoreId,
                  cost: unit.cost,
                  price: unit.price,
                  batchPrice: unit.price,
                  landedCost: unit.cost,
                  manufacturingDate: unit.manufacturingDate,
                  warrantyExpiry: unit.warrantyExpiry,
                  batchNotes: notes
                },
                { upsert: true, session }
              );

              // Create history record
              await new ImeiHistory({
                imei: identifier,
                eventType: 'purchased',
                referenceId: intake._id,
                userId: (req as any).user.id
              }).save({ session });
            }
          }
        }
      }

      await session.commitTransaction();
      res.status(201).json(intake);
    } catch (error: any) {
      await session.abortTransaction();
      console.error("Batch intake error:", error);
      res.status(400).json({ error: error.message });
    } finally {
      session.endSession();
    }
  },

  getGlobalStock: async (req: Request, res: Response) => {
    try {
      // Fetch products and their variants
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      const productsWithVariants = await Promise.all(products.map(async (p) => {
        const variants = await Variant.find({ productId: p._id }).lean();
        return { ...p, variants };
      }));
      res.json(productsWithVariants);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getNodeDistribution: async (req: Request, res: Response) => {
    try {
      const stores = await Store.find().lean();
      const distribution = await Promise.all(stores.map(async (store) => {
        const inventory = await Inventory.find({ storeId: store._id });
        const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
        
        // Calculate value
        let totalValue = 0;
        for (const item of inventory) {
          const product = await Product.findById(item.productId);
          if (product) {
            totalValue += item.quantity * product.cost;
          }
        }

        const inTransit = await InventoryTransfer.countDocuments({ 
          toStoreId: store._id.toString(), 
          status: 'shipped' 
        });

        return {
          node: store.name,
          stock: totalStock,
          transit: inTransit,
          value: totalValue,
          status: totalStock > 1000 ? 'Surplus' : totalStock > 100 ? 'Optimal' : 'Low'
        };
      }));

      res.json(distribution);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getLowStock: async (req: Request, res: Response) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 5;
      const lowStockProducts = await Product.find({ stock: { $lte: threshold } });
      res.json(lowStockProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createTransfer: async (req: Request, res: Response) => {
    try {
      const transfer = new InventoryTransfer(req.body);
      await transfer.save();
      res.status(201).json(transfer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  updateTransferStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const updateData: any = { status };
      if (status === 'shipped') updateData.shippedAt = new Date();
      if (status === 'received') updateData.receivedAt = new Date();

      const transfer = await InventoryTransfer.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!transfer) return res.status(404).json({ error: 'Transfer not found' });
      
      // If received, update actual stock levels
      if (status === 'received') {
        for (const item of (transfer as any).items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }
      }

      res.json(transfer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getTransferList: async (req: Request, res: Response) => {
    try {
      const transfers = await InventoryTransfer.find().sort({ createdAt: -1 });
      res.json(transfers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  adjustStock: async (req: Request, res: Response) => {
    try {
      const { productId, adjustment, reason } = req.body;
      const product = await Product.findByIdAndUpdate(productId, { $inc: { stock: adjustment } }, { new: true });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getFifoValuation: async (req: Request, res: Response) => {
    try {
      const products = await Product.find();
      const totalValuation = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);
      res.json({ totalValuation, currency: 'KD' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // FIX: 318 - Cycle Count Logic
  startCycleCount: async (req: Request, res: Response) => {
    try {
      const sessionId = 'CC-' + Date.now();
      const { storeId } = req.body;
      const cycleCount = new CycleCount({
        sessionId,
        storeId,
        createdBy: (req as any).user.id,
        status: 'pending'
      });
      await cycleCount.save();
      res.status(201).json({ sessionId });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  submitCycleCount: async (req: Request, res: Response) => {
    try {
      const { sessionId, items } = req.body;
      const cycleCount = await CycleCount.findOne({ sessionId });
      if (!cycleCount) return res.status(404).json({ error: 'Session not found' });
      
      cycleCount.items = items;
      cycleCount.submittedAt = new Date();
      await cycleCount.save();
      res.json(cycleCount);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getPendingCycleCounts: async (req: Request, res: Response) => {
    try {
      const sessions = await CycleCount.find({ status: 'pending' }).populate('createdBy', 'name');
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getCycleCountDiscrepancy: async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const cycleCount = await CycleCount.findOne({ sessionId }).populate('items.productId');
      if (!cycleCount) return res.status(404).json({ error: 'Session not found' });
      
      const discrepancies = [];
      for (const item of cycleCount.items) {
        const inventory = await Inventory.findOne({ productId: item.productId, storeId: cycleCount.storeId });
        const expectedQty = inventory ? inventory.quantity : 0;
        if (expectedQty !== item.actualCount) {
          discrepancies.push({
            productId: item.productId,
            sku: item.sku,
            expectedQty,
            actualQty: item.actualCount,
            action: 'investigate'
          });
        }
      }
      
      cycleCount.discrepancies = discrepancies;
      await cycleCount.save();
      res.json(cycleCount);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  resolveCycleCount: async (req: Request, res: Response) => {
    try {
      const { sessionId, resolutions } = req.body;
      const cycleCount = await CycleCount.findOne({ sessionId });
      if (!cycleCount) return res.status(404).json({ error: 'Session not found' });
      
      for (const resItem of resolutions) {
        const disc = cycleCount.discrepancies.find(d => d.productId.toString() === resItem.productId);
        if (disc && resItem.action === 'accept') {
          await Inventory.findOneAndUpdate(
            { productId: resItem.productId, storeId: cycleCount.storeId },
            { quantity: disc.actualQty, $inc: { version: 1 } },
            { upsert: true }
          );
          disc.action = 'accept';
        }
      }
      
      cycleCount.status = 'resolved';
      cycleCount.resolvedBy = (req as any).user.id;
      cycleCount.resolvedAt = new Date();
      await cycleCount.save();
      res.json(cycleCount);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getAvailableImeis: async (req: Request, res: Response) => {
    try {
      const { variantId, productId } = req.query;
      
      const query: any = { status: 'in_stock' };
      if (variantId) query.variantId = variantId;
      if (productId) query.productId = productId;

      const units = await SerialNumber.find(query).select('identifier');
      res.json(units.map(u => u.identifier));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Purchase Orders
  getPurchaseOrders: async (req: Request, res: Response) => {
    try {
      const pos = await PurchaseOrder.find().populate('supplierId').sort({ createdAt: -1 });
      res.json(pos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updatePurchaseOrderStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!po) return res.status(404).json({ error: 'PO not found' });
      res.json(po);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Bin Locations
  getBinLocations: async (req: Request, res: Response) => {
    try {
      const bins = await BinLocation.find().sort({ zone: 1, rack: 1, shelf: 1, bin: 1 });
      res.json(bins);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createBinLocation: async (req: Request, res: Response) => {
    try {
      const bin = new BinLocation(req.body);
      await bin.save();
      res.status(201).json(bin);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  updateBinLocation: async (req: Request, res: Response) => {
    try {
      const bin = await BinLocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!bin) return res.status(404).json({ error: 'Bin not found' });
      res.json(bin);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  bulkReorder: async (req: Request, res: Response) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 5;
      const lowStockProducts = await Product.find({ stock: { $lte: threshold } });
      
      if (lowStockProducts.length === 0) {
        return res.json({ message: 'No products require reordering' });
      }

      // Group by supplier if possible, but for now just create one PO per supplier or a general one
      const supplier = await Supplier.findOne();
      if (!supplier) {
        return res.status(400).json({ error: 'No suppliers found to create PO' });
      }

      const poItems = lowStockProducts.map(p => ({
        productId: p._id,
        quantity: 20, // Default reorder quantity
        unitCost: p.cost
      }));

      const totalLanded = poItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

      const po = new PurchaseOrder({
        supplierId: supplier._id,
        items: poItems,
        totalLanded,
        status: 'draft'
      });

      await po.save();
      res.status(201).json({ message: `Created PO for ${lowStockProducts.length} items`, poId: po._id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
