import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'manager' | 'cashier' | 'technician' | 'inventory' | 'auditor';
  permissions: number[]; // ID-based Permission Matrix (1-300)
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  isTrainingMode: boolean;
  status: 'active' | 'inactive' | 'suspended';
  storeId?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { 
    type: String, 
    enum: ['superadmin', 'manager', 'cashier', 'technician', 'inventory', 'auditor'],
    default: 'cashier' 
  },
  permissions: { type: [Number], default: [] },
  twoFactorSecret: { type: String },
  isTwoFactorEnabled: { type: Boolean, default: false },
  isTrainingMode: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
