import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  outstandingDebt: { type: Number, default: 0 },
  totalPurchased: { type: Number, default: 0 },
  leadTimeDays: { type: Number, default: 7 },
}, { timestamps: true });

export default mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema);
