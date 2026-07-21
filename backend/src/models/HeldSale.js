import mongoose from 'mongoose';

const heldItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    max: { type: Number, default: 0 },
  },
  { _id: false }
);

const heldSaleSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    label: { type: String, default: '' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    customerName: { type: String, default: 'Walk-in' },
    customerPhone: { type: String, default: '' },
    items: { type: [heldItemSchema], default: [] },
    discountPct: { type: Number, default: 0 },
    taxPct: { type: Number, default: 0 },
    source: { type: String, default: 'Walk-in' },
    payment: { type: String, default: 'Cash' },
    payMode: { type: String, default: 'single' },
    cashAmt: { type: Number, default: 0 },
    bankAmt: { type: Number, default: 0 },
    bankMethod: { type: String, default: 'JazzCash' },
    bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', default: null },
    creditAmt: { type: Number, default: 0 },
  },
  { timestamps: true }
);

heldSaleSchema.index({ shop: 1, createdAt: -1 });

export const HeldSale = mongoose.model('HeldSale', heldSaleSchema);
