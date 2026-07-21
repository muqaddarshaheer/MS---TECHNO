import { Purchase } from '../models/Purchase.js';
import { Product } from '../models/Product.js';
import { Supplier } from '../models/Supplier.js';
import { Shop } from '../models/Shop.js';
import { AccountEntry } from '../models/AccountEntry.js';
import { getShopId } from '../middleware/auth.js';
import {
  ensureShopAccountsDefaults,
  postPurchaseEntries,
  todayStr,
  isBankLikeMethod,
  isCashMethod,
} from '../services/accountService.js';

function normalizePayments(body, total) {
  let payments = Array.isArray(body.payments) ? body.payments : [];
  let creditAmount = Number(body.creditAmount);
  if (Number.isNaN(creditAmount)) creditAmount = 0;

  if (!payments.length && !creditAmount) {
    const method = body.payment || 'Credit';
    if (method === 'Credit' || method === 'credit') {
      payments = [];
      creditAmount = total;
    } else {
      payments = [
        {
          method,
          amount: total,
          bankAccount: body.bankAccount || null,
        },
      ];
      creditAmount = 0;
    }
  }

  payments = payments
    .map((p) => ({
      method: p.method || 'Cash',
      amount: Number(p.amount) || 0,
      bankAccount: p.bankAccount || null,
    }))
    .filter((p) => p.amount > 0);

  const paid = payments.reduce((s, p) => s + p.amount, 0);
  if (Array.isArray(body.payments) || body.creditAmount != null) {
    creditAmount = Number(body.creditAmount) || 0;
  } else if (creditAmount <= 0) {
    creditAmount = Math.max(0, Number((total - paid).toFixed(2)));
  }

  const sum = Number((paid + creditAmount).toFixed(2));
  if (Math.abs(sum - Number(total.toFixed(2))) > 0.05) {
    const err = new Error(
      `Payments (${paid}) + credit (${creditAmount}) must equal total (${total.toFixed(2)})`
    );
    err.status = 400;
    throw err;
  }

  const primary =
    creditAmount >= total && paid === 0
      ? 'Credit'
      : payments[0]?.method || (creditAmount > 0 ? 'Credit' : 'Cash');

  return { payments, creditAmount, primary };
}

