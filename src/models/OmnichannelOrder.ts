import mongoose, { Schema, Document } from 'mongoose';

export interface IOmnichannelOrder extends Document {
  source: 'shopify' | 'woocommerce';
  externalId: string;
  customerId?: mongoose.Types.ObjectId;
  items: {
    productId?: mongoose.Types.ObjectId;
    externalProductId: string;
    sku: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'picked_up';
  bopisPickupDeadline?: Date;
  createdAt: Date;
}

const OmnichannelOrderSchema: Schema = new Schema({
  source: { type: String, enum: ['shopify', 'woocommerce'], required: true },
  externalId: { type: String, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    externalProductId: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'picked_up'], default: 'pending' },
  bopisPickupDeadline: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOmnichannelOrder>('OmnichannelOrder', OmnichannelOrderSchema);
