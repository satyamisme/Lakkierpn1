import mongoose, { Schema, Document } from 'mongoose';

export interface IImeiReservation extends Document {
  imei: string;
  productId: mongoose.Types.ObjectId;
  cartSessionId: string;
  createdAt: Date;
}

const ImeiReservationSchema: Schema = new Schema({
  imei: { type: String, required: true, unique: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  cartSessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // 10 minutes TTL
});

export default mongoose.models.ImeiReservation || mongoose.model<IImeiReservation>('ImeiReservation', ImeiReservationSchema);
