import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: '' },
    category: { type: String, default: 'General' },
    qty: { type: Number, default: 0, min: 0 },
    buyPrice: { type: Number, default: 0, min: 0 },
    sellPrice: { type: Number, default: 0, min: 0 },
    barcode: { type: String, default: '', trim: true },
    desc: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.index(
  { shop: 1, barcode: 1 },
  {
    unique: true,
    partialFilterExpression: { barcode: { $type: 'string', $gt: '' } },
  }
);
productSchema.index({ shop: 1, name: 1 });

export const Product = mongoose.model('Product', productSchema);
