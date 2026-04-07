import mongoose from "mongoose";

const CommissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  repairId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repair' },
  amount: { type: Number, required: true },
  paid: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Commission || mongoose.model("Commission", CommissionSchema);
