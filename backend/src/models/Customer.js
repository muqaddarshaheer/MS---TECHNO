import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    cnic: { type: String, default: '' },
    group: {
      type: String,
      enum: ['retail', 'wholesale', 'dealer', 'vip'],
      default: 'retail',
    },
    source: { type: String, default: 'Walk-in' },
    orders: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    /** Positive = customer owes the shop (udhaar) */
    balance: { type: Number, default: 0, min: 0 },
    creditLimit: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

customerSchema.index({ shop: 1, phone: 1 });
customerSchema.index({ shop: 1, name: 1 });

export const Customer = mongoose.model('Customer', customerSchema);
