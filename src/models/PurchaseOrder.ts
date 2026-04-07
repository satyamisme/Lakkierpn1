import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true }
  }],
  landedCostBreakdown: {
    shipping: { type: Number, default: 0 },
    customs: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 }
  },
  totalLanded: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'received'], 
    default: 'draft' 
  },
  receivedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.PurchaseOrder || mongoose.model("PurchaseOrder", PurchaseOrderSchema);
