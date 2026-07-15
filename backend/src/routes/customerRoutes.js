import { Router } from 'express';
import { listCustomers } from '../controllers/customerController.js';
import { requireAuth, requireShopAccess } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess);
router.get('/', listCustomers);
export default router;
