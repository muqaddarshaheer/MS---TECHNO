import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: 'MS Techno' },
    category: { type: String, default: 'General' },
    qty: { type: Number, default: 0, min: 0 },
    buyPrice: { type: Number, default: 0, min: 0 },
    sellPrice: { type: Number, default: 0, min: 0 },
    barcode: { type: String, default: '' },
    desc: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
