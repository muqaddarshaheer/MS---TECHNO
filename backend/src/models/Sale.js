import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    name: String,
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    buyPrice: { type: Number, default: 0, min: 0 },
    returnedQty: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const salePaymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Card', 'JazzCash', 'EasyPaisa', 'Credit'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', default: null },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    invoice: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    customerName: { type: String, default: 'Walk-in' },
    customerPhone: { type: String, default: '' },
    items: [saleItemSchema],
    subtotal: { type: Number, required: true },
    discountPct: { type: Number, default: 0 },
    taxPct: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment: { type: String, default: 'Cash' },
    payments: { type: [salePaymentSchema], default: [] },
    creditAmount: { type: Number, default: 0, min: 0 },
    source: { type: String, default: 'Walk-in' },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ['completed', 'partial_return', 'returned'],
      default: 'completed',
    },
    returnedAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

saleSchema.index({ shop: 1, invoice: 1 }, { unique: true });
saleSchema.index({ shop: 1, date: -1 });
saleSchema.index({ shop: 1, createdAt: -1 });
saleSchema.index({ shop: 1, customer: 1 });

export const Sale = mongoose.model('Sale', saleSchema);
