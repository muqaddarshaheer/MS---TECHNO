import mongoose from 'mongoose';
import { AccountEntry } from '../models/AccountEntry.js';
import { BankAccount } from '../models/BankAccount.js';
import { ShopAccounts } from '../models/ShopAccounts.js';
import { Customer } from '../models/Customer.js';
import { Supplier } from '../models/Supplier.js';

const CASH_IN_TYPES = new Set([
  'opening_cash',
  'sale_cash',
  'cash_in',
  'bank_withdraw',
  'customer_payment',
]);
const CASH_OUT_TYPES = new Set(['cash_out', 'bank_deposit', 'expense', 'supplier_payment']);

const BANK_IN_TYPES = new Set(['sale_bank', 'bank_deposit', 'customer_payment']);
const BANK_OUT_TYPES = new Set(['bank_withdraw', 'expense', 'supplier_payment']);

export function todayStr(d = new Date()) {
  return d.toISOString().split('T')[0];
}

export async function ensureShopAccountsDefaults(shopId) {
  let settings = await ShopAccounts.findOne({ shop: shopId });
  if (!settings) {
    settings = await ShopAccounts.create({
      shop: shopId,
      openingCash: 0,
      openingCashSet: false,
    });
  }

  const bankCount = await BankAccount.countDocuments({ shop: shopId });
  if (bankCount === 0) {
    await BankAccount.create({
      shop: shopId,
      name: 'Main Bank',
      type: 'bank',
      openingBalance: 0,
      isActive: true,
    });
  }

  return settings;
}

function isCashMethod(method) {
  return !method || method === 'Cash';
}

function isBankLikeMethod(method) {
  return ['Bank Transfer', 'Card', 'JazzCash', 'EasyPaisa'].includes(method);
}

export async function getCashBalance(shopId) {
  const settings = await ensureShopAccountsDefaults(shopId);
  const entries = await AccountEntry.find({ shop: shopId }).select('type amount method');
  let bal = Number(settings.openingCash) || 0;

  for (const e of entries) {
    const amt = Number(e.amount) || 0;
    if (e.type === 'opening_cash') continue;

    if (e.type === 'sale_cash') bal += amt;
    else if (e.type === 'cash_in') bal += amt;
    else if (e.type === 'bank_withdraw') bal += amt;
    else if (e.type === 'customer_payment' && isCashMethod(e.method)) bal += amt;
    else if (e.type === 'cash_out') bal -= amt;
    else if (e.type === 'bank_deposit') bal -= amt;
    else if (e.type === 'expense' && e.method === 'cash') bal -= amt;
    else if (e.type === 'supplier_payment' && isCashMethod(e.method)) bal -= amt;
    else if (e.type === 'sale_return_cash') bal -= amt;
    else if (e.type === 'purchase_cash') bal -= amt;
  }

  return Math.round(bal * 100) / 100;
}

export async function getBankBalance(shopId, bankAccountId = null) {
  const filter = { shop: shopId, isActive: true };
  if (bankAccountId) filter._id = bankAccountId;
  const banks = await BankAccount.find(filter);
  const results = [];

  for (const bank of banks) {
    let bal = Number(bank.openingBalance) || 0;
    const entries = await AccountEntry.find({
      shop: shopId,
      bankAccount: bank._id,
    }).select('type amount method');

    for (const e of entries) {
      const amt = Number(e.amount) || 0;
      if (e.type === 'sale_bank') bal += amt;
      else if (e.type === 'bank_deposit') bal += amt;
      else if (e.type === 'customer_payment' && isBankLikeMethod(e.method)) bal += amt;
      else if (e.type === 'bank_withdraw') bal -= amt;
      else if (e.type === 'expense' && e.method === 'bank') bal -= amt;
      else if (e.type === 'supplier_payment' && isBankLikeMethod(e.method)) bal -= amt;
      else if (e.type === 'sale_return_bank') bal -= amt;
      else if (e.type === 'purchase_bank') bal -= amt;
    }

    results.push({
      bank,
      balance: Math.round(bal * 100) / 100,
    });
  }

  if (bankAccountId) return results[0] || null;
  return results;
}

