import { Router } from 'express';
import {
  listSales,
  createSale,
  getSale,
  dashboardStats,
  report,
} from '../controllers/saleController.js';
import { createSaleReturn, listSaleReturns } from '../controllers/saleReturnController.js';
import {
  listHolds,
  createHold,
  getHold,
  deleteHold,
} from '../controllers/holdController.js';
import { requireAuth, requireShopAccess } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireShopAccess);
router.get('/dashboard', dashboardStats);
router.get('/report', report);

router.get('/holds', listHolds);
router.post('/holds', createHold);
router.get('/holds/:id', getHold);
router.delete('/holds/:id', deleteHold);

router.get('/returns', listSaleReturns);

router.get('/', listSales);
router.post('/', createSale);
router.get('/:id', getSale);
router.post('/:id/returns', createSaleReturn);

export default router;
