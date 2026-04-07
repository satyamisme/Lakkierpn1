import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Rent', 'Electricity', 'Tea', 'Mandoob', 'Other'], 
    default: 'Other' 
  },
  receiptUrl: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
