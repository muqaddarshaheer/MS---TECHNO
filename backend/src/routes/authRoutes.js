import { Router } from 'express';
import {
  login,
  loginValidators,
  me,
  changePassword,
  changePasswordValidators,
  resetShopPassword,
  resetShopPasswordValidators,
  listLoginShops,
} from '../controllers/authController.js';
import { requireAuth, requireSuper } from '../middleware/auth.js';

const router = Router();

router.get('/login-shops', listLoginShops);
router.post('/login', loginValidators, login);
router.get('/me', requireAuth, me);
router.post('/change-password', requireAuth, changePasswordValidators, changePassword);
router.post(
  '/reset-shop-password',
  requireAuth,
  requireSuper,
  resetShopPasswordValidators,
  resetShopPassword
);

export default router;
