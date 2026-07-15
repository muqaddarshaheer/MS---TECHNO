import { Router } from 'express';
import {
  listReviews,
  createReview,
  replyReview,
} from '../controllers/reviewController.js';
import { requireAuth, requireShopAccess } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess);
router.get('/', listReviews);
router.post('/', createReview);
router.post('/:id/reply', replyReview);
export default router;
