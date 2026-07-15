import { Router } from 'express';
import {
  listSales,
  createSale,
  getSale,
  dashboardStats,
  report,
} from '../controllers/saleController.js';
import { requireAuth, requireShopAccess } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireShopAccess);
router.get('/dashboard', dashboardStats);
router.get('/report', report);
router.get('/', listSales);
router.post('/', createSale);
router.get('/:id', getSale);

export default router;