export async function getTotalBankBalance(shopId) {
  const rows = await getBankBalance(shopId);
  return Math.round(rows.reduce((s, r) => s + r.balance, 0) * 100) / 100;
}

export async function getPartyDues(shopId) {
  const oid = mongoose.Types.ObjectId.isValid(shopId)
    ? new mongoose.Types.ObjectId(String(shopId))
    : shopId;
  const [custAgg, suppAgg] = await Promise.all([
    Customer.aggregate([
      { $match: { shop: oid } },
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ]),
    Supplier.aggregate([
      { $match: { shop: oid } },
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ]),
  ]);
  return {
    customerDue: custAgg[0]?.total || 0,
    supplierDue: suppAgg[0]?.total || 0,
  };
}

export async function postSaleEntries({
  shopId,
  sale,
  payments = [],
  creditAmount = 0,
  session = null,
}) {
  const date = sale.date || todayStr();
  const opts = session ? { session } : {};
  const docs = [];

  for (const p of payments) {
    const amount = Number(p.amount) || 0;
    if (amount <= 0) continue;
    const method = p.method || 'Cash';

    if (method === 'Credit') continue;

    if (isCashMethod(method)) {
      docs.push({
        shop: shopId,
        type: 'sale_cash',
        amount,
        date,
        method: 'Cash',
        sale: sale._id,
        customer: sale.customer || null,
        note: `Sale ${sale.invoice}`,
      });
    } else if (isBankLikeMethod(method)) {
      docs.push({
        shop: shopId,
        type: 'sale_bank',
        amount,
        date,
        method,
        bankAccount: p.bankAccount || null,
        sale: sale._id,
        customer: sale.customer || null,
        note: `Sale ${sale.invoice}`,
      });
    }
  }

  const credit = Number(creditAmount) || 0;
  if (credit > 0) {
    if (!sale.customer) {
      throw Object.assign(new Error('Customer required for credit sale'), { status: 400 });
    }
    docs.push({
      shop: shopId,
      type: 'customer_credit',
      amount: credit,
      date,
      method: 'Credit',
      sale: sale._id,
      customer: sale.customer,
      note: `Credit sale ${sale.invoice}`,
    });
    await Customer.findOneAndUpdate(
      { _id: sale.customer, shop: shopId },
      { $inc: { balance: credit } },
      opts
    );
  }

  if (docs.length) {
    await AccountEntry.insertMany(docs, opts);
  }
}

export async function postExpenseEntry({ shopId, expense, session = null }) {
  const opts = session ? { session } : {};
  const payFrom = expense.payFrom || 'cash';
  await AccountEntry.create(
    [
      {
        shop: shopId,
        type: 'expense',
        amount: Number(expense.amount) || 0,
        date: expense.date || todayStr(),
        method: payFrom,
        bankAccount: payFrom === 'bank' ? expense.bankAccount || null : null,
        expense: expense._id,
        note: expense.desc || 'Expense',
      },
    ],
    opts
  );
}

export async function reverseExpenseEntry(shopId, expenseId) {
  await AccountEntry.deleteMany({ shop: shopId, expense: expenseId, type: 'expense' });
}

/**
 * Post ledger for a sale return refund.
 * Cash/bank refunds reduce balances; Credit reduces customer due.
 */
