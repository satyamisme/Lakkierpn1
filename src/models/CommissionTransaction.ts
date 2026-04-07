import mongoose, { Schema, Document } from 'mongoose';

export interface ICommissionTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  referenceId: mongoose.Types.ObjectId; // Sale ID or Repair ID
  referenceType: 'sale' | 'repair';
  amount: number;
  calculatedAt: Date;
  paid: boolean;
  paidAt?: Date;
}

const CommissionTransactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referenceId: { type: Schema.Types.ObjectId, required: true },
  referenceType: { type: String, enum: ['sale', 'repair'], required: true },
  amount: { type: Number, required: true },
  calculatedAt: { type: Date, default: Date.now },
  paid: { type: Boolean, default: false },
  paidAt: { type: Date }
});

export default mongoose.model<ICommissionTransaction>('CommissionTransaction', CommissionTransactionSchema);
