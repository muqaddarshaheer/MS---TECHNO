import mongoose from 'mongoose';

const shopAccountsSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, unique: true },
    openingCash: { type: Number, default: 0 },
    openingCashSet: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ShopAccounts = mongoose.model('ShopAccounts', shopAccountsSchema);