export async function postSaleReturnEntries({
  shopId,
  sale,
  saleReturn,
  refundAmount,
  refundMethod,
  bankAccount = null,
}) {
  const amount = Number(refundAmount) || 0;
  if (amount <= 0) return;

  const date = saleReturn.date || todayStr();
  const note = `Return ${saleReturn.returnNo} for ${sale.invoice}`;

  if (refundMethod === 'Credit') {
    if (!sale.customer) {
      throw Object.assign(new Error('Customer required for credit refund'), { status: 400 });
    }
    const customer = await Customer.findOne({ _id: sale.customer, shop: shopId });
    if (!customer) {
      throw Object.assign(new Error('Customer not found'), { status: 404 });
    }
    const reduce = Math.min(amount, Number(customer.balance) || 0);
    if (reduce + 0.001 < amount) {
      throw Object.assign(
        new Error(
          `Customer due (${customer.balance}) is less than refund (${amount}). Use Cash/Bank refund or receive less.`
        ),
        { status: 400 }
      );
    }
    customer.balance = Math.max(0, Number((customer.balance - amount).toFixed(2)));
    await customer.save();
    await AccountEntry.create({
      shop: shopId,
      type: 'sale_return_credit',
      amount,
      date,
      method: 'Credit',
      sale: sale._id,
      saleReturn: saleReturn._id,
      customer: sale.customer,
      note,
    });
    return;
  }

  if (isCashMethod(refundMethod)) {
    const cash = await getCashBalance(shopId);
    if (amount > cash + 0.001) {
      throw Object.assign(new Error('Insufficient cash for refund'), { status: 400 });
    }
    await AccountEntry.create({
      shop: shopId,
      type: 'sale_return_cash',
      amount,
      date,
      method: 'Cash',
      sale: sale._id,
      saleReturn: saleReturn._id,
      customer: sale.customer || null,
      note,
    });
    return;
  }

  if (isBankLikeMethod(refundMethod)) {
    if (!bankAccount) {
      throw Object.assign(new Error('Bank account required for bank refund'), { status: 400 });
    }
    const row = await getBankBalance(shopId, bankAccount);
    if (!row || amount > row.balance + 0.001) {
      throw Object.assign(new Error('Insufficient bank balance for refund'), { status: 400 });
    }
    await AccountEntry.create({
      shop: shopId,
      type: 'sale_return_bank',
      amount,
      date,
      method: refundMethod,
      bankAccount,
      sale: sale._id,
      saleReturn: saleReturn._id,
      customer: sale.customer || null,
      note,
    });
    return;
  }

  throw Object.assign(new Error('Invalid refund method'), { status: 400 });
}

export async function postPurchaseEntries({
  shopId,
  purchase,
  payments = [],
  creditAmount = 0,
}) {
  const date = purchase.date || todayStr();
  const docs = [];
  const note = `Purchase ${purchase.purchaseNo}`;

  let cashNeed = 0;
  const bankNeed = new Map();

  for (const p of payments) {
    const amount = Number(p.amount) || 0;
    if (amount <= 0) continue;
    const method = p.method || 'Cash';

    if (isCashMethod(method)) {
      cashNeed += amount;
      docs.push({
        shop: shopId,
        type: 'purchase_cash',
        amount,
        date,
        method: 'Cash',
        purchase: purchase._id,
        supplier: purchase.supplier,
        note,
      });
    } else if (isBankLikeMethod(method)) {
      if (!p.bankAccount) {
        throw Object.assign(new Error('Bank account required for bank purchase payment'), {
          status: 400,
        });
      }
      const key = String(p.bankAccount);
      bankNeed.set(key, (bankNeed.get(key) || 0) + amount);
      docs.push({
        shop: shopId,
        type: 'purchase_bank',
        amount,
        date,
        method,
        bankAccount: p.bankAccount,
        purchase: purchase._id,
        supplier: purchase.supplier,
        note,
      });
    }
  }

  if (cashNeed > 0) {
    const cash = await getCashBalance(shopId);
    if (cashNeed > cash + 0.001) {
      throw Object.assign(new Error('Insufficient cash for purchase payment'), { status: 400 });
    }
  }

  for (const [bankId, amount] of bankNeed.entries()) {
    const row = await getBankBalance(shopId, bankId);
    if (!row || amount > row.balance + 0.001) {
      throw Object.assign(new Error('Insufficient bank balance for purchase payment'), {
        status: 400,
      });
    }
  }

  const credit = Number(creditAmount) || 0;
  if (credit > 0) {
    docs.push({
      shop: shopId,
      type: 'purchase_credit',
      amount: credit,
      date,
      method: 'Credit',
      purchase: purchase._id,
      supplier: purchase.supplier,
      note: `${note} (supplier due)`,
    });
    await Supplier.findOneAndUpdate(
      { _id: purchase.supplier, shop: shopId },
      { $inc: { balance: credit } }
    );
  }

  if (docs.length) {
    await AccountEntry.insertMany(docs);
  }
}

export { CASH_IN_TYPES, CASH_OUT_TYPES, BANK_IN_TYPES, BANK_OUT_TYPES, isCashMethod, isBankLikeMethod };
