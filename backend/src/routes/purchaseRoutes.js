import { Router } from 'express';
import {
  listPurchases,
  getPurchase,
  createPurchase,
  cancelPurchase,
  purchaseReport,
} from '../controllers/purchaseController.js';
import { requireAuth, requireShopAccess, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess, requirePermission('purchases'));

router.get('/report', purchaseReport);
router.get('/', listPurchases);
router.post('/', createPurchase);
router.get('/:id', getPurchase);
router.post('/:id/cancel', cancelPurchase);

export default router;
