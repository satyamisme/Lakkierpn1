import mongoose, { Schema, Document } from 'mongoose';

export interface ICommissionRule extends Document {
  userRole: string;
  percentage: number;
  appliesTo: 'sales' | 'repairs' | 'labour' | 'all';
  isActive: boolean;
}

const CommissionRuleSchema: Schema = new Schema({
  userRole: { type: String, required: true },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  appliesTo: { type: String, enum: ['sales', 'repairs', 'labour', 'all'], default: 'all' },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model<ICommissionRule>('CommissionRule', CommissionRuleSchema);
