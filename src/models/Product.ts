import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  image?: string;
  isImeiRequired: boolean; // ID 5: Forced IMEI/Serial Validation
  imeiHistory: string[]; // ID 6: Duplicate IMEI Prevention
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: { type: String },
  isImeiRequired: { type: Boolean, default: false },
  imeiHistory: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ID 3: Elastic Search Bar - Text Index for Name, SKU, and IMEI
ProductSchema.index({ name: 'text', sku: 'text', category: 'text' });
ProductSchema.index({ sku: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
