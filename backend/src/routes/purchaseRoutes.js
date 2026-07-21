import { Router } from 'express';
import {
  listPurchases,
  getPurchase,
  createPurchase,
  cancelPurchase,
  purchaseReport,
} from '../controllers/purchaseController.js';
import { requireAuth, requireShopAccess } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess);

router.get('/report', purchaseReport);
router.get('/', listPurchases);
router.post('/', createPurchase);
router.get('/:id', getPurchase);
router.post('/:id/cancel', cancelPurchase);

export default router;
