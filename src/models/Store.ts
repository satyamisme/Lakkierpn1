import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  name: string;
  address: string;
  phone: string;
  managerId: mongoose.Types.ObjectId;
  status: 'active' | 'inactive';
  whitelistedIPs: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  geofenceRadius: number;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  managerId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  whitelistedIPs: { type: [String], default: [] },
  location: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 }
  },
  geofenceRadius: { type: Number, default: 500 },
}, { timestamps: true });

export default mongoose.model<IStore>('Store', StoreSchema);
