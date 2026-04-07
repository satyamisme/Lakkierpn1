import mongoose from "mongoose";

const LoyaltyTransactionSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  pointsEarned: { type: Number, default: 0 },
  pointsRedeemed: { type: Number, default: 0 },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  reason: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.LoyaltyTransaction || mongoose.model("LoyaltyTransaction", LoyaltyTransactionSchema);
