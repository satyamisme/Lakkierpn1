import mongoose, { Schema, Document } from 'mongoose';

export interface IRmaReturn extends Document {
  originalSaleId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    reasonCode: string;
    condition: 'new' | 'used' | 'damaged';
  }[];
  refundMethod: 'credit' | 'cash' | 'gift_card';
  refundAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
}

const RmaReturnSchema: Schema = new Schema({
  originalSaleId: { type: Schema.Types.ObjectId, ref: 'Sale', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    reasonCode: { type: String, required: true },
    condition: { type: String, enum: ['new', 'used', 'damaged'], required: true }
  }],
  refundMethod: { type: String, enum: ['credit', 'cash', 'gift_card'], required: true },
  refundAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRmaReturn>('RmaReturn', RmaReturnSchema);
