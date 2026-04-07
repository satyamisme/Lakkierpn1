import mongoose, { Schema, Document } from 'mongoose';

export interface IQualityControlInspection extends Document {
  type: 'incoming' | 'outgoing' | 'repair';
  referenceId: mongoose.Types.ObjectId; // PO ID, Sale ID, or Repair ID
  inspectorId: mongoose.Types.ObjectId;
  checklist: {
    item: string;
    passed: boolean;
    notes?: string;
  }[];
  result: 'pass' | 'fail';
  createdAt: Date;
}

const QualityControlInspectionSchema: Schema = new Schema({
  type: { type: String, enum: ['incoming', 'outgoing', 'repair'], required: true },
  referenceId: { type: Schema.Types.ObjectId, required: true },
  inspectorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  checklist: [{
    item: { type: String, required: true },
    passed: { type: Boolean, required: true },
    notes: { type: String }
  }],
  result: { type: String, enum: ['pass', 'fail'], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IQualityControlInspection>('QualityControlInspection', QualityControlInspectionSchema);
