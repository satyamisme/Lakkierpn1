import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import SerialNumber from '../models/Imei.js';
import Brand from '../models/Brand.js';
import mongoose from 'mongoose';

import { skuGenerator } from './skuGenerator.js';

export class ProductService {
  static async createProduct(data: any) {
    const { variants, isConfigurable, attributes, isNewBrand, ...baseData } = data;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Logic ID 121: Register new brand if needed
      if (isNewBrand && baseData.brand) {
        await Brand.findOneAndUpdate(
          { name: baseData.brand },
          { name: baseData.brand },
          { upsert: true, session }
        );
      }

      // Logic ID 122: Fix SKU validation by generating one if missing
      const productSku = baseData.sku || await skuGenerator.generateSku(baseData, variants?.[0]?.attributes || {});
      
      const product = new Product({
        ...baseData,
        sku: productSku,
        isConfigurable: !!isConfigurable,
        attributes: attributes || []
      });
      await product.save({ session });

      const createdVariants = [];
      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const variantData of variants) {
          // Auto-generate variant SKU if missing
          const vSku = variantData.sku || await skuGenerator.generateSku(baseData, variantData.attributes);
          const variant = new Variant({
            ...variantData,
            sku: vSku,
            productId: product._id
          });
          await variant.save({ session });
          createdVariants.push(variant);
        }
      } else {
        const variant = new Variant({
          productId: product._id,
          sku: product.sku,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          trackingMethod: product.isImeiRequired ? 'imei' : (product.isSerialRequired ? 'serial' : 'none'),
          attributes: {}
        });
        await variant.save({ session });
        createdVariants.push(variant);
      }

      await session.commitTransaction();
      return { product, variants: createdVariants };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * WAC Injection: Atomically update landed cost following intake
   * Formula: ((Current Qty * Current Cost) + (New Qty * New Cost)) / (Current Qty + New Qty)
   */
  static async updateLandedCost(productId: string, newQty: number, newCost: number, session: any) {
    const product = await Product.findById(productId).session(session);
    if (!product) return;

    const currentQty = product.stock || 0;
    const currentCost = product.costPrice || 0;
    
    // Guard against division by zero and negative stocks
    const totalQty = currentQty + newQty;
    const updatedWAC = totalQty > 0 
      ? ((currentQty * currentCost) + (newQty * newCost)) / totalQty
      : newCost;

    await Product.findByIdAndUpdate(productId, { 
      $set: { costPrice: Number(updatedWAC.toFixed(3)) },
      $inc: { stock: newQty } 
    }, { session });
  }

  static async searchAssets(query: string) {
    const softDeleteQuery = { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };

    // 1. Identifier Match (IMEI/Serial)
    const assetMatches = await SerialNumber.find({
      identifier: query,
      status: 'in_stock'
    }).populate('productId').populate('variantId').lean();

    if (assetMatches.length > 0) {
      return assetMatches.map(a => ({
        ...((a.variantId as any) || {}),
        _id: (a.variantId as any)?._id || a.productId,
        name: (a.productId as any).name,
        brand: (a.productId as any).brand,
        isVariant: !!a.variantId,
        parentProduct: a.productId,
        imei: a.identifier,
        stock: 1
      }));
    }

    // 2. Attribute Match (Name, SKU, Brand)
    const products = await Product.find({
      ...softDeleteQuery,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ]
    }).limit(20).lean();

    const results: any[] = [];
    for (const p of products) {
      const pVariants = await Variant.find({ productId: p._id, ...softDeleteQuery }).lean();
      if (pVariants.length > 0) {
        pVariants.forEach(v => {
          results.push({ ...v, name: p.name, brand: p.brand, isVariant: true, parentProduct: p });
        });
      } else {
        results.push({ ...p, isVariant: false });
      }
    }

    return results;
  }
}
