import mongoose, { Schema, Document } from 'mongoose';

export interface ICycleCount extends Document {
  sessionId: string;
  storeId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    sku: string;
    location: string;
    actualCount: number;
  }[];
  submittedAt: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  discrepancies: {
    productId: mongoose.Types.ObjectId;
    expectedQty: number;
    actualQty: number;
    action: 'accept' | 'investigate';
  }[];
  status: 'pending' | 'resolved';
}

const CycleCountSchema: Schema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    location: { type: String },
    actualCount: { type: Number, required: true }
  }],
  submittedAt: { type: Date, default: Date.now },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  discrepancies: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    expectedQty: { type: Number },
    actualQty: { type: Number },
    action: { type: String, enum: ['accept', 'investigate'], default: 'investigate' }
  }],
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' }
}, { timestamps: true });

export default mongoose.models.CycleCount || mongoose.model<ICycleCount>('CycleCount', CycleCountSchema);
