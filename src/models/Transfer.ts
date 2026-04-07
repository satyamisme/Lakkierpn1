import mongoose, { Schema, Document } from 'mongoose';

export interface ITransfer extends Document {
  fromStoreId: string;
  toStoreId: string;
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    imeiList?: string[];
  }[];
  status: 'requested' | 'shipped' | 'received';
  requestedBy: mongoose.Types.ObjectId;
  shippedBy?: mongoose.Types.ObjectId;
  receivedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TransferSchema: Schema = new Schema({
  fromStoreId: { type: String, required: true },
  toStoreId: { type: String, required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    imeiList: { type: [String] },
  }],
  status: { 
    type: String, 
    enum: ['requested', 'shipped', 'received'], 
    default: 'requested' 
  },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shippedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  receivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

TransferSchema.index({ status: 1 });
TransferSchema.index({ fromStoreId: 1, toStoreId: 1 });

export default mongoose.models.Transfer || mongoose.model<ITransfer>('Transfer', TransferSchema);
