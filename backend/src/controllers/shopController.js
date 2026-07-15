import { body, validationResult } from 'express-validator';
import { Shop } from '../models/Shop.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Sale } from '../models/Sale.js';
import { Customer } from '../models/Customer.js';
import { Review } from '../models/Review.js';
import { Expense } from '../models/Expense.js';
import { getPlan, uniqueSlug as makeUniqueSlug } from '../config/plans.js';

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    return false;
  }
  return true;
}

function enrichShop(shop, username) {
  const obj = shop.toObject ? shop.toObject() : { ...shop };
  const planStart = obj.planStart || obj.createdAt;
  const expiry = obj.expiry;
  const plan = getPlan(obj.package);
  const limits = {
    ...plan,
    maxProducts: obj.maxProductsOverride || plan.maxProducts,
  };
  const paymentOverdue = (() => {
    if (obj.payment === 'paid') return false;
    const due = obj.paymentDueDate || obj.planStart || obj.createdAt;
    if (!due) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(due);
    dueDate.setHours(0, 0, 0, 0);
    return today > dueDate;
  })();
  const expired = new Date(expiry) < new Date();
  let computedStatus = obj.status;
  if (obj.status === 'blocked' || obj.status === 'suspended') computedStatus = obj.status;
  else if (expired || obj.status === 'expired') computedStatus = 'expired';
  else if (obj.restrictOnPaymentOverdue && paymentOverdue) computedStatus = 'payment_overdue';
  else computedStatus = obj.status;

  return {
    ...obj,
    id: obj._id,
    username: username || null,
    planStart,
    planEnd: expiry,
    durationLabel: Shop.formatDuration(planStart, expiry, obj.durationMonths),
    paymentDueDate: obj.paymentDueDate || planStart,
    paymentOverdue,
    computedStatus,
    plan: limits,
    tenant: {
      slug: obj.slug,
      isTenant: obj.isTenant !== false,
      isolation: 'shop_id',
    },
  };
}

export const createShopValidators = [
  body('name').trim().notEmpty().withMessage('Shop name is required'),
  body('owner').trim().notEmpty().withMessage('Owner is required'),
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export async function createShop(req, res, next) {
  try {
    if (!validate(req, res)) return;

    const username = req.body.username.trim().toLowerCase();
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const planStart = new Date(req.body.planStart || new Date());
    const durationMonths = Number(req.body.durationMonths) || 12;
    const expiry = req.body.expiry
      ? new Date(req.body.expiry)
      : Shop.computeExpiry(planStart, durationMonths);
    const paymentDueDate = req.body.paymentDueDate
      ? new Date(req.body.paymentDueDate)
      : new Date(planStart);

    const slug = await makeUniqueSlug(Shop, req.body.name);

    const shop = await Shop.create({
      name: req.body.name.trim(),
      slug,
      owner: req.body.owner.trim(),
      phone: req.body.phone || '',
      email: req.body.email || '',
      package: req.body.package || 'Basic',
      payment: req.body.payment || 'pending',
      paymentMethod: req.body.paymentMethod || 'Cash',
      planStart,
      durationMonths,
      expiry,
      paymentDueDate,
      restrictOnPaymentOverdue:
        req.body.restrictOnPaymentOverdue === undefined
          ? true
          : Boolean(req.body.restrictOnPaymentOverdue),
      status: req.body.status || 'active',
      openTime: req.body.openTime || '09:00',
      closeTime: req.body.closeTime || '22:00',
      isTenant: true,
    });

    await User.create({
      username,
      password: req.body.password,
      role: 'shop',
      shop: shop._id,
    });

    res.status(201).json({
      message: 'Shop created successfully',
      shop: enrichShop(shop, username),
      credentials: { username },
    });
  } catch (err) {
    next(err);
  }
}

export async function listShops(req, res, next) {
  try {
    const shops = await Shop.find().sort({ createdAt: -1 });
    const withUsers = await Promise.all(
      shops.map(async (shop) => {
        const user = await User.findOne({ shop: shop._id, role: 'shop' }).select('username isActive');
        return enrichShop(shop, user?.username);
      })
    );
    res.json({ shops: withUsers });
  } catch (err) {
    next(err);
  }
}

export async function getShop(req, res, next) {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    const user = await User.findOne({ shop: shop._id, role: 'shop' }).select('username isActive');
    res.json({ shop: enrichShop(shop, user?.username), username: user?.username || null });
  } catch (err) {
    next(err);
  }
}

