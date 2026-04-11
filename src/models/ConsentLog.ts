import mongoose, { Schema, Document } from 'mongoose';

export interface IConsentLog extends Document {
  customerId: mongoose.Types.ObjectId;
  type: 'marketing' | 'data_processing' | 'repair_terms';
  status: 'granted' | 'revoked';
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const ConsentLogSchema: Schema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: { type: String, enum: ['marketing', 'data_processing', 'repair_terms'], required: true },
  status: { type: String, enum: ['granted', 'revoked'], required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IConsentLog>('ConsentLog', ConsentLogSchema);
