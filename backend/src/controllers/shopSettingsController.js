import { Shop } from '../models/Shop.js';
import { AuditLog } from '../models/AuditLog.js';
import { getShopId } from '../middleware/auth.js';
import { writeAudit } from '../services/auditService.js';
import { getPlan } from '../config/plans.js';

export async function getShopSettings(req, res, next) {
  try {
    const shopId = getShopId(req);
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    const plan = getPlan(shop.package);
    res.json({
      settings: {
        id: shop._id,
        name: shop.name,
        owner: shop.owner,
        phone: shop.phone,
        email: shop.email,
        address: shop.address || '',
        logoUrl: shop.logoUrl || '',
        invoiceFooter: shop.invoiceFooter || '',
        defaultTaxPct: shop.defaultTaxPct || 0,
        currency: shop.currency || 'PKR',
        openTime: shop.openTime,
        closeTime: shop.closeTime,
        package: shop.package,
        expiry: shop.expiry,
        plan: {
          name: plan.name,
          hasPos: Boolean(plan.features?.pos),
          maxProducts: plan.maxProducts,
          maxUsers: plan.maxUsers,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateShopSettings(req, res, next) {
  try {
    const shopId = getShopId(req);
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const before = {
      name: shop.name,
      phone: shop.phone,
      email: shop.email,
      address: shop.address,
      logoUrl: shop.logoUrl,
      invoiceFooter: shop.invoiceFooter,
      defaultTaxPct: shop.defaultTaxPct,
      currency: shop.currency,
      openTime: shop.openTime,
      closeTime: shop.closeTime,
    };

    const fields = [
      'name',
      'owner',
      'phone',
      'email',
      'address',
      'logoUrl',
      'invoiceFooter',
      'currency',
      'openTime',
      'closeTime',
    ];
    for (const key of fields) {
      if (req.body[key] !== undefined) shop[key] = String(req.body[key] ?? '').trim();
    }
    if (req.body.defaultTaxPct !== undefined) {
      shop.defaultTaxPct = Math.max(0, Number(req.body.defaultTaxPct) || 0);
    }

    await shop.save();
    await writeAudit({
      shopId,
      user: req.user,
      action: 'settings_update',
      entity: 'Shop',
      entityId: shop._id,
      reason: req.body.reason || 'Shop settings updated',
      before,
      after: {
        name: shop.name,
        phone: shop.phone,
        email: shop.email,
        address: shop.address,
        logoUrl: shop.logoUrl,
        invoiceFooter: shop.invoiceFooter,
        defaultTaxPct: shop.defaultTaxPct,
        currency: shop.currency,
        openTime: shop.openTime,
        closeTime: shop.closeTime,
      },
    });

    res.json({ message: 'Settings saved', settings: shop });
  } catch (err) {
    next(err);
  }
}

export async function listAuditLogs(req, res, next) {
  try {
    const shopId = getShopId(req);
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const logs = await AuditLog.find({ shop: shopId }).sort({ createdAt: -1 }).limit(limit);
    res.json({ logs });
  } catch (err) {
    next(err);
  }
}
