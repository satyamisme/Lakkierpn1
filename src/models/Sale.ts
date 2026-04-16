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
  discount: number;
  total: number;
  status: 'completed' | 'voided' | 'held';
  saleNumber: string;
  sessionId?: string;
  storeId: mongoose.Types.ObjectId;
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
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['completed', 'voided', 'held'], 
    default: 'completed' 
  },
  saleNumber: { type: String, unique: true },
  sessionId: { type: String },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
}, { timestamps: true });

SaleSchema.index({ status: 1 });
SaleSchema.index({ createdAt: -1 });

export default mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);
