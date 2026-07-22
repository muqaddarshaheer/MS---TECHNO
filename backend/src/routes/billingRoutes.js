import { Router } from 'express';
import {
  listSubscriptionPayments,
  createSubscriptionPayment,
  subscriptionRevenue,
} from '../controllers/billingController.js';
import { requireAuth, requireSuper } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireSuper);

router.get('/payments', listSubscriptionPayments);
router.post('/payments', createSubscriptionPayment);
router.get('/revenue', subscriptionRevenue);

export default router;
