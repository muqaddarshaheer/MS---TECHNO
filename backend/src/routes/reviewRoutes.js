import { Router } from 'express';
import {
  listReviews,
  createReview,
  replyReview,
} from '../controllers/reviewController.js';
import { requireAuth, requireShopAccess, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess, requirePermission('reviews'));
router.get('/', listReviews);
router.post('/', createReview);
router.post('/:id/reply', replyReview);
export default router;
