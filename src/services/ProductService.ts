import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import SerialNumber from '../models/Imei.js';
import mongoose from 'mongoose';

export class ProductService {
  static async createProduct(data: any) {
    const { variants, isConfigurable, attributes, ...baseData } = data;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = new Product({
        ...baseData,
        isConfigurable: !!isConfigurable,
        attributes: attributes || []
      });
      await product.save({ session });

      const createdVariants = [];
      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const variantData of variants) {
          const variant = new Variant({
            ...variantData,
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
