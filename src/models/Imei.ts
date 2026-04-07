import mongoose, { Schema, Document } from 'mongoose';

export interface IImei extends Document {
  imei: string;
  productId: mongoose.Types.ObjectId;
  status: 'in_stock' | 'sold' | 'repair';
  soldAt?: Date;
  customerId?: string;
  purchaseOrderId?: string;
}

const ImeiSchema: Schema = new Schema({
  imei: { type: String, required: true, unique: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  status: { 
    type: String, 
    enum: ['in_stock', 'sold', 'repair'], 
    default: 'in_stock' 
  },
  soldAt: { type: Date },
  customerId: { type: String },
  purchaseOrderId: { type: String },
}, { timestamps: true });

ImeiSchema.index({ imei: 1 });
ImeiSchema.index({ status: 1 });

export default mongoose.models.Imei || mongoose.model<IImei>('Imei', ImeiSchema);
