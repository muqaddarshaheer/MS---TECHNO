import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    source: { type: String, default: 'Walk-in' },
    orders: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Customer = mongoose.model('Customer', customerSchema);
