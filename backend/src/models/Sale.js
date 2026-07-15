import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    invoice: { type: String, required: true },
    customerName: { type: String, default: 'Walk-in' },
    customerPhone: { type: String, default: '' },
    items: [saleItemSchema],
    subtotal: { type: Number, required: true },
    discountPct: { type: Number, default: 0 },
    taxPct: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment: { type: String, default: 'Cash' },
    source: { type: String, default: 'Walk-in' },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

saleSchema.index({ shop: 1, invoice: 1 }, { unique: true });

export const Sale = mongoose.model('Sale', saleSchema);
