import { Request, Response } from 'express';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import Store from '../models/Store.js';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Customer from '../models/Customer.js';
import Repair from '../models/Repair.js';
import Sale from '../models/Sale.js';
import mongoose from 'mongoose';

export const seedController = {
  seedAll: async (req: Request, res: Response) => {
    try {
      // 1. Clear existing data (optional but good for a clean demo)
      // await Store.deleteMany({});
      // await Product.deleteMany({});
      // ...

      // 2. Create Store
      let store = await Store.findOne({ name: 'Lakki Phone HQ' });
      if (!store) {
        store = new Store({
          name: 'Lakki Phone HQ',
          address: 'Kuwait City, Block 4',
          phone: '965 1234 5678',
          status: 'active'
        });
        await store.save();
      }

      // 3. Create Supplier
      let supplier = await Supplier.findOne({ name: 'Apple Global' });
      if (!supplier) {
        supplier = new Supplier({
          name: 'Apple Global',
          contact: 'Tim Cook',
          email: 'tim@apple.com',
          phone: '1-800-APPLE',
          category: 'Manufacturer'
        });
        await supplier.save();
      }

      // 4. Create Products & Variants
      const productData = [
        { name: 'iPhone 15 Pro', brand: 'Apple', category: 'Phones', cost: 320, price: 380, sku: 'IP15P-BASE' },
        { name: 'Samsung S24 Ultra', brand: 'Samsung', category: 'Phones', cost: 300, price: 350, sku: 'S24U-BASE' },
        { name: 'AirPods Pro 2', brand: 'Apple', category: 'Accessories', cost: 60, price: 85, sku: 'APP2-BASE' }
      ];

      for (const p of productData) {
        let product = await Product.findOne({ sku: p.sku });
        if (!product) {
          product = new Product({
            ...p,
            stock: 20,
            status: 'active'
          });
          await product.save();

          // Create a variant
          const variant = new Variant({
            productId: product._id,
            sku: `${p.sku}-BLK`,
            attributes: { Color: 'Black', Capacity: '256GB' },
            cost: p.cost,
            price: p.price,
            stock: 10
          });
          await variant.save();
        }
      }

      // 5. Create Purchase Orders (for Landed Cost)
      const existingPO = await PurchaseOrder.findOne();
      if (!existingPO) {
        const po = new PurchaseOrder({
          supplierId: supplier._id,
          targetStoreId: store._id,
          items: [
            { productId: (await Product.findOne({ sku: 'IP15P-BASE' }))?._id, quantity: 10, unitCost: 320 },
            { productId: (await Product.findOne({ sku: 'S24U-BASE' }))?._id, quantity: 5, unitCost: 300 }
          ],
          status: 'received',
          landedCostBreakdown: {
            shipping: 15,
            customs: 30,
            insurance: 10,
            other: 5
          },
          totalLanded: 4760 // Simple math for demo
        });
        await po.save();
      }

      // 6. Create Customer
      let customer = await Customer.findOne({ phone: '90000001' });
      if (!customer) {
        customer = new Customer({
          firstName: 'Mohammed',
          lastName: 'Al-Salem',
          phone: '90000001',
          email: 'mohammed@example.com',
          points: 150
        });
        await customer.save();
      }

      // 7. Create Repairs
      const existingRepair = await Repair.findOne();
      if (!existingRepair) {
        const repair = new Repair({
          customerId: customer._id,
          deviceInfo: {
            brand: 'Apple',
            model: 'iPhone 13',
            serialNumber: 'SN12345678',
            imei: 'IMEI-99887766'
          },
          problemDescription: 'Screen cracked, battery draining fast.',
          estimatedCost: 45,
          status: 'diagnosing',
          assignedTechnician: (req as any).user?.id || null,
          storeId: store._id
        });
        await repair.save();
      }

      // 8. Create Sales
      const existingSale = await Sale.findOne();
      if (!existingSale) {
        const sale = new Sale({
          storeId: store._id,
          customerId: customer._id,
          items: [
            { productId: (await Product.findOne({ sku: 'APP2-BASE' }))?._id, quantity: 1, unitPrice: 85, subtotal: 85 }
          ],
          totalAmount: 85,
          paymentMethods: [{ method: 'cash', amount: 85 }],
          status: 'completed',
          cashierId: (req as any).user?.id || null
        });
        await sale.save();
      }

      res.status(200).json({ message: 'Success: Data matrix initialized.' });
    } catch (error: any) {
      console.error('Seeding error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
