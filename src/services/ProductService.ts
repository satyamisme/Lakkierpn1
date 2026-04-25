import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import SerialNumber from '../models/Imei.js';
import Brand from '../models/Brand.js';
import mongoose from 'mongoose';
import { globalSearch } from './SearchService.js';

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
        // Support for creating all conditions at once if provided as array in baseData
        const conditions = Array.isArray(baseData.condition) ? baseData.condition : [baseData.condition || 'New'];
        
        for (const cond of conditions) {
          const vSku = await skuGenerator.generateSku({ ...baseData, condition: cond }, {});
          const variant = new Variant({
            productId: product._id,
            sku: vSku,
            price: baseData.price || 0,
            cost: baseData.cost || 0,
            stock: baseData.stock || 0,
            trackingMethod: product.isImeiRequired ? 'imei' : (product.isSerialRequired ? 'serial' : 'none'),
            attributes: { condition: cond }
          });
          await variant.save({ session });
          createdVariants.push(variant);
        }
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
    
    if (!query) {
      // Return latest 20 items exploded as variants
      const recentProducts = await Product.find(softDeleteQuery)
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('variants')
        .lean();
      
      const compositeResults: any[] = [];
      recentProducts.forEach((p: any) => {
        if (p.isConfigurable && p.variants && p.variants.length > 0) {
          p.variants.forEach((v: any) => {
            if (v && !v.deletedAt) {
              const attrValues = v.attributes ? Object.values(v.attributes).filter(val => typeof val === 'string') : [];
              compositeResults.push({
                ...v,
                name: p.name,
                name_ar: p.name_ar,
                brand: p.brand,
                brand_ar: p.brand_ar,
                isVariant: true,
                parentProduct: p,
                displayName: `${p.name} ${attrValues.length > 0 ? `[${attrValues.join(' | ')}]` : ''}`.trim()
              });
            }
          });
        } else {
          compositeResults.push({ ...p, isVariant: false });
        }
      });
      return compositeResults;
    }

    // 1. Identifier Match (IMEI/Serial) - High Priority
    const assetMatches = await SerialNumber.find({
      identifier: query,
      status: 'in_stock'
    }).populate('productId').populate('variantId').lean();

    if (assetMatches.length > 0) {
      return assetMatches.map(a => ({
        ...((a.variantId as any) || {}),
        _id: (a.variantId as any)?._id || a.productId,
        name: (a.productId as any).name,
        name_ar: (a.productId as any).name_ar,
        brand: (a.productId as any).brand,
        brand_ar: (a.productId as any).brand_ar,
        isVariant: !!a.variantId,
        parentProduct: a.productId,
        imei: a.identifier,
        stock: 1
      }));
    }

    // 2. Tokenized Universal Match
    const results = await globalSearch(query);
    
    const compositeResults: any[] = [];
    results.forEach((p: any) => {
      // 🛡️ Logic ID 367: Automatic Explosion - return every variant as a searchable node
      if (p.isConfigurable && p.variants && p.variants.length > 0) {
        p.variants.forEach((v: any) => {
          // Check if v is actually a document (populated)
          if (v && typeof v === 'object' && !v.deletedAt) {
            const attrValues = v.attributes ? Object.values(v.attributes).filter(val => typeof val === 'string') : [];
            compositeResults.push({
              ...v,
              name: p.name,
              name_ar: p.name_ar,
              brand: p.brand,
              brand_ar: p.brand_ar,
              isVariant: true,
              parentProduct: p,
              displayName: `${p.name} ${attrValues.length > 0 ? `[${attrValues.join(' | ')}]` : ''}`.trim()
            });
          }
        });
      } else {
        if (!p.deletedAt) {
          compositeResults.push({ ...p, isVariant: false });
        }
      }
    });

    return compositeResults;
  }
}
