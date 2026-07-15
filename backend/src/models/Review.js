import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    customer: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, default: '' },
    reply: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'replied'], default: 'pending' },
  },
  { timestamps: true }
);

export const Review = mongoose.model('Review', reviewSchema);
