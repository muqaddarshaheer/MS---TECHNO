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
import { requireAuth, requireShopAccess, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireShopAccess);
router.get('/dashboard', requirePermission('dashboard'), dashboardStats);
router.get('/report', requirePermission('reports'), report);

router.get('/holds', requirePermission('pos'), listHolds);
router.post('/holds', requirePermission('pos'), createHold);
router.get('/holds/:id', requirePermission('pos'), getHold);
router.delete('/holds/:id', requirePermission('pos'), deleteHold);

router.get('/returns', requirePermission('invoices'), listSaleReturns);

router.get('/', requirePermission('invoices'), listSales);
router.post('/', requirePermission('pos'), createSale);
router.get('/:id', requirePermission('invoices'), getSale);
router.post('/:id/returns', requirePermission('invoices'), createSaleReturn);

export default router;
