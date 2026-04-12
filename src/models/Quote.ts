import mongoose, { Schema, Document } from 'mongoose';

export interface IQuote extends Document {
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    imei?: string;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  quoteNumber: string;
  customerId?: mongoose.Types.ObjectId;
  expiryDate: Date;
  createdAt: Date;
}

const QuoteSchema: Schema = new Schema({
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    imei: { type: String },
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  quoteNumber: { type: String, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  expiryDate: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.Quote || mongoose.model<IQuote>('Quote', QuoteSchema);
