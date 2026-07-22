import { Router } from 'express';
import {
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js';
import { requireAuth, requireShopAccess, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess, requirePermission('staff'));

router.get('/', listStaff);
router.post('/', createStaff);
router.patch('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
