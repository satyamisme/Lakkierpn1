import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerGroup extends Document {
  name: string;
  discountRate: number;
  minSpend: number;
  isActive: boolean;
  customers: mongoose.Types.ObjectId[]; // Array of User IDs
}

const CustomerGroupSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  discountRate: { type: Number, default: 0 },
  minSpend: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  customers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.model<ICustomerGroup>('CustomerGroup', CustomerGroupSchema);
