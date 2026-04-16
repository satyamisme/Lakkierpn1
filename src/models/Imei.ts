import mongoose, { Schema, Document } from 'mongoose';

export interface ISerialNumber extends Document {
  identifier: string;
  variantId?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  status: 'in_stock' | 'sold' | 'returned' | 'under_repair' | 'repair' | 'defective' | 'warranty_claimed';
  warrantyExpiry?: Date;
  manufacturingDate?: Date;
  batchPrice?: number;
  landedCost?: number;
  batchNotes?: string;
  lastTransactionId?: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  soldAt?: Date;
  customerId?: string;
  purchaseOrderId?: string;
}

const SerialNumberSchema: Schema = new Schema({
  identifier: { type: String, required: true, unique: true },
  imei: { type: String }, // Alias for identifier for backward compatibility
  variantId: { type: Schema.Types.ObjectId, ref: 'Variant' },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  status: { 
    type: String, 
    enum: ['in_stock', 'sold', 'returned', 'under_repair', 'repair', 'defective', 'warranty_claimed'], 
    default: 'in_stock' 
  },
  warrantyExpiry: { type: Date },
  manufacturingDate: { type: Date },
  batchPrice: { type: Number },
  landedCost: { type: Number },
  batchNotes: { type: String },
  lastTransactionId: { type: Schema.Types.ObjectId },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store' },
  soldAt: { type: Date },
  customerId: { type: String },
  purchaseOrderId: { type: String },
}, { timestamps: true });

SerialNumberSchema.pre('save', function(this: any) {
  if (this.identifier && !this.imei) {
    this.imei = this.identifier;
  } else if (this.imei && !this.identifier) {
    this.identifier = this.imei;
  }
});

SerialNumberSchema.index({ identifier: 1 });
SerialNumberSchema.index({ imei: 1 });
SerialNumberSchema.index({ status: 1 });
SerialNumberSchema.index({ variantId: 1 });

const SerialNumber = mongoose.models.SerialNumber || mongoose.model<ISerialNumber>('SerialNumber', SerialNumberSchema);
export const Imei = SerialNumber;
export default SerialNumber;
