import { Router } from 'express';
import {
  getPublicPlans,
  createSignupRequest,
  signupValidators,
  listSignupRequests,
  approveSignupRequest,
  rejectSignupRequest,
} from '../controllers/tenantController.js';
import { requireAuth, requireSuper } from '../middleware/auth.js';

const router = Router();

router.get('/plans', getPublicPlans);
router.post('/signup-request', signupValidators, createSignupRequest);

router.get('/signup-requests', requireAuth, requireSuper, listSignupRequests);
router.post('/signup-requests/:id/approve', requireAuth, requireSuper, approveSignupRequest);
router.post('/signup-requests/:id/reject', requireAuth, requireSuper, rejectSignupRequest);

export default router;
