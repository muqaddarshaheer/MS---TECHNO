import { Product } from '../models/Product.js';
import { Sale } from '../models/Sale.js';
import { Customer } from '../models/Customer.js';
import { Shop } from '../models/Shop.js';
import { Expense } from '../models/Expense.js';
import { getShopId } from '../middleware/auth.js';

function today() {
  return new Date().toISOString().split('T')[0];
}

export async function listSales(req, res, next) {
  try {
    const shopId = getShopId(req);
    const sales = await Sale.find({ shop: shopId }).sort({ createdAt: -1 });
    res.json({ sales });
  } catch (err) {
    next(err);
  }
}

export async function createSale(req, res, next) {
  try {
    const shopId = getShopId(req);
    const items = req.body.items || [];
    if (!items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    let subtotal = 0;
    const lineItems = [];
    const productsToUpdate = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, shop: shopId });
      if (!product) {
        return res.status(400).json({ message: 'Product not found in cart' });
      }
      const qty = Number(item.qty) || 0;
      if (qty <= 0 || product.qty < qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      productsToUpdate.push({ product, qty });
      subtotal += product.sellPrice * qty;
      lineItems.push({
        product: product._id,
        name: product.name,
        qty,
        price: product.sellPrice,
      });
    }

    for (const row of productsToUpdate) {
      row.product.qty -= row.qty;
      await row.product.save();
    }

    const discountPct = Number(req.body.discountPct) || 0;
    const taxPct = Number(req.body.taxPct) || 0;
    const afterDisc = subtotal - subtotal * (discountPct / 100);
    const total = afterDisc + afterDisc * (taxPct / 100);

    shop.invoiceSeq += 1;
    await shop.save();
    const invoice = `INV-${shop.invoiceSeq}`;

    const customerName = req.body.customerName || 'Walk-in';
    const source = req.body.source || 'Walk-in';
    const payment = req.body.payment || 'Cash';

    const sale = await Sale.create({
      shop: shopId,
      invoice,
      customerName,
      customerPhone: req.body.customerPhone || '',
      items: lineItems,
      subtotal,
      discountPct,
      taxPct,
      total,
      payment,
      source,
      date: today(),
    });

    let customer = await Customer.findOne({ shop: shopId, name: customerName });
    if (!customer) {
      customer = await Customer.create({
        shop: shopId,
        name: customerName,
        phone: req.body.customerPhone || '',
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

    res.status(201).json({ sale, invoice, total });
  } catch (err) {
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
    const [products, sales, expenses, shop] = await Promise.all([
      Product.find({ shop: shopId }),
      Sale.find({ shop: shopId }).sort({ createdAt: -1 }),
      Expense.find({ shop: shopId }),
      Shop.findById(shopId),
    ]);

    const stockQty = products.reduce((s, p) => s + p.qty, 0);
    const low = products.filter((p) => p.qty > 0 && p.qty <= 5).length;
    const out = products.filter((p) => p.qty === 0).length;
    const todaySales = sales.filter((s) => s.date === today());
    const revenue = sales.reduce((s, x) => s + x.total, 0);

    const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));
    let profit = 0;
    for (const sale of sales) {
      for (const item of sale.items) {
        const p = productMap[item.product?.toString()];
        const buy = p ? p.buyPrice : item.price * 0.5;
        profit += (item.price - buy) * item.qty;
      }
    }

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
          const buy = p ? p.buyPrice : item.price * 0.5;
          bucket.profit += (item.price - buy) * item.qty;
        }
      }
    }

    res.json({
      shop,
      stats: {
        products: products.length,
        stockQty,
        low,
        out,
        salesCount: sales.length,
        revenue,
        profit,
        expenses: expenseTotal,
        net: profit - expenseTotal,
        todaySalesCount: todaySales.length,
        todayRevenue: todaySales.reduce((s, x) => s + x.total, 0),
      },
      recentOrders: sales.slice(0, 8),
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

    const total = data.reduce((s, x) => s + x.total, 0);
    res.json({ title, count: data.length, total, sales: data });
  } catch (err) {
    next(err);
  }
}
