import { Router } from 'express';
import {
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { requireAuth, requireSuper } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listAnnouncements);
router.post('/', requireAuth, requireSuper, createAnnouncement);
router.delete('/:id', requireAuth, requireSuper, deleteAnnouncement);

export default router;
