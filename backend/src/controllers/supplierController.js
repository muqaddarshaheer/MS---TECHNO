import { Supplier } from '../models/Supplier.js';
import { AccountEntry } from '../models/AccountEntry.js';
import { getShopId } from '../middleware/auth.js';
import {
  ensureShopAccountsDefaults,
  getCashBalance,
  getBankBalance,
  todayStr,
  isCashMethod,
  isBankLikeMethod,
} from '../services/accountService.js';

export async function listSuppliers(req, res, next) {
  try {
    const shopId = getShopId(req);
    const suppliers = await Supplier.find({ shop: shopId }).sort({ balance: -1, name: 1 });
    res.json({ suppliers });
  } catch (err) {
    next(err);
  }
}

export async function createSupplier(req, res, next) {
  try {
    const shopId = getShopId(req);
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Supplier name required' });
    const openingDue = Math.max(0, Number(req.body.openingDue) || 0);
    const supplier = await Supplier.create({
      shop: shopId,
      name,
      phone: req.body.phone || '',
      email: req.body.email || '',
      notes: req.body.notes || '',
      openingDue,
      balance: openingDue,
    });
    if (openingDue > 0) {
      await AccountEntry.create({
        shop: shopId,
        type: 'supplier_opening',
        amount: openingDue,
        date: todayStr(),
        supplier: supplier._id,
        note: 'Opening supplier due',
      });
    }
    res.status(201).json({ supplier });
  } catch (err) {
    next(err);
  }
}

export async function updateSupplier(req, res, next) {
  try {
    const shopId = getShopId(req);
    const supplier = await Supplier.findOne({ _id: req.params.id, shop: shopId });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    if (req.body.name != null) supplier.name = String(req.body.name).trim();
    if (req.body.phone != null) supplier.phone = req.body.phone;
    if (req.body.email != null) supplier.email = req.body.email;
    if (req.body.notes != null) supplier.notes = req.body.notes;
    await supplier.save();
    res.json({ supplier });
  } catch (err) {
    next(err);
  }
}

export async function deleteSupplier(req, res, next) {
  try {
    const shopId = getShopId(req);
    const supplier = await Supplier.findOne({ _id: req.params.id, shop: shopId });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    if (supplier.balance > 0) {
      return res.status(400).json({ message: 'Clear supplier due before deleting' });
    }
    await supplier.deleteOne();
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    next(err);
  }
}

export async function supplierPayment(req, res, next) {
  try {
    const shopId = getShopId(req);
    await ensureShopAccountsDefaults(shopId);
    const supplier = await Supplier.findOne({ _id: req.params.id, shop: shopId });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const amount = Number(req.body.amount) || 0;
    const method = req.body.method || 'Cash';
    const date = req.body.date || todayStr();
    const note = req.body.note || '';
    const bankAccountId = req.body.bankAccount || null;

    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    if (amount > supplier.balance + 0.001) {
      return res.status(400).json({ message: 'Payment exceeds supplier due' });
    }

    if (isCashMethod(method)) {
      const cash = await getCashBalance(shopId);
      if (amount > cash + 0.001) {
        return res.status(400).json({ message: 'Insufficient cash balance' });
      }
    } else if (isBankLikeMethod(method)) {
      if (!bankAccountId) {
        return res.status(400).json({ message: 'Bank account required' });
      }
      const row = await getBankBalance(shopId, bankAccountId);
      if (!row || amount > row.balance + 0.001) {
        return res.status(400).json({ message: 'Insufficient bank balance' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    supplier.balance = Math.max(0, Number((supplier.balance - amount).toFixed(2)));
    await supplier.save();

    const entry = await AccountEntry.create({
      shop: shopId,
      type: 'supplier_payment',
      amount,
      date,
      method,
      bankAccount: isBankLikeMethod(method) ? bankAccountId : null,
      supplier: supplier._id,
      note: note || `Payment to ${supplier.name}`,
    });

    res.status(201).json({ supplier, entry });
  } catch (err) {
    next(err);
  }
}

export async function supplierLedger(req, res, next) {
  try {
    const shopId = getShopId(req);
    const supplier = await Supplier.findOne({ _id: req.params.id, shop: shopId });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    const entries = await AccountEntry.find({ shop: shopId, supplier: supplier._id }).sort({
      createdAt: -1,
    });
    res.json({ supplier, entries });
  } catch (err) {
    next(err);
  }
}
