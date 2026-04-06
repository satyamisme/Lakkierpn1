import mongoose from "mongoose";

const RepairSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  phoneModel: { type: String, required: true },
  imei: { type: String, required: true },
  faults: [{ type: String }],
  estimatedQuote: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'ready', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Repair", RepairSchema);
