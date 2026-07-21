import { HeldSale } from '../models/HeldSale.js';
import { Shop } from '../models/Shop.js';
import { getShopId } from '../middleware/auth.js';
import { planHasPos } from '../config/plans.js';

async function assertPos(shopId) {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    const err = new Error('Shop not found');
    err.status = 404;
    throw err;
  }
  if (!planHasPos(shop.package)) {
    const err = new Error('POS not available on this plan');
    err.status = 403;
    err.code = 'POS_NOT_ALLOWED';
    throw err;
  }
  return shop;
}

export async function listHolds(req, res, next) {
  try {
    const shopId = getShopId(req);
    await assertPos(shopId);
    const holds = await HeldSale.find({ shop: shopId }).sort({ createdAt: -1 }).limit(50);
    res.json({ holds });
  } catch (err) {
    next(err);
  }
}

export async function createHold(req, res, next) {
  try {
    const shopId = getShopId(req);
    await assertPos(shopId);
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const hold = await HeldSale.create({
      shop: shopId,
      label: req.body.label || req.body.customerName || 'Hold',
      customerId: req.body.customerId || null,
      customerName: req.body.customerName || 'Walk-in',
      customerPhone: req.body.customerPhone || '',
      items: items.map((it) => ({
        productId: it.productId,
        name: it.name,
        qty: Number(it.qty) || 1,
        price: Number(it.price) || 0,
        max: Number(it.max) || 0,
      })),
      discountPct: Number(req.body.discountPct) || 0,
      taxPct: Number(req.body.taxPct) || 0,
      source: req.body.source || 'Walk-in',
      payment: req.body.payment || 'Cash',
      payMode: req.body.payMode || 'single',
      cashAmt: Number(req.body.cashAmt) || 0,
      bankAmt: Number(req.body.bankAmt) || 0,
      bankMethod: req.body.bankMethod || 'JazzCash',
      bankAccount: req.body.bankAccount || null,
      creditAmt: Number(req.body.creditAmt) || 0,
    });

    res.status(201).json({ hold });
  } catch (err) {
    next(err);
  }
}

export async function getHold(req, res, next) {
  try {
    const shopId = getShopId(req);
    const hold = await HeldSale.findOne({ _id: req.params.id, shop: shopId });
    if (!hold) return res.status(404).json({ message: 'Hold not found' });
    res.json({ hold });
  } catch (err) {
    next(err);
  }
}

export async function deleteHold(req, res, next) {
  try {
    const shopId = getShopId(req);
    const hold = await HeldSale.findOneAndDelete({ _id: req.params.id, shop: shopId });
    if (!hold) return res.status(404).json({ message: 'Hold not found' });
    res.json({ message: 'Hold deleted', hold });
  } catch (err) {
    next(err);
  }
}
