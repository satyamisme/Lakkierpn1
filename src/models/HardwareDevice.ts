import mongoose, { Schema, Document } from 'mongoose';

export interface IHardwareDevice extends Document {
  name: string;
  type: 'printer' | 'scanner' | 'cash_drawer';
  connectionType: 'usb' | 'network';
  ipAddress?: string;
  port?: number;
  isActive: boolean;
  lastPing?: Date;
}

const HardwareDeviceSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['printer', 'scanner', 'cash_drawer'], required: true },
  connectionType: { type: String, enum: ['usb', 'network'], required: true },
  ipAddress: { type: String },
  port: { type: Number },
  isActive: { type: Boolean, default: true },
  lastPing: { type: Date }
});

export default mongoose.model<IHardwareDevice>('HardwareDevice', HardwareDeviceSchema);
