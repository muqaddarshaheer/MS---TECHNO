import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';
import { signToken } from '../middleware/auth.js';
import { getPlan } from '../config/plans.js';

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    return false;
  }
  return true;
}

function shopPayload(shop) {
  if (!shop) return null;
  const plan = getPlan(shop.package);
  const maxProducts =
    shop.maxProductsOverride != null ? shop.maxProductsOverride : plan.maxProducts;
  return {
    id: shop._id,
    name: shop.name,
    slug: shop.slug,
    owner: shop.owner,
    package: shop.package,
    planStart: shop.planStart,
    expiry: shop.expiry,
    durationMonths: shop.durationMonths,
    paymentDueDate: shop.paymentDueDate,
    payment: shop.payment,
    restrictOnPaymentOverdue: shop.restrictOnPaymentOverdue,
    status: shop.status,
    openTime: shop.openTime,
    closeTime: shop.closeTime,
    plan: {
      ...plan,
      maxProducts,
      hasPos: Boolean(plan.features?.pos),
      unlimitedProducts: maxProducts == null,
    },
  };
}

export async function listLoginShops(req, res, next) {
  try {
    const shops = await Shop.find({
      status: { $nin: ['blocked', 'suspended'] },
    })
      .sort({ name: 1 })
      .select('name');
    const users = await User.find({
      role: 'shop',
      shop: { $in: shops.map((s) => s._id) },
      isActive: true,
    }).select('username shop');

    const rows = users
      .map((u) => {
        const shop = shops.find((s) => s._id.equals(u.shop));
        if (!shop) return null;
        return { username: u.username, name: shop.name };
      })
      .filter(Boolean);

    res.json({ shops: rows });
  } catch (err) {
    next(err);
  }
}

export const loginValidators = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export async function login(req, res, next) {
  try {
    if (!validate(req, res)) return;

    const username = req.body.username.trim().toLowerCase();
    const { password } = req.body;

    const user = await User.findOne({ username }).populate('shop');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    if (user.role === 'shop') {
      const shop = user.shop;
      if (!shop) {
        return res.status(403).json({ message: 'Shop account is not linked' });
      }
      if (shop.status === 'blocked' || shop.status === 'suspended') {
        return res.status(403).json({
          message: 'This shop is blocked or suspended. Contact admin.',
          code: 'SHOP_DISABLED',
        });
      }
      if (new Date(shop.expiry) < new Date() || shop.status === 'expired') {
        return res.status(403).json({
          message: 'Subscription expired. Contact admin to renew.',
          code: 'SHOP_EXPIRED',
        });
      }
      if (shop.restrictOnPaymentOverdue && shop.isPaymentOverdue()) {
        return res.status(403).json({
          message: 'Access restricted: payment is past due. Contact admin.',
          code: 'PAYMENT_OVERDUE',
        });
      }
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        ...user.toSafeJSON(),
        shop: user.role === 'shop' && user.shop ? shopPayload(user.shop) : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    await req.user.populate('shop');
    const shop = req.user.shop;
    res.json({
      user: {
        ...req.user.toSafeJSON(),
        shop: shopPayload(shop),
      },
    });
  } catch (err) {
    next(err);
  }
}

export const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

export async function changePassword(req, res, next) {
  try {
    if (!validate(req, res)) return;

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    // Re-issue token so the session stays valid after password change
    const token = signToken(user);
    await user.populate('shop');
    res.json({
      message: 'Password updated successfully',
      token,
      user: {
        ...user.toSafeJSON(),
        shop: user.role === 'shop' ? shopPayload(user.shop) : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export const resetShopPasswordValidators = [
  body('shopId').notEmpty().withMessage('Shop id is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

export async function resetShopPassword(req, res, next) {
  try {
    if (!validate(req, res)) return;

    const shop = await Shop.findById(req.body.shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const user = await User.findOne({ shop: shop._id, role: 'shop' });
    if (!user) return res.status(404).json({ message: 'Shop user not found' });

    user.password = req.body.newPassword;
    await user.save();
    res.json({
      message: 'Shop password reset successfully',
      username: user.username,
      loginLink: `${String(process.env.CLIENT_URL || 'http://localhost:5173')
        .split(',')[0]
        .trim()
        .replace(/\/$/, '')}/login?u=${encodeURIComponent(user.username)}`,
    });
  } catch (err) {
    next(err);
  }
}
