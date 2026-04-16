import mongoose, { Schema, Document } from 'mongoose';

export interface IVariant extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  cost: number;
  stock: number;
  trackingMethod: 'none' | 'serial' | 'imei';
  barcode?: string;
  images: string[];
  status: 'active' | 'discontinued';
  binLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String, required: true, unique: true },
  attributes: { type: Map, of: String },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  trackingMethod: { 
    type: String, 
    enum: ['none', 'serial', 'imei'], 
    default: 'none' 
  },
  barcode: { type: String },
  images: { type: [String], default: [] },
  status: { 
    type: String, 
    enum: ['active', 'discontinued'], 
    default: 'active' 
  },
  binLocation: { type: String },
}, { timestamps: true });

VariantSchema.index({ sku: 1 });
VariantSchema.index({ productId: 1 });
VariantSchema.index({ barcode: 1 });

export default mongoose.models.Variant || mongoose.model<IVariant>('Variant', VariantSchema);
