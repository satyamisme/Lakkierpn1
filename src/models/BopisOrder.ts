import mongoose from "mongoose";

const BopisOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
  }],
  status: { 
    type: String, 
    enum: ['pending', 'picked', 'completed'], 
    default: 'pending' 
  },
  pickupDeadline: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.BopisOrder || mongoose.model("BopisOrder", BopisOrderSchema);