export async function listPurchases(req, res, next) {
  try {
    const shopId = getShopId(req);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const filter = { shop: shopId, status: { $ne: 'cancelled' } };
    if (req.query.supplier) filter.supplier = req.query.supplier;
    if (req.query.date) filter.date = req.query.date;

    const [purchases, total] = await Promise.all([
      Purchase.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Purchase.countDocuments(filter),
    ]);
    res.json({ purchases, total, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function getPurchase(req, res, next) {
  try {
    const shopId = getShopId(req);
    const purchase = await Purchase.findOne({ _id: req.params.id, shop: shopId });
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    res.json({ purchase });
  } catch (err) {
    next(err);
  }
}

export async function createPurchase(req, res, next) {
  const shopId = getShopId(req);
  const stocked = [];
  try {
    await ensureShopAccountsDefaults(shopId);

    const supplierId = req.body.supplierId || req.body.supplier;
    if (!supplierId) {
      return res.status(400).json({ message: 'Supplier required' });
    }
    const supplier = await Supplier.findOne({ _id: supplierId, shop: shopId });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
    if (!rawItems.length) {
      return res.status(400).json({ message: 'Add at least one product' });
    }

    const lineItems = [];
    let subtotal = 0;
    for (const row of rawItems) {
      const qty = Number(row.qty) || 0;
      const cost = Number(row.cost != null ? row.cost : row.buyPrice) || 0;
      if (qty <= 0) {
        return res.status(400).json({ message: 'Invalid quantity' });
      }
      const product = await Product.findOne({ _id: row.productId || row.product, shop: shopId });
      if (!product) {
        return res.status(400).json({ message: 'Product not found' });
      }
      lineItems.push({
        product: product._id,
        name: product.name,
        qty,
        cost,
      });
      subtotal += cost * qty;
    }
    subtotal = Number(subtotal.toFixed(2));
    const total = subtotal;

    let payments;
    let creditAmount;
    let primary;
    try {
      ({ payments, creditAmount, primary } = normalizePayments(req.body, total));
    } catch (e) {
      return res.status(e.status || 400).json({ message: e.message });
    }

    for (const p of payments) {
      if (isBankLikeMethod(p.method) && !p.bankAccount) {
        return res.status(400).json({ message: 'Bank account required for bank payment' });
      }
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    shop.purchaseSeq = (shop.purchaseSeq || 1000) + 1;
    await shop.save();
    const purchaseNo = `PUR-${shop.purchaseSeq}`;

    // Apply stock first
    const updateBuyPrice = req.body.updateBuyPrice !== false;
    for (const line of lineItems) {
      const update = { $inc: { qty: line.qty } };
      if (updateBuyPrice && line.cost > 0) {
        update.$set = { buyPrice: line.cost };
      }
      const product = await Product.findOneAndUpdate(
        { _id: line.product, shop: shopId },
        update,
        { new: true }
      );
      if (!product) {
        // rollback stock
        for (const s of stocked) {
          await Product.updateOne(
            { _id: s.id, shop: shopId },
            { $inc: { qty: -s.qty } }
          );
        }
        return res.status(400).json({ message: 'Product missing while stocking' });
      }
      stocked.push({ id: line.product, qty: line.qty });
    }

    const purchase = await Purchase.create({
      shop: shopId,
      purchaseNo,
      supplier: supplier._id,
      supplierName: supplier.name,
      items: lineItems,
      subtotal,
      total,
      payments,
      creditAmount,
      payment: primary,
      status: 'received',
      note: req.body.note || '',
      date: req.body.date || todayStr(),
      stockApplied: true,
    });

    try {
      await postPurchaseEntries({ shopId, purchase, payments, creditAmount });
    } catch (err) {
      for (const s of stocked) {
        await Product.updateOne({ _id: s.id, shop: shopId }, { $inc: { qty: -s.qty } });
      }
      await Purchase.deleteOne({ _id: purchase._id });
      throw err;
    }

    const freshSupplier = await Supplier.findById(supplier._id);
    res.status(201).json({ purchase, supplier: freshSupplier });
  } catch (err) {
    for (const s of stocked) {
      try {
        await Product.updateOne({ _id: s.id, shop: shopId }, { $inc: { qty: -s.qty } });
      } catch {
        /* ignore */
      }
    }
    next(err);
  }
}

export async function cancelPurchase(req, res, next) {
  const shopId = getShopId(req);
  try {
    const purchase = await Purchase.findOne({ _id: req.params.id, shop: shopId });
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    if (purchase.status === 'cancelled') {
      return res.status(400).json({ message: 'Already cancelled' });
    }

    // Reverse stock
    for (const line of purchase.items || []) {
      const product = await Product.findOne({ _id: line.product, shop: shopId });
      if (!product) continue;
      if (product.qty < line.qty) {
        return res.status(400).json({
          message: `Cannot cancel: ${line.name} stock is lower than purchased qty`,
        });
      }
    }
    for (const line of purchase.items || []) {
      await Product.updateOne(
        { _id: line.product, shop: shopId },
        { $inc: { qty: -line.qty } }
      );
    }

    // Reverse supplier due from this purchase's credit
    if ((purchase.creditAmount || 0) > 0) {
      const supplier = await Supplier.findOne({ _id: purchase.supplier, shop: shopId });
      if (supplier) {
        supplier.balance = Math.max(
          0,
          Number((supplier.balance - purchase.creditAmount).toFixed(2))
        );
        await supplier.save();
      }
    }

    // Remove purchase ledger lines (cash/bank go back by deleting entries)
    await AccountEntry.deleteMany({ shop: shopId, purchase: purchase._id });

    purchase.status = 'cancelled';
    purchase.stockApplied = false;
    await purchase.save();

    res.json({ message: 'Purchase cancelled', purchase });
  } catch (err) {
    next(err);
  }
}

export async function purchaseReport(req, res, next) {
  try {
    const shopId = getShopId(req);
    const type = req.query.type || 'monthly';
    const t = todayStr();
    const purchases = await Purchase.find({
      shop: shopId,
      status: { $ne: 'cancelled' },
    }).sort({ createdAt: -1 });

    let data = purchases;
    let title = 'Yearly Purchase Report';

    if (type === 'daily') {
      data = purchases.filter((p) => p.date === t);
      title = 'Daily Purchase Report';
    } else if (type === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      data = purchases.filter((p) => new Date(p.date) >= weekAgo);
      title = 'Weekly Purchase Report';
    } else if (type === 'monthly') {
      data = purchases.filter((p) => p.date?.startsWith(t.slice(0, 7)));
      title = 'Monthly Purchase Report';
    } else if (type === 'yearly') {
      data = purchases.filter((p) => p.date?.startsWith(t.slice(0, 4)));
      title = 'Yearly Purchase Report';
    }

    const total = data.reduce((s, p) => s + (p.total || 0), 0);
    const credit = data.reduce((s, p) => s + (p.creditAmount || 0), 0);
    const paid = total - credit;

    res.json({
      title,
      count: data.length,
      total: Number(total.toFixed(2)),
      paid: Number(paid.toFixed(2)),
      credit: Number(credit.toFixed(2)),
      purchases: data,
    });
  } catch (err) {
    next(err);
  }
}

export { isCashMethod };
