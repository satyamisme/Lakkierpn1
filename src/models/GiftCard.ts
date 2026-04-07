import mongoose, { Schema, Document } from 'mongoose';

export interface IGiftCard extends Document {
  code: string;
  amount: number;
  balance: number;
  issuedTo?: mongoose.Types.ObjectId; // Customer ID
  issuedBy: mongoose.Types.ObjectId; // User ID
  expiresAt?: Date;
  status: 'active' | 'redeemed' | 'void';
  createdAt: Date;
}

const GiftCardSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  issuedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date },
  status: { type: String, enum: ['active', 'redeemed', 'void'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IGiftCard>('GiftCard', GiftCardSchema);
