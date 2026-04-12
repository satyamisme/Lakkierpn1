import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryTransfer extends Document {
  fromStoreId: string;
  toStoreId: string;
  items: {
    productId: string;
    quantity: number;
    imei?: string[];
  }[];
  status: 'pending' | 'shipped' | 'received' | 'cancelled';
  shippedAt?: Date;
  receivedAt?: Date;
  createdAt: Date;
}

const InventoryTransferSchema: Schema = new Schema({
  fromStoreId: { type: String, required: true },
  toStoreId: { type: String, required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    imei: { type: [String], default: [] }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'shipped', 'received', 'cancelled'], 
    default: 'pending' 
  },
  shippedAt: { type: Date },
  receivedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.InventoryTransfer || mongoose.model<IInventoryTransfer>('InventoryTransfer', InventoryTransferSchema);
