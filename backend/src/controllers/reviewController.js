import { Review } from '../models/Review.js';
import { getShopId } from '../middleware/auth.js';

export async function listReviews(req, res, next) {
  try {
    const shopId = getShopId(req);
    const reviews = await Review.find({ shop: shopId }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

export async function createReview(req, res, next) {
  try {
    const shopId = getShopId(req);
    const review = await Review.create({
      shop: shopId,
      customer: req.body.customer || 'Customer',
      rating: Number(req.body.rating) || 5,
      review: req.body.review || '',
      status: 'pending',
    });
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

export async function replyReview(req, res, next) {
  try {
    const shopId = getShopId(req);
    const review = await Review.findOne({ _id: req.params.id, shop: shopId });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.reply = req.body.reply || '';
    review.status = 'replied';
    await review.save();
    res.json({ review });
  } catch (err) {
    next(err);
  }
}
