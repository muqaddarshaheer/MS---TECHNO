import { body, validationResult } from 'express-validator';
import { TenantRequest } from '../models/TenantRequest.js';
import { Shop } from '../models/Shop.js';
import { User } from '../models/User.js';
import {
  listPlans,
  getPlan,
  slugify,
  uniqueSlug as makeUniqueSlug,
  generateShopPassword,
  shopLoginLink,
} from '../config/plans.js';

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    return false;
  }
  return true;
}

export async function getPublicPlans(req, res) {
  res.json({
    platform: 'MS Techno',
    product: 'Cloud Perfume ERP',
    multiTenant: true,
    plans: listPlans({ publicOnly: true }),
  });
}

export const signupValidators = [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('package').optional().isIn(['Basic', 'Premium', 'Enterprise']),
];

export async function createSignupRequest(req, res, next) {
  try {
    if (!validate(req, res)) return;

    const email = req.body.email.trim().toLowerCase();
    const existing = await TenantRequest.findOne({ email, status: 'pending' });
    if (existing) {
      return res.status(409).json({
        message: 'You already have a pending signup request with this email.',
      });
    }

    const request = await TenantRequest.create({
      businessName: req.body.businessName.trim(),
      ownerName: req.body.ownerName.trim(),
      email,
      phone: req.body.phone || '',
      package: req.body.package || 'Basic',
      durationMonths: Number(req.body.durationMonths) || 12,
      message: req.body.message || '',
      preferredUsername: (req.body.preferredUsername || '').trim().toLowerCase(),
    });

    res.status(201).json({
      message:
        'Signup request submitted. MS Techno will review and activate your shop tenant.',
      request: {
        id: request._id,
        businessName: request.businessName,
        package: request.package,
        status: request.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listSignupRequests(req, res, next) {
  try {
    const status = req.query.status;
    const filter = status ? { status } : {};
    const requests = await TenantRequest.find(filter).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    next(err);
  }
}

export async function rejectSignupRequest(req, res, next) {
  try {
    const request = await TenantRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }
    request.status = 'rejected';
    request.reviewedAt = new Date();
    request.notes = req.body.notes || '';
    await request.save();
    res.json({ message: 'Request rejected', request });
  } catch (err) {
    next(err);
  }
}

export async function approveSignupRequest(req, res, next) {
  try {
    const request = await TenantRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    let username =
      (req.body.username || request.preferredUsername || slugify(request.businessName)).toLowerCase();
    username = username.replace(/[^a-z0-9_]/g, '').slice(0, 24) || 'shop';
    if (await User.findOne({ username })) {
      username = `${username}${Date.now().toString().slice(-4)}`;
    }

    const password = req.body.password || generateShopPassword();
    const planStart = new Date();
    const durationMonths = Number(req.body.durationMonths || request.durationMonths) || 12;
    const pkg = req.body.package || request.package;
    const expiry = Shop.computeExpiry(planStart, durationMonths);
    const slug = await makeUniqueSlug(Shop, request.businessName);

    const shop = await Shop.create({
      name: request.businessName,
      slug,
      owner: request.ownerName,
      phone: request.phone,
      email: request.email,
      package: pkg,
      payment: req.body.payment || 'pending',
      planStart,
      durationMonths,
      expiry,
      paymentDueDate: req.body.paymentDueDate
        ? new Date(req.body.paymentDueDate)
        : planStart,
      restrictOnPaymentOverdue: true,
      status: 'active',
      isTenant: true,
    });

    await User.create({
      username,
      password,
      role: 'shop',
      shop: shop._id,
    });

    request.status = 'approved';
    request.reviewedAt = new Date();
    request.createdShop = shop._id;
    request.notes = req.body.notes || '';
    await request.save();

    const plan = getPlan(pkg);
    const loginLink = shopLoginLink(username);
    res.json({
      message: 'Tenant approved and shop created',
      credentials: {
        username,
        password,
        loginLink,
        note: 'Share these credentials once. Passwords are never shown again in shop listings.',
      },
      shop,
      plan,
      request,
    });
  } catch (err) {
    next(err);
  }
}
