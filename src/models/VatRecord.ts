import mongoose from "mongoose";

const VatRecordSchema = new mongoose.Schema({
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  vatAmount: { type: Number, required: true },
  rate: { type: Number, default: 0.05 }, // 5%
  taxPeriod: { type: String, required: true }, // e.g., "2024-Q1"
  filed: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.VatRecord || mongoose.model("VatRecord", VatRecordSchema);
