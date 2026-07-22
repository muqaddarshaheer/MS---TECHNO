import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productName: { type: String, default: '' },
    delta: { type: Number, required: true },
    qtyAfter: { type: Number, required: true, min: 0 },
    reason: {
      type: String,
      enum: ['adjustment', 'damage', 'lost', 'receive', 'sale', 'return', 'purchase', 'cancel_purchase'],
      default: 'adjustment',
    },
    note: { type: String, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

stockMovementSchema.index({ shop: 1, createdAt: -1 });

export const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
