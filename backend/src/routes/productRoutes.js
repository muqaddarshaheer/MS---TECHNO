import { Router } from 'express';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
} from '../controllers/productController.js';
import { requireAuth, requireShopAccess } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireShopAccess);
router.get('/', listProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.post('/:id/stock', adjustStock);
router.delete('/:id', deleteProduct);

export default router;
