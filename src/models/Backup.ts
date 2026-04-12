import mongoose, { Schema, Document } from 'mongoose';

export interface IBackup extends Document {
  timestamp: Date;
  collections: string[];
  lsn: string;
  data: any;
  type: 'full' | 'incremental';
  location: string;
}

const BackupSchema: Schema = new Schema({
  timestamp: { type: Date, default: Date.now },
  collections: [String],
  lsn: { type: String },
  data: { type: Schema.Types.Mixed },
  type: { type: String, enum: ['full', 'incremental'], default: 'full' },
  location: { type: String }
}, { timestamps: true });

export default mongoose.models.Backup || mongoose.model<IBackup>('Backup', BackupSchema);
