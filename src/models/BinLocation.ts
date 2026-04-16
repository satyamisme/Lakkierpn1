import mongoose from "mongoose";

const BinLocationSchema = new mongoose.Schema({
  zone: { type: String, required: true },
  rack: { type: String, required: true },
  shelf: { type: String, required: true },
  bin: { type: String, required: true },
  capacity: { type: Number, default: 0 },
  currentItems: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'full', 'restricted'], 
    default: 'active' 
  }
}, { timestamps: true });

// Virtual for formatted ID
BinLocationSchema.virtual('binId').get(function() {
  return `${this.zone}-${this.rack}-${this.shelf}-${this.bin}`;
});

export default mongoose.models.BinLocation || mongoose.model("BinLocation", BinLocationSchema);
