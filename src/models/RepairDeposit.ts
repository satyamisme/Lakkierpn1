import mongoose, { Schema, Document } from 'mongoose';

export interface IRepairDeposit extends Document {
  repairId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  createdAt: Date;
}

const RepairDepositSchema: Schema = new Schema({
  repairId: { type: Schema.Types.ObjectId, ref: 'Repair', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRepairDeposit>('RepairDeposit', RepairDepositSchema);
