import mongoose, { Schema, Document } from 'mongoose';

export interface ITradeIn extends Document {
  customerId: mongoose.Types.ObjectId;
  deviceModel: string;
  imei: string;
  condition: 'excellent' | 'good' | 'fair' | 'broken';
  valuation: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}

const TradeInSchema: Schema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  deviceModel: { type: String, required: true },
  imei: { type: String, required: true },
  condition: { type: String, enum: ['excellent', 'good', 'fair', 'broken'], required: true },
  valuation: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITradeIn>('TradeIn', TradeInSchema);
