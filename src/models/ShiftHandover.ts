import mongoose from "mongoose";

const ShiftHandoverSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cashInDrawer: { type: Number, required: true },
  notes: { type: String },
  attachments: [{ type: String }], // Photo URLs
}, { timestamps: true });

export default mongoose.models.ShiftHandover || mongoose.model("ShiftHandover", ShiftHandoverSchema);
