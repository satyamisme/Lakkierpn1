import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketingCampaign extends Document {
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  trigger: 'welcome' | 'abandoned_cart' | 'birthday' | 'manual';
  discountValue?: number;
  discountType?: 'percentage' | 'fixed';
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  sentCount: number;
  createdAt: Date;
}

const MarketingCampaignSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['email', 'sms', 'whatsapp'], required: true },
  trigger: { type: String, enum: ['welcome', 'abandoned_cart', 'birthday', 'manual'], default: 'manual' },
  discountValue: { type: Number },
  discountType: { type: String, enum: ['percentage', 'fixed'] },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['draft', 'active', 'completed', 'cancelled'], default: 'draft' },
  sentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMarketingCampaign>('MarketingCampaign', MarketingCampaignSchema);
