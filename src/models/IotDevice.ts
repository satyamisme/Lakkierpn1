import mongoose from "mongoose";

const IotDeviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['RFID_Scanner', 'Digital_Scale', 'Customer_Display', 'Smart_Lock'], 
    required: true 
  },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  lastHeartbeat: { type: Date },
  currentValue: { type: mongoose.Schema.Types.Mixed },
  batteryLevel: { type: Number, default: 100 },
  paperLow: { type: Boolean, default: false },
  lastDoorEvent: { type: String, enum: ['opened', 'closed', null], default: null },
}, { timestamps: true });

export default mongoose.models.IotDevice || mongoose.model("IotDevice", IotDeviceSchema);
