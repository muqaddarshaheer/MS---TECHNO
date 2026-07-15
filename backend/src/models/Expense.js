import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    desc: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export const Expense = mongoose.model('Expense', expenseSchema);
