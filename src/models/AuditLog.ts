import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'create' | 'update' | 'delete';
  entity: 'sale' | 'repair' | 'product' | 'user';
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ip: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    enum: ['create', 'update', 'delete'], 
    required: true 
  },
  entity: { 
    type: String, 
    enum: ['sale', 'repair', 'product', 'user'], 
    required: true 
  },
  entityId: { type: String, required: true },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  ip: { type: String },
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ timestamp: -1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
