import mongoose, { Schema, Document } from 'mongoose';

export interface IComplianceLog extends Document {
  type: 'audit' | 'tax' | 'zreport';
  data: any;
  generatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ComplianceLogSchema: Schema = new Schema({
  type: { type: String, enum: ['audit', 'tax', 'zreport'], required: true },
  data: { type: Schema.Types.Mixed, required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IComplianceLog>('ComplianceLog', ComplianceLogSchema);
