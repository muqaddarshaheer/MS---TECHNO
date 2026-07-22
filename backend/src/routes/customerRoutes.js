import { Router } from 'express';
import {
  listCustomers,
  createCustomer,
  getCustomer,
  customerPayment,
  customerLedger,
} from '../controllers/customerController.js';
import { requireAuth, requireShopAccess, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess, requirePermission('customers'));
router.get('/', listCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomer);
router.post('/:id/payments', customerPayment);
router.get('/:id/ledger', customerLedger);
export default router;
