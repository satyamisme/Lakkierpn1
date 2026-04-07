import mongoose from "mongoose";

const RepairSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  phoneModel: { type: String, required: true },
  imei: { type: String, required: true },
  faults: [{ type: String }],
  issue: { type: String },
  visualDamageMap: { type: Object }, // JSON for damage mapper
  estimatedQuote: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['diagnosing', 'parts_ordered', 'fixing', 'qc', 'ready', 'delivered', 'cancelled'], 
    default: 'diagnosing' 
  },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  qcChecklist: { type: Object, default: {} }, // Flexible object for QC results
  photos: { type: [String], default: [] },
  completedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Repair || mongoose.model("Repair", RepairSchema);
