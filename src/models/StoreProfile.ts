import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreProfile extends Document {
  name: string;
  address: string;
  whitelistedIPs: string[]; // ID 186: IP Whitelisting
  location: {
    latitude: number;
    longitude: number;
  }; // ID 187: Geofencing
  geofenceRadius: number; // in meters, default 500
  passwordPolicy: {
    minLength: number;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expiryDays: number;
  }; // ID 189: Password Policy
  createdAt: Date;
}

const StoreProfileSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  whitelistedIPs: { type: [String], default: [] },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  geofenceRadius: { type: Number, default: 500 },
  passwordPolicy: {
    minLength: { type: Number, default: 8 },
    requireNumbers: { type: Boolean, default: true },
    requireSymbols: { type: Boolean, default: false },
    expiryDays: { type: Number, default: 90 }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.StoreProfile || mongoose.model<IStoreProfile>('StoreProfile', StoreProfileSchema);
