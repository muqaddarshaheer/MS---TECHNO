import { Router } from 'express';
import {
  getShopSettings,
  updateShopSettings,
  listAuditLogs,
} from '../controllers/shopSettingsController.js';
import { requireAuth, requireShopAccess, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess);

router.get('/', requirePermission('settings'), getShopSettings);
router.patch('/', requirePermission('settings'), updateShopSettings);
router.get('/audit', requirePermission('audit'), listAuditLogs);

export default router;
