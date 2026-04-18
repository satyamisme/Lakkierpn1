import mongoose, { Schema, Document } from 'mongoose';

export interface IGiftCard extends Document {
  code: string;
  initialBalance: number;
  currentBalance: number;
  expiryDate?: Date;
  status: 'active' | 'exhausted' | 'expired' | 'canceled';
  customerId?: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const GiftCardSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  initialBalance: { type: Number, required: true },
  currentBalance: { type: Number, required: true },
  expiryDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'exhausted', 'expired', 'canceled'], 
    default: 'active' 
  },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
}, { timestamps: true });

export default mongoose.models.GiftCard || mongoose.model<IGiftCard>('GiftCard', GiftCardSchema);
