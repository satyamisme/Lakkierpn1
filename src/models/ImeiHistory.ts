import mongoose, { Schema, Document } from 'mongoose';

export interface IImeiHistory extends Document {
  imei: string;
  eventType: 'purchased' | 'sold' | 'repaired' | 'transferred' | 'returned';
  referenceId: mongoose.Types.ObjectId; // PO ID, Sale ID, Repair ID, or Transfer ID
  timestamp: Date;
  userId: mongoose.Types.ObjectId;
  metadata?: any;
}

const ImeiHistorySchema: Schema = new Schema({
  imei: { type: String, required: true },
  eventType: { type: String, enum: ['purchased', 'sold', 'repaired', 'transferred', 'returned'], required: true },
  referenceId: { type: Schema.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: { type: Schema.Types.Mixed }
});

// Compound index for performance
ImeiHistorySchema.index({ imei: 1, timestamp: -1 });

export default mongoose.model<IImeiHistory>('ImeiHistory', ImeiHistorySchema);
