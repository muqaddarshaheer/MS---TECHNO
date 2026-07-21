import mongoose from 'mongoose';

const returnItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    name: String,
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    lineRefund: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleReturnSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true, index: true },
    invoice: { type: String, required: true },
    returnNo: { type: String, required: true },
    items: { type: [returnItemSchema], default: [] },
    refundAmount: { type: Number, required: true, min: 0 },
    refundMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Card', 'JazzCash', 'EasyPaisa', 'Credit'],
      default: 'Cash',
    },
    bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', default: null },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    note: { type: String, default: '' },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

saleReturnSchema.index({ shop: 1, returnNo: 1 }, { unique: true });
saleReturnSchema.index({ shop: 1, date: -1 });

export const SaleReturn = mongoose.model('SaleReturn', saleReturnSchema);
