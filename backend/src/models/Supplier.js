import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    notes: { type: String, default: '' },
    /** Amount shop owes supplier */
    balance: { type: Number, default: 0, min: 0 },
    openingDue: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

supplierSchema.index({ shop: 1, name: 1 });

export const Supplier = mongoose.model('Supplier', supplierSchema);
