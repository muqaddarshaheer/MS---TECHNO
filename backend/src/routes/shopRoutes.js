import { Router } from 'express';
import {
  createShop,
  createShopValidators,
  listShops,
  getShop,
  getShopCredentials,
  updateShop,
  setShopStatus,
  renewShop,
  setPaymentRestriction,
  deleteShop,
  superStats,
} from '../controllers/shopController.js';
import { requireAuth, requireSuper } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireSuper);

router.get('/stats', superStats);
router.get('/', listShops);
router.post('/', createShopValidators, createShop);
router.get('/:id/credentials', getShopCredentials);
router.get('/:id', getShop);
router.put('/:id', updateShop);
router.patch('/:id/status', setShopStatus);
router.patch('/:id/payment-restriction', setPaymentRestriction);
router.post('/:id/renew', renewShop);
router.delete('/:id', deleteShop);

export default router;