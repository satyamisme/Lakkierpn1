import mongoose, { Schema, Document } from 'mongoose';

export interface IBulkJob extends Document {
  type: 'price_update' | 'stock_adjustment' | 'label_print' | 'customer_import' | 'product_import';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  processingErrors: {
    item: string;
    error: string;
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BulkJobSchema: Schema = new Schema({
  type: { type: String, enum: ['price_update', 'stock_adjustment', 'label_print', 'customer_import', 'product_import'], required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  totalItems: { type: Number, default: 0 },
  processedItems: { type: Number, default: 0 },
  processingErrors: [{
    item: { type: String },
    error: { type: String }
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IBulkJob>('BulkJob', BulkJobSchema);
