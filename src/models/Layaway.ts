import mongoose, { Schema, Document } from 'mongoose';

export interface ILayaway extends Document {
  saleId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  totalAmount: number;
  depositPaid: number;
  remainingBalance: number;
  schedule: {
    dueDate: Date;
    amount: number;
    paid: boolean;
    paidAt?: Date;
  }[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

const LayawaySchema: Schema = new Schema({
  saleId: { type: Schema.Types.ObjectId, ref: 'Sale', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: { type: Number, required: true },
  depositPaid: { type: Number, required: true },
  remainingBalance: { type: Number, required: true },
  schedule: [{
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paidAt: { type: Date }
  }],
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ILayaway>('Layaway', LayawaySchema);
