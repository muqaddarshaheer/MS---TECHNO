import { Router } from 'express';
import {
  listCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  adjustCustomerBalance,
  customerPayment,
  customerLedger,
} from '../controllers/customerController.js';
import { requireAuth, requireShopAccess, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess, requirePermission('customers'));
router.get('/', listCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomer);
router.patch('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);
router.post('/:id/adjust', adjustCustomerBalance);
router.post('/:id/payments', customerPayment);
router.get('/:id/ledger', customerLedger);
export default router;
