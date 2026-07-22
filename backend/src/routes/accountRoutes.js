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
import { requireAuth, requireShopAccess, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess);

/** Cashiers need bank list for POS / receive payment */
router.get('/banks', requirePermission('pos'), listBanks);

router.get('/summary', requirePermission('accounts'), accountsSummary);
router.get('/daily', requirePermission('accounts'), dailyClosing);
router.get('/cash', requirePermission('accounts'), listCashEntries);
router.post('/cash', requirePermission('accounts'), createCashMovement);
router.post('/banks', requirePermission('accounts'), createBank);
router.patch('/banks/:id', requirePermission('accounts'), updateBank);
router.post('/banks/:id/transfer', requirePermission('accounts'), bankTransfer);

export default router;
