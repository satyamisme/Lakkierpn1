import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryForecast extends Document {
  productId: mongoose.Types.ObjectId;
  predictedDemand: {
    date: Date;
    quantity: number;
  }[];
  confidence: number; // 0 to 1
  generatedAt: Date;
}

const InventoryForecastSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  predictedDemand: [{
    date: { type: Date, required: true },
    quantity: { type: Number, required: true }
  }],
  confidence: { type: Number, min: 0, max: 1, default: 0.5 },
  generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IInventoryForecast>('InventoryForecast', InventoryForecastSchema);
