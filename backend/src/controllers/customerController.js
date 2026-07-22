import { Customer } from '../models/Customer.js';
import { AccountEntry } from '../models/AccountEntry.js';
import { getShopId } from '../middleware/auth.js';
import { writeAudit } from '../services/auditService.js';
import {
  ensureShopAccountsDefaults,
  todayStr,
  isCashMethod,
  isBankLikeMethod,
} from '../services/accountService.js';

export async function listCustomers(req, res, next) {
  try {
    const shopId = getShopId(req);
    const customers = await Customer.find({ shop: shopId }).sort({ balance: -1, spent: -1 });
    res.json({ customers });
  } catch (err) {
    next(err);
  }
}

export async function createCustomer(req, res, next) {
  try {
    const shopId = getShopId(req);
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Customer name required' });
    const phone = String(req.body.phone || '').trim();
    if (phone) {
      const existing = await Customer.findOne({ shop: shopId, phone });
      if (existing) {
        return res.status(200).json({ customer: existing, existing: true });
      }
    }
    const customer = await Customer.create({
      shop: shopId,
      name,
      phone,
      whatsapp: req.body.whatsapp || phone,
      email: req.body.email || '',
      address: req.body.address || '',
      source: req.body.source || 'Walk-in',
      group: ['retail', 'wholesale', 'dealer', 'vip'].includes(req.body.group)
        ? req.body.group
        : 'retail',
      creditLimit: Math.max(0, Number(req.body.creditLimit) || 0),
      balance: 0,
    });
    res.status(201).json({ customer });
  } catch (err) {
    next(err);
  }
}

export async function getCustomer(req, res, next) {
  try {
    const shopId = getShopId(req);
    const customer = await Customer.findOne({ _id: req.params.id, shop: shopId });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ customer });
  } catch (err) {
    next(err);
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const shopId = getShopId(req);
    const customer = await Customer.findOne({ _id: req.params.id, shop: shopId });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const before = customer.toObject();
    const fields = ['name', 'phone', 'whatsapp', 'email', 'address', 'source', 'notes'];
    for (const key of fields) {
      if (req.body[key] !== undefined) customer[key] = req.body[key];
    }
    if (req.body.group && ['retail', 'wholesale', 'dealer', 'vip'].includes(req.body.group)) {
      customer.group = req.body.group;
    }
    if (req.body.creditLimit !== undefined) {
      customer.creditLimit = Math.max(0, Number(req.body.creditLimit) || 0);
    }
    await customer.save();
    await writeAudit({
      shopId,
      user: req.user,
      action: 'customer_update',
      entity: 'Customer',
      entityId: customer._id,
      reason: req.body.reason || 'Customer updated',
      before: { name: before.name, phone: before.phone, balance: before.balance },
      after: { name: customer.name, phone: customer.phone, balance: customer.balance },
    });
    res.json({ customer });
  } catch (err) {
    next(err);
  }
}

export async function deleteCustomer(req, res, next) {
  try {
    const shopId = getShopId(req);
    const customer = await Customer.findOne({ _id: req.params.id, shop: shopId });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    if ((customer.balance || 0) > 0) {
      return res.status(400).json({ message: 'Clear customer due before deleting' });
    }
    await writeAudit({
      shopId,
      user: req.user,
      action: 'customer_delete',
      entity: 'Customer',
      entityId: customer._id,
      reason: req.body.reason || 'Customer deleted',
      before: { name: customer.name, phone: customer.phone },
    });
    await customer.deleteOne();
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
}

export async function adjustCustomerBalance(req, res, next) {
  try {
    const shopId = getShopId(req);
    const reason = String(req.body.reason || '').trim();
    if (!reason) return res.status(400).json({ message: 'Reason is required for manual adjustment' });

    const customer = await Customer.findOne({ _id: req.params.id, shop: shopId });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount === 0) {
      return res.status(400).json({ message: 'Amount must be non-zero (+ due / − reduce)' });
    }
    const before = customer.balance;
    const next = Math.max(0, Number((before + amount).toFixed(2)));
    customer.balance = next;
    await customer.save();

    await AccountEntry.create({
      shop: shopId,
      type: amount > 0 ? 'customer_credit' : 'customer_payment',
      amount: Math.abs(amount),
      date: todayStr(),
      method: 'Credit',
      customer: customer._id,
      note: `Manual adjust: ${reason}`,
    });

    await writeAudit({
      shopId,
      user: req.user,
      action: 'customer_balance_adjust',
      entity: 'Customer',
      entityId: customer._id,
      reason,
      before: { balance: before },
      after: { balance: next },
    });

    res.json({ customer });
  } catch (err) {
    next(err);
  }
}

export async function customerPayment(req, res, next) {
  try {
    const shopId = getShopId(req);
    await ensureShopAccountsDefaults(shopId);
    const customer = await Customer.findOne({ _id: req.params.id, shop: shopId });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const amount = Number(req.body.amount) || 0;
    const method = req.body.method || 'Cash';
    const date = req.body.date || todayStr();
    const note = req.body.note || '';
    const bankAccountId = req.body.bankAccount || null;

    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    if (amount > customer.balance + 0.001) {
      return res.status(400).json({ message: 'Payment exceeds customer due' });
    }
    if (isBankLikeMethod(method) && !bankAccountId) {
      return res.status(400).json({ message: 'Bank account required' });
    }
    if (!isCashMethod(method) && !isBankLikeMethod(method)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    customer.balance = Math.max(0, Number((customer.balance - amount).toFixed(2)));
    await customer.save();

    const entry = await AccountEntry.create({
      shop: shopId,
      type: 'customer_payment',
      amount,
      date,
      method,
      bankAccount: isBankLikeMethod(method) ? bankAccountId : null,
      customer: customer._id,
      note: note || `Payment from ${customer.name}`,
    });

    res.status(201).json({ customer, entry });
  } catch (err) {
    next(err);
  }
}

export async function customerLedger(req, res, next) {
  try {
    const shopId = getShopId(req);
    const customer = await Customer.findOne({ _id: req.params.id, shop: shopId });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const entries = await AccountEntry.find({ shop: shopId, customer: customer._id }).sort({
      createdAt: -1,
    });
    res.json({ customer, entries });
  } catch (err) {
    next(err);
  }
}
