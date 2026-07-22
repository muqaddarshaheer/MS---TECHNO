import { Router } from 'express';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  listStockMovements,
} from '../controllers/productController.js';
import { requireAuth, requireShopAccess, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireShopAccess);
router.get('/movements', requirePermission('stock'), listStockMovements);
router.get('/', requirePermission('catalog'), listProducts);
router.post('/', requirePermission('products'), createProduct);
router.put('/:id', requirePermission('products'), updateProduct);
router.post('/:id/stock', requirePermission('stock'), adjustStock);
router.delete('/:id', requirePermission('products'), deleteProduct);

export default router;
