import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['bank', 'jazzcash', 'easypaisa', 'card'],
      default: 'bank',
    },
    openingBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bankAccountSchema.index({ shop: 1, name: 1 });

export const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
