import mongoose from "mongoose";

const CashSweepSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'completed'], default: 'completed' }
}, { timestamps: true });

export default mongoose.models.CashSweep || mongoose.model("CashSweep", CashSweepSchema);
