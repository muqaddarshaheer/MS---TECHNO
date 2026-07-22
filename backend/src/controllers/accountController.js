import { AccountEntry } from '../models/AccountEntry.js';
import { BankAccount } from '../models/BankAccount.js';
import { ShopAccounts } from '../models/ShopAccounts.js';
import { Sale } from '../models/Sale.js';
import { Expense } from '../models/Expense.js';
import { getShopId } from '../middleware/auth.js';
import {
  ensureShopAccountsDefaults,
  getCashBalance,
  getBankBalance,
  getPartyDues,
  todayStr,
  isCashMethod,
} from '../services/accountService.js';
import { writeAudit } from '../services/auditService.js';

export async function accountsSummary(req, res, next) {
  try {
    const shopId = getShopId(req);
    await ensureShopAccountsDefaults(shopId);
    const date = req.query.date || todayStr();

    const [sales, expenses, entries, cashBalance, banks, dues, settings] = await Promise.all([
      Sale.find({ shop: shopId, date }),
      Expense.find({ shop: shopId, date }),
      AccountEntry.find({ shop: shopId, date }),
      getCashBalance(shopId),
      getBankBalance(shopId),
      getPartyDues(shopId),
      ShopAccounts.findOne({ shop: shopId }),
    ]);

    const salesTotal = sales.reduce((s, x) => s + (x.total || 0), 0);
    const expensesTotal = expenses.reduce((s, x) => s + (x.amount || 0), 0);

    let cashIn = 0;
    let cashOut = 0;
    for (const e of entries) {
      const amt = Number(e.amount) || 0;
      if (['sale_cash', 'cash_in', 'bank_withdraw'].includes(e.type)) cashIn += amt;
      if (e.type === 'customer_payment' && isCashMethod(e.method)) cashIn += amt;
      if (['cash_out', 'bank_deposit'].includes(e.type)) cashOut += amt;
      if (e.type === 'expense' && e.method === 'cash') cashOut += amt;
      if (e.type === 'supplier_payment' && isCashMethod(e.method)) cashOut += amt;
    }

    res.json({
      date,
      salesTotal: Number(salesTotal.toFixed(2)),
      salesCount: sales.length,
      expensesTotal: Number(expensesTotal.toFixed(2)),
      cashIn: Number(cashIn.toFixed(2)),
      cashOut: Number(cashOut.toFixed(2)),
      net: Number((salesTotal - expensesTotal).toFixed(2)),
      cashBalance,
      bankBalance: banks.reduce((s, b) => s + b.balance, 0),
      banks: banks.map((b) => ({
        id: b.bank._id,
        name: b.bank.name,
        type: b.bank.type,
        balance: b.balance,
      })),
      customerDue: dues.customerDue,
      supplierDue: dues.supplierDue,
      openingCash: settings?.openingCash || 0,
      openingCashSet: Boolean(settings?.openingCashSet),
      note: 'Balances from Phase A go-live; historical sales are not rewritten.',
    });
  } catch (err) {
    next(err);
  }
}

