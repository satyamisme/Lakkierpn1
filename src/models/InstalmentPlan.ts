import mongoose, { Schema, Document } from 'mongoose';

export interface IInstalmentPlan extends Document {
  customerId: mongoose.Types.ObjectId;
  saleId: mongoose.Types.ObjectId;
  totalAmount: number;
  remainingAmount: number;
  instalments: {
    dueDate: Date;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    paidAt?: Date;
  }[];
  status: 'active' | 'completed' | 'defaulted';
  createdAt: Date;
}

const InstalmentPlanSchema: Schema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  saleId: { type: Schema.Types.ObjectId, ref: 'Sale', required: true },
  totalAmount: { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  instalments: [{
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    paidAt: { type: Date }
  }],
  status: { type: String, enum: ['active', 'completed', 'defaulted'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IInstalmentPlan>('InstalmentPlan', InstalmentPlanSchema);
