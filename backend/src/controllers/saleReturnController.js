import { Sale } from '../models/Sale.js';
import { SaleReturn } from '../models/SaleReturn.js';
import { Product } from '../models/Product.js';
import { Shop } from '../models/Shop.js';
import { getShopId } from '../middleware/auth.js';
import { planHasPos } from '../config/plans.js';
import {
  ensureShopAccountsDefaults,
  postSaleReturnEntries,
  todayStr,
  isBankLikeMethod,
} from '../services/accountService.js';

function lineGross(item) {
  return (Number(item.price) || 0) * (Number(item.qty) || 0);
}

/** Prorate refund using invoice total vs item gross (respects discount/tax). */
function prorateRefund(sale, returnLines) {
  const grossAll = (sale.items || []).reduce((s, it) => s + lineGross(it), 0);
  if (grossAll <= 0) return 0;
  const returnGross = returnLines.reduce((s, it) => s + it.qty * it.price, 0);
  return Number(((returnGross / grossAll) * (Number(sale.total) || 0)).toFixed(2));
}

export async function createSaleReturn(req, res, next) {
  try {
    const shopId = getShopId(req);
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    if (!planHasPos(shop.package)) {
      return res.status(403).json({ message: 'POS not available on this plan', code: 'POS_NOT_ALLOWED' });
    }

    await ensureShopAccountsDefaults(shopId);

    const sale = await Sale.findOne({ _id: req.params.id, shop: shopId });
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    if (sale.status === 'returned') {
      return res.status(400).json({ message: 'Sale already fully returned' });
    }

    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
    if (!rawItems.length) {
      return res.status(400).json({ message: 'Return items required' });
    }

    const refundMethod = req.body.refundMethod || 'Cash';
    const bankAccount = req.body.bankAccount || null;
    const note = req.body.note || '';

    const returnLines = [];
    for (const row of rawItems) {
      const qty = Number(row.qty) || 0;
      if (qty <= 0) continue;

      const match = (sale.items || []).find((it) => {
        if (row.productId) {
          return String(it.product) === String(row.productId);
        }
        return it.name === row.name;
      });
      if (!match) {
        return res.status(400).json({ message: `Item not on invoice: ${row.name || row.productId}` });
      }

      const already = Number(match.returnedQty) || 0;
      const remaining = (Number(match.qty) || 0) - already;
      if (qty > remaining) {
        return res.status(400).json({
          message: `Cannot return ${qty} of ${match.name}; only ${remaining} left`,
        });
      }

      returnLines.push({
        product: match.product,
        name: match.name,
        qty,
        price: match.price,
        lineRefund: 0,
      });
      match.returnedQty = already + qty;
    }

    if (!returnLines.length) {
      return res.status(400).json({ message: 'No valid return quantities' });
    }

    const refundAmount = prorateRefund(sale, returnLines);
    if (refundAmount <= 0) {
      return res.status(400).json({ message: 'Refund amount is zero' });
    }

    // Fill lineRefund proportionally for audit
    const returnGross = returnLines.reduce((s, it) => s + it.qty * it.price, 0);
    for (const line of returnLines) {
      const g = line.qty * line.price;
      line.lineRefund =
        returnGross > 0
          ? Number(((g / returnGross) * refundAmount).toFixed(2))
          : 0;
    }

    if (isBankLikeMethod(refundMethod) && !bankAccount) {
      return res.status(400).json({ message: 'Bank account required for bank refund' });
    }
    if (refundMethod === 'Credit' && !sale.customer) {
      return res.status(400).json({ message: 'Credit refund only for customer sales' });
    }

    shop.invoiceSeq += 1;
    await shop.save();
    const returnNo = `RET-${shop.invoiceSeq}`;

    const saleReturn = await SaleReturn.create({
      shop: shopId,
      sale: sale._id,
      invoice: sale.invoice,
      returnNo,
      items: returnLines,
      refundAmount,
      refundMethod,
      bankAccount: isBankLikeMethod(refundMethod) ? bankAccount : null,
      customer: sale.customer || null,
      note,
      date: todayStr(),
    });

    // Restore stock
    for (const line of returnLines) {
      if (!line.product) continue;
      await Product.updateOne(
        { _id: line.product, shop: shopId },
        { $inc: { qty: line.qty } }
      );
    }

    try {
      await postSaleReturnEntries({
        shopId,
        sale,
        saleReturn,
        refundAmount,
        refundMethod,
        bankAccount,
      });
    } catch (err) {
      // Roll back stock + return doc if ledger fails
      for (const line of returnLines) {
        if (!line.product) continue;
        await Product.updateOne(
          { _id: line.product, shop: shopId },
          { $inc: { qty: -line.qty } }
        );
      }
      await SaleReturn.deleteOne({ _id: saleReturn._id });
      // revert returnedQty on sale items in memory — reload and don't save
      throw err;
    }

    sale.returnedAmount = Number(
      ((Number(sale.returnedAmount) || 0) + refundAmount).toFixed(2)
    );
    const allReturned = (sale.items || []).every(
      (it) => (Number(it.returnedQty) || 0) >= (Number(it.qty) || 0)
    );
    sale.status = allReturned ? 'returned' : 'partial_return';
    sale.markModified('items');
    await sale.save();

    res.status(201).json({ saleReturn, sale });
  } catch (err) {
    next(err);
  }
}

export async function listSaleReturns(req, res, next) {
  try {
    const shopId = getShopId(req);
    const returns = await SaleReturn.find({ shop: shopId }).sort({ createdAt: -1 }).limit(100);
    res.json({ returns });
  } catch (err) {
    next(err);
  }
}
