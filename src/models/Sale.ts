import mongoose, { Schema, Document } from 'mongoose';

export interface ISale extends Document {
  items: {
    productId: mongoose.Types.ObjectId;
    variantId?: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    imei?: string;
  }[];
  payments: {
    method: 'cash' | 'card' | 'knet' | 'store_credit';
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'completed' | 'voided' | 'held' | 'layaway';
  saleNumber: string;
  sessionId?: string;
  notes?: string;
  storeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SaleSchema: Schema = new Schema({
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'Variant' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    imei: { type: String },
  }],
  payments: [{
    method: { 
      type: String, 
      enum: ['cash', 'card', 'knet', 'store_credit'], 
      required: true 
    },
    amount: { type: Number, required: true },
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['completed', 'voided', 'held', 'layaway'], 
    default: 'completed' 
  },
  saleNumber: { type: String, unique: true },
  sessionId: { type: String },
  notes: { type: String },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
}, { timestamps: true });

SaleSchema.index({ status: 1 });
SaleSchema.index({ createdAt: -1 });

export default mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);
