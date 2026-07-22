import { SubscriptionPayment } from '../models/SubscriptionPayment.js';
import { Shop } from '../models/Shop.js';
import { getPlan } from '../config/plans.js';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

async function nextInvoiceNo() {
  const count = await SubscriptionPayment.countDocuments();
  return `SUB-${1000 + count + 1}`;
}

export async function listSubscriptionPayments(req, res, next) {
  try {
    const filter = {};
    if (req.query.shopId) filter.shop = req.query.shopId;
    const payments = await SubscriptionPayment.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ payments });
  } catch (err) {
    next(err);
  }
}

export async function createSubscriptionPayment(req, res, next) {
  try {
    const shop = await Shop.findById(req.body.shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    const months = Math.max(1, Number(req.body.months) || 1);
    const renew = req.body.renew !== false;

    let renewedUntil = null;
    if (renew) {
      const base =
        shop.expiry && new Date(shop.expiry) > new Date() ? new Date(shop.expiry) : new Date();
      base.setMonth(base.getMonth() + months);
      shop.expiry = base;
      shop.durationMonths = (shop.durationMonths || 0) + months;
      shop.payment = 'paid';
      shop.paymentDueDate = new Date();
      if (shop.status === 'expired') shop.status = 'active';
      if (req.body.package && ['Basic', 'Premium', 'Enterprise'].includes(req.body.package)) {
        shop.package = req.body.package;
      }
      await shop.save();
      renewedUntil = shop.expiry;
    } else if (req.body.markPaid) {
      shop.payment = 'paid';
      shop.paymentDueDate = new Date();
      await shop.save();
    }

    const payment = await SubscriptionPayment.create({
      shop: shop._id,
      shopName: shop.name,
      invoiceNo: await nextInvoiceNo(),
      amount,
      method: req.body.method || 'Cash',
      package: shop.package,
      months,
      note: req.body.note || '',
      date: req.body.date || todayStr(),
      recordedBy: req.user?._id || null,
      renewedUntil,
    });

    res.status(201).json({ payment, shop });
  } catch (err) {
    next(err);
  }
}

export async function subscriptionRevenue(req, res, next) {
  try {
    const type = req.query.type || 'monthly';
    const t = todayStr();
    const payments = await SubscriptionPayment.find({}).sort({ createdAt: -1 });

    let data = payments;
    let title = 'Yearly SaaS revenue';
    if (type === 'daily') {
      data = payments.filter((p) => p.date === t);
      title = 'Daily SaaS revenue';
    } else if (type === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      data = payments.filter((p) => new Date(p.date) >= weekAgo);
      title = 'Weekly SaaS revenue';
    } else if (type === 'monthly') {
      data = payments.filter((p) => p.date?.startsWith(t.slice(0, 7)));
      title = 'Monthly SaaS revenue';
    } else if (type === 'yearly') {
      data = payments.filter((p) => p.date?.startsWith(t.slice(0, 4)));
      title = 'Yearly SaaS revenue';
    }

    const total = data.reduce((s, p) => s + (p.amount || 0), 0);
    const byPackage = {};
    for (const p of data) {
      const key = p.package || 'Basic';
      byPackage[key] = (byPackage[key] || 0) + (p.amount || 0);
    }

    res.json({
      title,
      count: data.length,
      total: Number(total.toFixed(2)),
      byPackage,
      planPrices: {
        Basic: getPlan('Basic').priceMonthlyPkr,
        Premium: getPlan('Premium').priceMonthlyPkr,
        Enterprise: getPlan('Enterprise').priceMonthlyPkr,
      },
      payments: data,
    });
  } catch (err) {
    next(err);
  }
}
