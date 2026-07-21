import { Router } from 'express';
import {
  accountsSummary,
  dailyClosing,
  listCashEntries,
  createCashMovement,
  listBanks,
  createBank,
  updateBank,
  bankTransfer,
} from '../controllers/accountController.js';
import { requireAuth, requireShopAccess } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess);

router.get('/summary', accountsSummary);
router.get('/daily', dailyClosing);
router.get('/cash', listCashEntries);
router.post('/cash', createCashMovement);
router.get('/banks', listBanks);
router.post('/banks', createBank);
router.patch('/banks/:id', updateBank);
router.post('/banks/:id/transfer', bankTransfer);

export default router;
