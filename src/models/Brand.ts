import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  logoUrl: { type: String }
}, { timestamps: true });

export default mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
