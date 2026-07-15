import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';

export function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, shop: user.shop?.toString() || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireSuper(req, res, next) {
  if (req.user?.role !== 'super') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
}

export async function requireShopAccess(req, res, next) {
  try {
    if (req.user.role === 'super') {
      const shopId = req.params.shopId || req.body.shopId || req.query.shopId;
      if (shopId) {
        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        req.shop = shop;
      }
      return next();
    }

    if (req.user.role !== 'shop' || !req.user.shop) {
      return res.status(403).json({ message: 'Shop access required' });
    }

    const shop = await Shop.findById(req.user.shop);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    if (!shop.isAccessAllowed()) {
      const overdue = shop.restrictOnPaymentOverdue && shop.isPaymentOverdue();
      return res.status(403).json({
        message: overdue
          ? 'Access restricted: payment is past due. Contact admin.'
          : 'Shop is expired, blocked, or suspended. Contact admin.',
        code: overdue ? 'PAYMENT_OVERDUE' : 'SHOP_DISABLED',
        shop: {
          id: shop._id,
          status: shop.status,
          expiry: shop.expiry,
          paymentDueDate: shop.paymentDueDate,
          payment: shop.payment,
        },
      });
    }

    req.shop = shop;
    next();
  } catch (err) {
    next(err);
  }
}

export function getShopId(req) {
  if (req.user.role === 'shop') return req.user.shop.toString();
  return req.params.shopId || req.body.shopId || req.query.shopId;
}