export async function updateShop(req, res, next) {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const fields = [
      'name',
      'owner',
      'phone',
      'email',
      'package',
      'payment',
      'paymentMethod',
      'status',
      'openTime',
      'closeTime',
      'durationMonths',
      'restrictOnPaymentOverdue',
    ];
    for (const key of fields) {
      if (req.body[key] !== undefined) shop[key] = req.body[key];
    }
    if (req.body.planStart) shop.planStart = new Date(req.body.planStart);
    if (req.body.expiry) shop.expiry = new Date(req.body.expiry);
    if (req.body.paymentDueDate !== undefined) {
      shop.paymentDueDate = req.body.paymentDueDate
        ? new Date(req.body.paymentDueDate)
        : null;
    }

    if (req.body.recalcExpiryFromDuration && shop.planStart && shop.durationMonths) {
      shop.expiry = Shop.computeExpiry(shop.planStart, shop.durationMonths);
    }

    await shop.save();
    const user = await User.findOne({ shop: shop._id, role: 'shop' }).select('username');
    res.json({ message: 'Shop updated', shop: enrichShop(shop, user?.username) });
  } catch (err) {
    next(err);
  }
}

export async function setShopStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['active', 'expired', 'blocked', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const shop = await Shop.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ message: `Shop marked as ${status}`, shop: enrichShop(shop) });
  } catch (err) {
    next(err);
  }
}

export async function renewShop(req, res, next) {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const years = Number(req.body.years) || 0;
    const days = Number(req.body.days) || 0;
    const months = Number(req.body.months) || 0;

    const base = new Date(Math.max(Date.now(), new Date(shop.expiry).getTime()));
    if (years) base.setFullYear(base.getFullYear() + years);
    if (months) base.setMonth(base.getMonth() + months);
    if (days) base.setDate(base.getDate() + days);
    if (!years && !months && !days) {
      base.setFullYear(base.getFullYear() + 1);
    }

    shop.planStart = new Date();
    shop.expiry = base;
    const diffDays = Math.max(1, Math.round((shop.expiry - shop.planStart) / 86400000));
    shop.durationMonths = Math.max(1, Math.round(diffDays / 30.44));
    shop.paymentDueDate = new Date();
    shop.status = 'active';
    shop.payment = 'paid';
    await shop.save();
    res.json({ message: 'Shop renewed', shop: enrichShop(shop) });
  } catch (err) {
    next(err);
  }
}

/** Toggle auto-restrict on payment overdue, and/or immediately block if already overdue */
export async function setPaymentRestriction(req, res, next) {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    if (req.body.restrictOnPaymentOverdue !== undefined) {
      shop.restrictOnPaymentOverdue = Boolean(req.body.restrictOnPaymentOverdue);
    }
    if (req.body.paymentDueDate !== undefined) {
      shop.paymentDueDate = req.body.paymentDueDate
        ? new Date(req.body.paymentDueDate)
        : null;
    }
    if (req.body.payment !== undefined) {
      shop.payment = req.body.payment;
    }

    const applyNow = Boolean(req.body.applyRestrictionNow);
    if (applyNow && shop.isPaymentOverdue()) {
      shop.status = 'blocked';
    }

    await shop.save();
    const user = await User.findOne({ shop: shop._id, role: 'shop' }).select('username');
    res.json({
      message: applyNow && shop.status === 'blocked'
        ? 'Shop restricted due to overdue payment'
        : 'Payment restriction settings updated',
      shop: enrichShop(shop, user?.username),
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteShop(req, res, next) {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const shopId = shop._id;
    await Promise.all([
      User.deleteMany({ shop: shopId }),
      Product.deleteMany({ shop: shopId }),
      Sale.deleteMany({ shop: shopId }),
      Customer.deleteMany({ shop: shopId }),
      Review.deleteMany({ shop: shopId }),
      Expense.deleteMany({ shop: shopId }),
      Shop.deleteOne({ _id: shopId }),
    ]);

    res.json({ message: 'Shop and related data deleted' });
  } catch (err) {
    next(err);
  }
}

export async function superStats(req, res, next) {
  try {
    const shops = await Shop.find();
    let active = 0;
    let expired = 0;
    let blocked = 0;
    let paymentOverdue = 0;
    for (const s of shops) {
      const isExpired = new Date(s.expiry) < new Date();
      const overdue = s.isPaymentOverdue();
      if (overdue) paymentOverdue += 1;
      if (s.status === 'blocked' || s.status === 'suspended') blocked += 1;
      else if (s.status === 'expired' || isExpired) expired += 1;
      else active += 1;
    }
    res.json({ total: shops.length, active, expired, blocked, paymentOverdue });
  } catch (err) {
    next(err);
  }
}

export { enrichShop };
