import mongoose from 'mongoose';

const PayrollAdjustmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['bonus', 'deduction'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payPeriod: { type: String, required: true }, // e.g., "2026-04"
}, { timestamps: true });

export default mongoose.model('PayrollAdjustment', PayrollAdjustmentSchema);
