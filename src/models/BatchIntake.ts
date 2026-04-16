import mongoose, { Schema, Document } from 'mongoose';

export interface IBatchIntake extends Document {
  month: string;
  year: string;
  supplierId: string;
  targetStoreId: string;
  notes?: string;
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    units: {
      imei?: string;
      serial?: string;
      cost: number;
      price: number;
    }[];
  }[];
  createdAt: Date;
}

const BatchIntakeSchema: Schema = new Schema({
  month: { type: String, required: true },
  year: { type: String, required: true },
  supplierId: { type: String },
  targetStoreId: { type: String, required: true },
  notes: { type: String },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    units: [{
      imei: { type: String },
      serial: { type: String },
      identifier: { type: String },
      cost: { type: Number, required: true },
      price: { type: Number, required: true },
      manufacturingDate: { type: Date },
      warrantyExpiry: { type: Date }
    }]
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.BatchIntake || mongoose.model<IBatchIntake>('BatchIntake', BatchIntakeSchema);
