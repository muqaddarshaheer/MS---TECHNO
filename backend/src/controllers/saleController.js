import { Product } from '../models/Product.js';
import { Sale } from '../models/Sale.js';
import { Customer } from '../models/Customer.js';
import { Shop } from '../models/Shop.js';
import { Expense } from '../models/Expense.js';
import { BankAccount } from '../models/BankAccount.js';
import { Purchase } from '../models/Purchase.js';
import { HeldSale } from '../models/HeldSale.js';
import { getShopId } from '../middleware/auth.js';
import { planHasPos } from '../config/plans.js';
import {
  ensureShopAccountsDefaults,
  postSaleEntries,
  getCashBalance,
  getTotalBankBalance,
  getPartyDues,
  todayStr,
  isBankLikeMethod,
} from '../services/accountService.js';

function today() {
  return todayStr();
}

function normalizePayments(body, total) {
  let payments = Array.isArray(body.payments) ? body.payments : [];
  let creditAmount = Number(body.creditAmount);
  if (Number.isNaN(creditAmount)) creditAmount = 0;

  if (!payments.length) {
    const method = body.payment || 'Cash';
    if (method === 'Credit') {
      payments = [];
      creditAmount = total;
    } else {
      payments = [{ method, amount: total, bankAccount: body.bankAccount || null }];
      creditAmount = 0;
    }
  }

  payments = payments
    .map((p) => ({
      method: p.method || 'Cash',
      amount: Number(p.amount) || 0,
      bankAccount: p.bankAccount || null,
    }))
    .filter((p) => p.amount > 0 && p.method !== 'Credit');

  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const creditFromBody = Number(body.creditAmount);
  if (!Number.isNaN(creditFromBody) && creditFromBody >= 0 && Array.isArray(body.payments)) {
    creditAmount = creditFromBody;
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

export async function listSales(req, res, next) {
  try {
    const shopId = getShopId(req);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const filter = { shop: shopId };
    const [sales, total] = await Promise.all([
      Sale.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Sale.countDocuments(filter),
    ]);
    res.json({ sales, total, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function createSale(req, res, next) {
  const shopId = getShopId(req);
  const decremented = [];
  try {
    const items = req.body.items || [];
    if (!items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    if (!planHasPos(shop.package)) {
      return res.status(403).json({
        message: 'POS is not included in your package. Upgrade to Premium to enable billing.',
        code: 'POS_NOT_ALLOWED',
      });
    }

    await ensureShopAccountsDefaults(shopId);

    let subtotal = 0;
    const lineItems = [];

    for (const item of items) {
      const qty = Number(item.qty) || 0;
      if (qty <= 0) {
        return res.status(400).json({ message: 'Invalid quantity in cart' });
      }

      if (item.manual || !item.productId) {
        const name = item.name || 'Custom item';
        const price = Number(item.price) || 0;
        if (!name || price <= 0) {
          for (const row of decremented) {
            await Product.updateOne({ _id: row.id, shop: shopId }, { $inc: { qty: row.qty } });
          }
          return res.status(400).json({ message: 'Invalid manual item: name and price required' });
        }
        subtotal += price * qty;
        lineItems.push({
          product: null,
          name,
          qty,
          price,
          buyPrice: 0,
        });
        continue;
      }

      const product = await Product.findOneAndUpdate(
        { _id: item.productId, shop: shopId, qty: { $gte: qty } },
        { $inc: { qty: -qty } },
        { new: true }
      );
      if (!product) {
        for (const row of decremented) {
          await Product.updateOne({ _id: row.id, shop: shopId }, { $inc: { qty: row.qty } });
        }
        return res.status(400).json({
          message: 'Insufficient stock or product missing',
          code: 'INSUFFICIENT_STOCK',
        });
      }
      decremented.push({ id: product._id, qty });
      const price = Number(item.price) > 0 ? Number(item.price) : product.sellPrice;
      const buyPrice = product.buyPrice || 0;
      if (price < buyPrice * 0.5) {
        for (const row of decremented) {
          await Product.updateOne({ _id: row.id, shop: shopId }, { $inc: { qty: row.qty } });
        }
        return res.status(400).json({
          message: `Price ${price} for "${product.name}" is unreasonably low`,
          code: 'PRICE_TOO_LOW',
        });
      }
      subtotal += price * qty;
      lineItems.push({
        product: product._id,
        name: product.name,
        qty,
        price,
        buyPrice: buyPrice > 0 ? buyPrice : price,
      });
    }

    const discountPct = Number(req.body.discountPct) || 0;
    const taxPct = Number(req.body.taxPct) || 0;
    const afterDisc = subtotal - subtotal * (discountPct / 100);
    const total = afterDisc + afterDisc * (taxPct / 100);

    let payments;
    let creditAmount;
    let primary;
    try {
      ({ payments, creditAmount, primary } = normalizePayments(req.body, total));
    } catch (e) {
      for (const row of decremented) {
        await Product.updateOne({ _id: row.id, shop: shopId }, { $inc: { qty: row.qty } });
      }
      return res.status(e.status || 400).json({ message: e.message });
    }

    for (const p of payments) {
      if (isBankLikeMethod(p.method)) {
        if (!p.bankAccount) {
          const fallback = await BankAccount.findOne({ shop: shopId, isActive: true });
          if (!fallback) {
            for (const row of decremented) {
              await Product.updateOne({ _id: row.id, shop: shopId }, { $inc: { qty: row.qty } });
            }
            return res.status(400).json({ message: 'Bank account required for bank payment' });
          }
          p.bankAccount = fallback._id;
        } else {
          const bank = await BankAccount.findOne({
            _id: p.bankAccount,
            shop: shopId,
            isActive: true,
          });
          if (!bank) {
            for (const row of decremented) {
              await Product.updateOne({ _id: row.id, shop: shopId }, { $inc: { qty: row.qty } });
            }
            return res.status(400).json({ message: 'Invalid bank account' });
          }
        }
      }
    }

    let customerId = req.body.customerId || null;
    let customerName = req.body.customerName || 'Walk-in';
    let customerPhone = req.body.customerPhone || '';
    const source = req.body.source || 'Walk-in';

    if (customerId) {
      const existing = await Customer.findOne({ _id: customerId, shop: shopId });
      if (!existing) {
        for (const row of decremented) {
          await Product.updateOne({ _id: row.id, shop: shopId }, { $inc: { qty: row.qty } });
        }
        return res.status(400).json({ message: 'Customer not found' });
      }
      customerName = existing.name;
      customerPhone = existing.phone || customerPhone;
    } else if (creditAmount > 0 || (customerPhone && customerName !== 'Walk-in')) {
      let customer = null;
      if (customerPhone) {
        customer = await Customer.findOne({ shop: shopId, phone: customerPhone });
      }
      if (!customer && customerName && customerName !== 'Walk-in') {
        customer = await Customer.findOne({ shop: shopId, name: customerName });
      }
      if (!customer) {
        customer = await Customer.create({
          shop: shopId,
          name: customerName || 'Customer',
          phone: customerPhone,
          whatsapp: req.body.customerWhatsapp || customerPhone,
          email: req.body.customerEmail || '',
          source,
          orders: 0,
          spent: 0,
          balance: 0,
        });
      }
      customerId = customer._id;
      customerName = customer.name;
      customerPhone = customer.phone || customerPhone;
    }

    if (creditAmount > 0 && !customerId) {
      for (const row of decremented) {
        await Product.updateOne({ _id: row.id, shop: shopId }, { $inc: { qty: row.qty } });
      }
      return res.status(400).json({ message: 'Customer required for credit / udhaar sale' });
    }

    if (creditAmount > 0 && customerId) {
      const cust = await Customer.findOne({ _id: customerId, shop: shopId });
      if (cust && (cust.creditLimit || 0) > 0) {
        const nextDue = Number(cust.balance || 0) + creditAmount;
        if (nextDue > cust.creditLimit + 0.001) {
          for (const row of decremented) {
            await Product.updateOne({ _id: row.id, shop: shopId }, { $inc: { qty: row.qty } });
          }
          return res.status(400).json({
            message: `Credit limit exceeded (limit ${cust.creditLimit}, due would be ${nextDue.toFixed(2)})`,
            code: 'CREDIT_LIMIT',
          });
        }
      }
    }

    shop.invoiceSeq += 1;
    await shop.save();
    const invoice = `INV-${shop.invoiceSeq}`;

    const sale = await Sale.create({
      shop: shopId,
      invoice,
      customer: customerId,
      customerName,
      customerPhone,
      items: lineItems,
      subtotal,
      discountPct,
      taxPct,
      total,
      payment: primary,
      payments,
      creditAmount,
      source,
      date: today(),
    });

    await postSaleEntries({ shopId, sale, payments, creditAmount });

    if (customerId) {
      await Customer.findOneAndUpdate(
        { _id: customerId, shop: shopId },
        {
          $inc: { orders: 1, spent: total },
          $set: { source },
        }
      );
    } else if (customerName && customerName !== 'Walk-in') {
      let customer = await Customer.findOne({ shop: shopId, name: customerName });
      if (!customer) {
        customer = await Customer.create({
          shop: shopId,
          name: customerName,
          phone: customerPhone,
          email: req.body.customerEmail || '',
          source,
          orders: 0,
          spent: 0,
        });
      }
      customer.orders += 1;
      customer.spent += total;
      customer.source = source;
      await customer.save();
    }

    res.status(201).json({ sale, invoice, total, shopName: shop.name });
  } catch (err) {
    for (const row of decremented) {
      try {
        await Product.updateOne({ _id: row.id, shop: shopId }, { $inc: { qty: row.qty } });
      } catch {
        /* ignore rollback errors */
      }
    }
    next(err);
  }
}

export async function getSale(req, res, next) {
  try {
    const shopId = getShopId(req);
    const sale = await Sale.findOne({ _id: req.params.id, shop: shopId });
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json({ sale });
  } catch (err) {
    next(err);
  }
}

export async function dashboardStats(req, res, next) {
  try {
    const shopId = getShopId(req);
    await ensureShopAccountsDefaults(shopId);

    const [products, sales, expenses, shop, purchases] = await Promise.all([
      Product.find({ shop: shopId }),
      Sale.find({ shop: shopId }).sort({ createdAt: -1 }),
      Expense.find({ shop: shopId }),
      Shop.findById(shopId),
      Purchase.find({ shop: shopId, status: { $ne: 'cancelled' } }),
    ]);

    const stockQty = products.reduce((s, p) => s + p.qty, 0);
    const low = products.filter((p) => p.qty > 0 && p.qty <= (p.reorderLevel ?? 5)).length;
    const out = products.filter((p) => p.qty === 0).length;
    const t = today();
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    const soonStr = soon.toISOString().split('T')[0];
    const expiring = products.filter(
      (p) => p.expiryDate && p.expiryDate >= t && p.expiryDate <= soonStr
    ).length;
    const todaySales = sales.filter((s) => s.date === t);
    const monthKey = t.slice(0, 7);
    const yearKey = t.slice(0, 4);
    const monthSales = sales.filter((s) => s.date?.startsWith(monthKey));
    const yearSales = sales.filter((s) => s.date?.startsWith(yearKey));
    const expensesToday = expenses.filter((e) => e.date === t);
    const todayPurchases = purchases.filter((p) => p.date === t);
    const monthPurchases = purchases.filter((p) => p.date?.startsWith(monthKey));
    const totalPurchase = purchases.reduce((s, p) => s + (p.total || 0), 0);
    const revenue = sales.reduce((s, x) => s + x.total, 0);

    const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));
    let profit = 0;
    let todayProfit = 0;
    let customersCount = 0;
    try {
      customersCount = await Customer.countDocuments({ shop: shopId });
    } catch {
      customersCount = 0;
    }
    for (const sale of sales) {
      for (const item of sale.items) {
        const p = productMap[item.product?.toString()];
        const buy =
          item.buyPrice != null ? item.buyPrice : p ? p.buyPrice : item.price * 0.5;
        const line = (item.price - buy) * item.qty;
        profit += line;
        if (sale.date === t) todayProfit += line;
      }
    }
    const todayExpenseAmt = expensesToday.reduce((s, x) => s + x.amount, 0);
    const todayNetProfit = todayProfit - todayExpenseAmt;
    const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);

    const soldByProduct = {};
    for (const sale of sales) {
      for (const item of sale.items) {
        const key = item.product?.toString() || item.name;
        soldByProduct[key] = (soldByProduct[key] || 0) + item.qty;
      }
    }
    const topSelling = Object.entries(soldByProduct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, qty]) => {
        const p = productMap[id];
        return { productId: id, name: p?.name || 'Unknown', qty };
      });

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key,
        label: d.toLocaleString('en', { month: 'short' }),
        sales: 0,
        profit: 0,
      });
    }
    for (const sale of sales) {
      const key = sale.date.slice(0, 7);
      const bucket = months.find((m) => m.key === key);
      if (bucket) {
        bucket.sales += sale.total;
        for (const item of sale.items) {
          const p = productMap[item.product?.toString()];
          const buy =
            item.buyPrice != null ? item.buyPrice : p ? p.buyPrice : item.price * 0.5;
          bucket.profit += (item.price - buy) * item.qty;
        }
      }
    }

    const [cashBalance, bankBalance, dues, pendingOrders] = await Promise.all([
      getCashBalance(shopId),
      getTotalBankBalance(shopId),
      getPartyDues(shopId),
      HeldSale.countDocuments({ shop: shopId }),
    ]);

    const limits = shop?.getPlanLimits?.() || null;
    res.json({
      shop,
      plan: limits,
      stats: {
        products: products.length,
        stockQty,
        low,
        out,
        expiring,
        salesCount: sales.length,
        revenue: Number(revenue.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        expenses: Number(expenseTotal.toFixed(2)),
        net: Number((profit - expenseTotal).toFixed(2)),
        customers: customersCount,
        todaySalesCount: todaySales.length,
        todayRevenue: Number(todaySales.reduce((s, x) => s + x.total, 0).toFixed(2)),
        todaySales: Number(todaySales.reduce((s, x) => s + x.total, 0).toFixed(2)),
        todayProfit: Number(todayProfit.toFixed(2)),
        todayNetProfit: Number(todayNetProfit.toFixed(2)),
        monthSales: Number(monthSales.reduce((s, x) => s + x.total, 0).toFixed(2)),
        yearSales: Number(yearSales.reduce((s, x) => s + x.total, 0).toFixed(2)),
        expensesToday: Number(todayExpenseAmt.toFixed(2)),
        totalPurchase: Number(totalPurchase.toFixed(2)),
        todayPurchase: Number(todayPurchases.reduce((s, p) => s + (p.total || 0), 0).toFixed(2)),
        monthPurchase: Number(monthPurchases.reduce((s, p) => s + (p.total || 0), 0).toFixed(2)),
        cashBalance,
        bankBalance,
        customerDue: dues.customerDue,
        supplierDue: dues.supplierDue,
        pendingOrders,
      },
      recentOrders: sales.slice(0, 8),
      recentPurchases: purchases
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
      topSelling,
      charts: {
        labels: months.map((m) => m.label),
        sales: months.map((m) => Number(m.sales.toFixed(2))),
        profit: months.map((m) => Number(m.profit.toFixed(2))),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function report(req, res, next) {
  try {
    const shopId = getShopId(req);
    const type = req.query.type || 'daily';
    const sales = await Sale.find({ shop: shopId }).sort({ createdAt: -1 });
    const t = today();
    let data = sales;
    let title = 'Yearly Report';

    if (type === 'daily') {
      data = sales.filter((s) => s.date === t);
      title = 'Daily Report';
    } else if (type === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      data = sales.filter((s) => new Date(s.date) >= weekAgo);
      title = 'Weekly Report';
    } else if (type === 'monthly') {
      data = sales.filter((s) => s.date.startsWith(t.slice(0, 7)));
      title = 'Monthly Report';
    }

    const products = await Product.find({ shop: shopId }).lean();
    const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));
    let profit = 0;
    for (const sale of data) {
      for (const item of sale.items || []) {
        const p = productMap[item.product?.toString()];
        const buy =
          item.buyPrice != null ? item.buyPrice : p ? p.buyPrice : item.price * 0.5;
        profit += (item.price - buy) * item.qty;
      }
    }
    const total = data.reduce((s, x) => s + x.total, 0);
    res.json({
      title,
      count: data.length,
      total: Number(total.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      sales: data,
    });
  } catch (err) {
    next(err);
  }
}