export async function dailyClosing(req, res, next) {
  try {
    const shopId = getShopId(req);
    await ensureShopAccountsDefaults(shopId);
    const date = req.query.date || todayStr();

    const [sales, expenses, entries] = await Promise.all([
      Sale.find({ shop: shopId, date }).sort({ createdAt: 1 }),
      Expense.find({ shop: shopId, date }).sort({ createdAt: 1 }),
      AccountEntry.find({ shop: shopId, date }).sort({ createdAt: 1 }),
    ]);

    const salesTotal = sales.reduce((s, x) => s + (x.total || 0), 0);
    const creditTotal = sales.reduce((s, x) => s + (x.creditAmount || 0), 0);
    const expensesTotal = expenses.reduce((s, x) => s + (x.amount || 0), 0);

    let cashSales = 0;
    let bankSales = 0;
    let cashIn = 0;
    let cashOut = 0;
    for (const e of entries) {
      const amt = Number(e.amount) || 0;
      if (e.type === 'sale_cash') cashSales += amt;
      if (e.type === 'sale_bank') bankSales += amt;
      if (e.type === 'cash_in') cashIn += amt;
      if (e.type === 'cash_out') cashOut += amt;
      if (e.type === 'customer_payment' && isCashMethod(e.method)) cashIn += amt;
      if (e.type === 'supplier_payment' && isCashMethod(e.method)) cashOut += amt;
    }

    res.json({
      date,
      salesCount: sales.length,
      salesTotal: Number(salesTotal.toFixed(2)),
      cashSales: Number(cashSales.toFixed(2)),
      bankSales: Number(bankSales.toFixed(2)),
      creditTotal: Number(creditTotal.toFixed(2)),
      expensesTotal: Number(expensesTotal.toFixed(2)),
      cashIn: Number(cashIn.toFixed(2)),
      cashOut: Number(cashOut.toFixed(2)),
      net: Number((salesTotal - expensesTotal).toFixed(2)),
      sales,
      expenses,
      entries,
    });
  } catch (err) {
    next(err);
  }
}

