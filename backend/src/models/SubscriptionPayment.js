import mongoose from 'mongoose';

const subscriptionPaymentSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    shopName: { type: String, default: '' },
    invoiceNo: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa', 'Card', 'Other'],
      default: 'Cash',
    },
    package: { type: String, default: 'Basic' },
    months: { type: Number, default: 1, min: 1 },
    note: { type: String, default: '' },
    date: { type: String, required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    /** Linked renew action */
    renewedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

subscriptionPaymentSchema.index({ shop: 1, createdAt: -1 });
subscriptionPaymentSchema.index({ date: -1 });
subscriptionPaymentSchema.index({ invoiceNo: 1 }, { unique: true });

export const SubscriptionPayment = mongoose.model('SubscriptionPayment', subscriptionPaymentSchema);
