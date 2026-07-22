import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: '' },
    model: { type: String, default: '' },
    category: { type: String, default: 'General' },
    subcategory: { type: String, default: '' },
    sku: { type: String, default: '', trim: true },
    barcode: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '' },
    qty: { type: Number, default: 0, min: 0 },
    buyPrice: { type: Number, default: 0, min: 0 },
    sellPrice: { type: Number, default: 0, min: 0 },
    wholesalePrice: { type: Number, default: 0, min: 0 },
    dealerPrice: { type: Number, default: 0, min: 0 },
    vipPrice: { type: Number, default: 0, min: 0 },
    offerPrice: { type: Number, default: 0, min: 0 },
    minPrice: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 5, min: 0 },
    maxStock: { type: Number, default: 0, min: 0 },
    batchNumber: { type: String, default: '' },
    expiryDate: { type: String, default: '' },
    desc: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
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
productSchema.index({ shop: 1, expiryDate: 1 });
productSchema.index({ shop: 1, qty: 1 });

/** Resolve sell price by customer group */
productSchema.methods.priceForGroup = function priceForGroup(group = 'retail') {
  const g = String(group || 'retail').toLowerCase();
  let price = this.sellPrice;
  if (g === 'wholesale' && this.wholesalePrice > 0) price = this.wholesalePrice;
  else if (g === 'dealer' && this.dealerPrice > 0) price = this.dealerPrice;
  else if (g === 'vip' && this.vipPrice > 0) price = this.vipPrice;
  if (this.offerPrice > 0 && this.offerPrice < price) price = this.offerPrice;
  if (this.minPrice > 0 && price < this.minPrice) price = this.minPrice;
  return price;
};

export const Product = mongoose.model('Product', productSchema);
