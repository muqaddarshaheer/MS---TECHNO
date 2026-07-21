import { Router } from 'express';
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  supplierPayment,
  supplierLedger,
} from '../controllers/supplierController.js';
import { requireAuth, requireShopAccess } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess);

router.get('/', listSuppliers);
router.post('/', createSupplier);
router.patch('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);
router.post('/:id/payments', supplierPayment);
router.get('/:id/ledger', supplierLedger);

export default router;