export async function listCashEntries(req, res, next) {
  try {
    const shopId = getShopId(req);
    await ensureShopAccountsDefaults(shopId);
    const limit = Math.min(200, Number(req.query.limit) || 100);
    const types = [
      'opening_cash',
      'sale_cash',
      'cash_in',
      'cash_out',
      'bank_deposit',
      'bank_withdraw',
      'expense',
      'customer_payment',
      'supplier_payment',
    ];
    const entries = await AccountEntry.find({
      shop: shopId,
      type: { $in: types },
      $or: [
        { type: { $in: ['sale_cash', 'cash_in', 'cash_out', 'bank_deposit', 'bank_withdraw', 'opening_cash'] } },
        { type: 'expense', method: 'cash' },
        { type: 'customer_payment', method: 'Cash' },
        { type: 'supplier_payment', method: 'Cash' },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    const [cashBalance, settings] = await Promise.all([
      getCashBalance(shopId),
      ShopAccounts.findOne({ shop: shopId }),
    ]);

    res.json({
      entries,
      cashBalance,
      openingCash: settings?.openingCash || 0,
      openingCashSet: Boolean(settings?.openingCashSet),
    });
  } catch (err) {
    next(err);
  }
}

export async function createCashMovement(req, res, next) {
  try {
    const shopId = getShopId(req);
    await ensureShopAccountsDefaults(shopId);
    const action = String(req.body.action || '').toLowerCase();
    const amount = Number(req.body.amount) || 0;
    const date = req.body.date || todayStr();
    const note = req.body.note || '';

    if (action === 'set_opening') {
      const settings = await ShopAccounts.findOne({ shop: shopId });
      if (settings?.openingCashSet) {
        return res.status(400).json({ message: 'Opening cash already set' });
      }
      settings.openingCash = amount;
      settings.openingCashSet = true;
      await settings.save();
      if (!String(note || '').trim()) {
        return res.status(400).json({ message: 'Reason / note is required' });
      }
      await AccountEntry.create({
        shop: shopId,
        type: 'opening_cash',
        amount,
        date,
        method: 'Cash',
        note: note || 'Opening cash',
      });
      await writeAudit({
        shopId,
        user: req.user,
        action: 'cash_opening',
        entity: 'Cash',
        reason: note || 'Opening cash',
        after: { amount },
      });
      const cashBalance = await getCashBalance(shopId);
      return res.status(201).json({ message: 'Opening cash set', cashBalance, openingCash: amount });
    }

    if (!['in', 'out'].includes(action) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid cash movement' });
    }
    if (!String(note || '').trim()) {
      return res.status(400).json({ message: 'Reason / note is required for cash entries' });
    }

    if (action === 'out') {
      const bal = await getCashBalance(shopId);
      if (amount > bal + 0.001) {
        return res.status(400).json({ message: 'Insufficient cash balance' });
      }
    }

    const entry = await AccountEntry.create({
      shop: shopId,
      type: action === 'in' ? 'cash_in' : 'cash_out',
      amount,
      date,
      method: 'Cash',
      note: note || (action === 'in' ? 'Cash in' : 'Cash out'),
    });

    await writeAudit({
      shopId,
      user: req.user,
      action: action === 'in' ? 'cash_in' : 'cash_out',
      entity: 'Cash',
      entityId: entry._id,
      reason: note,
      after: { amount, action },
    });

    const cashBalance = await getCashBalance(shopId);
    res.status(201).json({ entry, cashBalance });
  } catch (err) {
    next(err);
  }
}

export async function listBanks(req, res, next) {
  try {
    const shopId = getShopId(req);
    await ensureShopAccountsDefaults(shopId);
    const banks = await getBankBalance(shopId);
    res.json({
      banks: banks.map((b) => ({
        ...b.bank.toObject(),
        balance: b.balance,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createBank(req, res, next) {
  try {
    const shopId = getShopId(req);
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Bank name required' });
    const bank = await BankAccount.create({
      shop: shopId,
      name,
      type: req.body.type || 'bank',
      openingBalance: Number(req.body.openingBalance) || 0,
      isActive: true,
    });
    res.status(201).json({ bank: { ...bank.toObject(), balance: bank.openingBalance } });
  } catch (err) {
    next(err);
  }
}

export async function updateBank(req, res, next) {
  try {
    const shopId = getShopId(req);
    const bank = await BankAccount.findOne({ _id: req.params.id, shop: shopId });
    if (!bank) return res.status(404).json({ message: 'Bank account not found' });
    if (req.body.name != null) bank.name = String(req.body.name).trim();
    if (req.body.type != null) bank.type = req.body.type;
    if (req.body.isActive != null) bank.isActive = Boolean(req.body.isActive);
    await bank.save();
    const row = await getBankBalance(shopId, bank._id);
    res.json({ bank: { ...bank.toObject(), balance: row?.balance || 0 } });
  } catch (err) {
    next(err);
  }
}

export async function bankTransfer(req, res, next) {
  try {
    const shopId = getShopId(req);
    await ensureShopAccountsDefaults(shopId);
    const action = String(req.body.action || '').toLowerCase();
    const amount = Number(req.body.amount) || 0;
    const date = req.body.date || todayStr();
    const note = req.body.note || '';
    const bankId = req.params.id;

    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const bank = await BankAccount.findOne({ _id: bankId, shop: shopId, isActive: true });
    if (!bank) return res.status(404).json({ message: 'Bank account not found' });

    if (action === 'deposit') {
      const cash = await getCashBalance(shopId);
      if (amount > cash + 0.001) {
        return res.status(400).json({ message: 'Insufficient cash for deposit' });
      }
      await AccountEntry.create({
        shop: shopId,
        type: 'bank_deposit',
        amount,
        date,
        method: 'Cash',
        bankAccount: bank._id,
        note: note || `Deposit to ${bank.name}`,
      });
    } else if (action === 'withdraw') {
      const row = await getBankBalance(shopId, bank._id);
      if (!row || amount > row.balance + 0.001) {
        return res.status(400).json({ message: 'Insufficient bank balance' });
      }
      await AccountEntry.create({
        shop: shopId,
        type: 'bank_withdraw',
        amount,
        date,
        method: 'Bank Transfer',
        bankAccount: bank._id,
        note: note || `Withdraw from ${bank.name}`,
      });
    } else {
      return res.status(400).json({ message: 'action must be deposit or withdraw' });
    }

    const [cashBalance, banks] = await Promise.all([getCashBalance(shopId), getBankBalance(shopId)]);
    res.status(201).json({
      cashBalance,
      banks: banks.map((b) => ({ id: b.bank._id, name: b.bank.name, balance: b.balance })),
    });
  } catch (err) {
    next(err);
  }
}

export { getCashBalance, getPartyDues, ensureShopAccountsDefaults };
