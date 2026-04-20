import mongoose, { Schema, Document } from 'mongoose';

export interface ISecurityConfig extends Document {
  configKey: string;
  configValue: string;
  updatedBy?: mongoose.Types.ObjectId;
}

const SecurityConfigSchema: Schema = new Schema({
  configKey: { type: String, required: true, unique: true },
  configValue: { type: String, required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.SecurityConfig || mongoose.model<ISecurityConfig>('SecurityConfig', SecurityConfigSchema);
