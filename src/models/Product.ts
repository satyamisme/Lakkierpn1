import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  category: string;
  brand: string;
  modelNumber: string;
  description?: string;
  color?: string;
  storage?: string;
  price: number;
  cost: number;
  stock: number;
  image?: string;
  binLocation?: string;
  isImeiRequired: boolean;
  isSerialRequired: boolean;
  imeiHistory: string[];
  isConfigurable: boolean;
  attributes: {
    name: string;
    values: string[];
  }[];
  defaultImage?: string;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  modelNumber: { type: String },
  description: { type: String },
  color: { type: String },
  storage: { type: String },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: { type: String },
  binLocation: { type: String },
  isImeiRequired: { type: Boolean, default: false },
  isSerialRequired: { type: Boolean, default: false },
  imeiHistory: { type: [String], default: [] },
  isConfigurable: { type: Boolean, default: false },
  attributes: [{
    name: { type: String },
    values: { type: [String] }
  }],
  defaultImage: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ID 3: Elastic Search Bar - Text Index for Name, SKU, and IMEI
ProductSchema.index({ name: 'text', sku: 'text', category: 'text', brand: 'text', modelNumber: 'text' });
ProductSchema.index({ sku: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
