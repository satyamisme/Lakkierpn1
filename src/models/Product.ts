import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  name_ar?: string;
  sku: string;
  category: string;
  category_ar?: string;
  brand: string;
  brand_ar?: string;
  modelNumber: string;
  description?: string;
  description_ar?: string;
  color?: string;
  color_ar?: string;
  storage?: string;
  storage_ar?: string;
  price: number;
  cost: number;
  stock: number;
  image?: string;
  binLocation?: string;
  isImeiRequired: boolean;
  isSerialRequired: boolean;
  imeiHistory: string[];
  isConfigurable: boolean;
  isBundle: boolean;
  bundledProducts?: {
    productId: mongoose.Types.ObjectId;
    variantId?: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  attributes: {
    name: string;
    values: string[];
  }[];
  defaultImage?: string;
  deletedAt?: Date;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  name_ar: { type: String },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  category_ar: { type: String },
  brand: { type: String, required: true },
  brand_ar: { type: String },
  modelNumber: { type: String },
  description: { type: String },
  description_ar: { type: String },
  color: { type: String },
  color_ar: { type: String },
  storage: { type: String },
  storage_ar: { type: String },
  price: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  image: { type: String },
  binLocation: { type: String },
  isImeiRequired: { type: Boolean, default: false },
  isSerialRequired: { type: Boolean, default: false },
  imeiHistory: { type: [String], default: [] },
  isConfigurable: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  isBundle: { type: Boolean, default: false },
  bundledProducts: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    variantId: { type: Schema.Types.ObjectId, ref: 'Variant' },
    quantity: { type: Number, default: 1 }
  }],
  attributes: [{
    name: { type: String },
    values: { type: [String] }
  }],
  defaultImage: { type: String },
  deletedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Logic ID 444: Define virtual relationship to variants
ProductSchema.virtual('variants', {
  ref: 'Variant',
  localField: '_id',
  foreignField: 'productId'
});

// ID 3: Elastic Search Bar - Text Index for Name, SKU, and IMEI
ProductSchema.index({ name: 'text', sku: 'text', category: 'text', brand: 'text', modelNumber: 'text' });
ProductSchema.index({ sku: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
