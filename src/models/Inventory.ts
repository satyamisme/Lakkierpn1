import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  quantity: number;
  version: number;
}

const InventorySchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId, ref: 'Variant' },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  quantity: { type: Number, default: 0 },
  version: { type: Number, default: 0 }
}, { timestamps: true });

InventorySchema.index({ variantId: 1, storeId: 1 }, { unique: true, sparse: true });
InventorySchema.index({ productId: 1, storeId: 1 });

export default mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);
