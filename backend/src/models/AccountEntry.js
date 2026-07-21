import mongoose from 'mongoose';

const accountEntrySchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    type: {
      type: String,
      enum: [
        'opening_cash',
        'sale_cash',
        'sale_bank',
        'expense',
        'cash_in',
        'cash_out',
        'bank_deposit',
        'bank_withdraw',
        'customer_transfer',
        'customer_to_bank',
        'bank_to_cash',
        'customer_payment',
        'supplier_payment',
        'supplier_opening',
        'customer_credit',
        'sale_return_cash',
        'sale_return_bank',
        'sale_return_credit',
        'purchase_cash',
        'purchase_bank',
        'purchase_credit',
      ],
      required: true,
    },
    /** Positive = money in for cash/bank; for party lines amount is absolute with type meaning */
    amount: { type: Number, required: true },
    date: { type: String, required: true, index: true },
    method: { type: String, default: 'Cash' },
    bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', default: null },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
    sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', default: null },
    saleReturn: { type: mongoose.Schema.Types.ObjectId, ref: 'SaleReturn', default: null },
    purchase: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', default: null },
    expense: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', default: null },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

accountEntrySchema.index({ shop: 1, date: -1 });
accountEntrySchema.index({ shop: 1, customer: 1, createdAt: -1 });
accountEntrySchema.index({ shop: 1, supplier: 1, createdAt: -1 });
accountEntrySchema.index({ shop: 1, type: 1, date: -1 });

export const AccountEntry = mongoose.model('AccountEntry', accountEntrySchema);
