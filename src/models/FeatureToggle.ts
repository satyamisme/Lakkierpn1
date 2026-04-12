import mongoose, { Schema, Document } from 'mongoose';

export interface IFeatureToggle extends Document {
  featureId: number;
  name: string;
  domain: string;
  enabledRoles: string[];
}

const FeatureToggleSchema: Schema = new Schema({
  featureId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  domain: { type: String, required: true },
  enabledRoles: { type: [String], default: ['admin', 'super_admin'] }
}, { timestamps: true });

export default mongoose.models.FeatureToggle || mongoose.model<IFeatureToggle>('FeatureToggle', FeatureToggleSchema);
