import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  totalSpent: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  storeCredit: { type: Number, default: 0 },
  tier: { 
    type: String, 
    enum: ['Silver', 'Gold', 'VIP'], 
    default: 'Silver' 
  },
  consentMarketing: { type: Boolean, default: false },
  birthday: { type: Date },
  whatsappOptIn: { type: Boolean, default: false },
  whatsappNumber: { type: String },
  lastReviewSent: { type: Date },
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
