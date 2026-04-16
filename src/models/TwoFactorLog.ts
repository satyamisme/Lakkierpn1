import mongoose, { Schema, Document } from 'mongoose';

export interface ITwoFactorLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'setup' | 'verify' | 'disable' | 'failed_attempt' | 'login' | 'login_failed';
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const TwoFactorLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['setup', 'verify', 'disable', 'failed_attempt', 'login', 'login_failed'], required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.TwoFactorLog || mongoose.model<ITwoFactorLog>('TwoFactorLog', TwoFactorLogSchema);
