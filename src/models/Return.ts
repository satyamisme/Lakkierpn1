import mongoose, { Schema, Document } from 'mongoose';

export interface IReturn extends Document {
  returnNumber: string;
  saleId: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    variantId?: mongoose.Types.ObjectId;
    identifier?: string;
    quantity: number;
    price: number;
    reason: string;
    condition: 'restock' | 'defective';
  }[];
  totalRefund: number;
  refundMethod: string;
  processedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ReturnSchema: Schema = new Schema({
  returnNumber: { type: String, required: true, unique: true },
  saleId: { type: Schema.Types.ObjectId, ref: 'Sale', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'Variant' },
    identifier: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    reason: { type: String, required: true },
    condition: { type: String, enum: ['restock', 'defective'], required: true }
  }],
  totalRefund: { type: Number, required: true },
  refundMethod: { type: String, required: true },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.models.Return || mongoose.model<IReturn>('Return', ReturnSchema);
