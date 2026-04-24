import mongoose, { Schema, Document } from 'mongoose';

export interface IRepair extends Document {
  repairNumber: string;
  customerId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  deviceInfo: {
    brand: string;
    model: string;
    serialNumber?: string;
    imei?: string;
    color?: string;
  };
  problemDescription: string;
  diagnostics?: string;
  estimatedCost: number;
  quotedPrice: number;
  deposit: number;
  partsConsumed: {
    productId: mongoose.Types.ObjectId;
    variantId?: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  status: 'received' | 'diagnosing' | 'awaiting_parts' | 'repairing' | 'ready' | 'collected' | 'cancelled';
  technicianId?: mongoose.Types.ObjectId;
  expectedReadyDate?: Date;
  collectedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RepairSchema: Schema = new Schema({
  repairNumber: { type: String, unique: true, required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: false },
  deviceInfo: {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    serialNumber: { type: String },
    imei: { type: String },
    color: { type: String },
  },
  problemDescription: { type: String, required: true },
  diagnostics: { type: String },
  estimatedCost: { type: Number, default: 0 },
  quotedPrice: { type: Number, default: 0 },
  deposit: { type: Number, default: 0 },
  partsConsumed: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    variantId: { type: Schema.Types.ObjectId, ref: 'Variant' },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
  }],
  priority: { 
    type: String, 
    enum: ['normal', 'urgent', 'vip'], 
    default: 'normal' 
  },
  status: { 
    type: String, 
    enum: ['received', 'diagnosing', 'awaiting_parts', 'repairing', 'ready', 'collected', 'cancelled'],
    default: 'received'
  },
  technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
  expectedReadyDate: { type: Date },
  collectedAt: { type: Date },
  notes: { type: String },
}, { timestamps: true });

RepairSchema.index({ repairNumber: 1 });
RepairSchema.index({ status: 1 });

export default mongoose.models.Repair || mongoose.model<IRepair>('Repair', RepairSchema);
