import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouseTask extends Document {
  type: 'picking' | 'packing' | 'receiving';
  referenceId: mongoose.Types.ObjectId; // Sale ID or PO ID
  assignedTo?: mongoose.Types.ObjectId; // User ID
  items: {
    productId: mongoose.Types.ObjectId;
    sku: string;
    quantity: number;
    scannedQuantity: number;
  }[];
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
  createdAt: Date;
}

const WarehouseTaskSchema: Schema = new Schema({
  type: { type: String, enum: ['picking', 'packing', 'receiving'], required: true },
  referenceId: { type: Schema.Types.ObjectId, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true },
    scannedQuantity: { type: Number, default: 0 }
  }],
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IWarehouseTask>('WarehouseTask', WarehouseTaskSchema);
