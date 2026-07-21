import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, default: '' },
    qty: { type: Number, required: true, min: 1 },
    cost: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchasePaymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Card', 'JazzCash', 'EasyPaisa'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', default: null },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    purchaseNo: { type: String, required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    supplierName: { type: String, default: '' },
    items: { type: [purchaseItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    payments: { type: [purchasePaymentSchema], default: [] },
    /** Amount still owed to supplier from this purchase */
    creditAmount: { type: Number, default: 0, min: 0 },
    payment: { type: String, default: 'Credit' },
    status: {
      type: String,
      enum: ['received', 'cancelled'],
      default: 'received',
    },
    note: { type: String, default: '' },
    date: { type: String, required: true },
    stockApplied: { type: Boolean, default: true },
  },
  { timestamps: true }
);

purchaseSchema.index({ shop: 1, purchaseNo: 1 }, { unique: true });
purchaseSchema.index({ shop: 1, date: -1 });
purchaseSchema.index({ shop: 1, supplier: 1, createdAt: -1 });

export const Purchase = mongoose.model('Purchase', purchaseSchema);
