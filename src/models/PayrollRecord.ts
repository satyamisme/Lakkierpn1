import mongoose, { Schema, Document } from 'mongoose';

export interface IPayrollRecord extends Document {
  userId: mongoose.Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
  baseSalary: number;
  commissions: number;
  deductions: number;
  totalPaid: number;
  status: 'pending' | 'paid';
  paidAt?: Date;
  createdAt: Date;
}

const PayrollRecordSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  baseSalary: { type: Number, required: true },
  commissions: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  totalPaid: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPayrollRecord>('PayrollRecord', PayrollRecordSchema);
