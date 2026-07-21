import { Expense } from '../models/Expense.js';
import { getShopId } from '../middleware/auth.js';
import {
  ensureShopAccountsDefaults,
  getCashBalance,
  getBankBalance,
  postExpenseEntry,
  reverseExpenseEntry,
  todayStr,
} from '../services/accountService.js';

export async function listExpenses(req, res, next) {
  try {
    const shopId = getShopId(req);
    const expenses = await Expense.find({ shop: shopId }).sort({ createdAt: -1 });
    res.json({ expenses });
  } catch (err) {
    next(err);
  }
}

export async function createExpense(req, res, next) {
  try {
    const shopId = getShopId(req);
    await ensureShopAccountsDefaults(shopId);
    const amount = Number(req.body.amount) || 0;
    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const payFrom = req.body.payFrom === 'bank' ? 'bank' : 'cash';
    const bankAccount = payFrom === 'bank' ? req.body.bankAccount || null : null;

    if (payFrom === 'cash') {
      const cash = await getCashBalance(shopId);
      if (amount > cash + 0.001) {
        return res.status(400).json({ message: 'Insufficient cash balance' });
      }
    } else {
      if (!bankAccount) {
        return res.status(400).json({ message: 'Bank account required' });
      }
      const row = await getBankBalance(shopId, bankAccount);
      if (!row || amount > row.balance + 0.001) {
        return res.status(400).json({ message: 'Insufficient bank balance' });
      }
    }

    const expense = await Expense.create({
      shop: shopId,
      desc: req.body.desc || 'Expense',
      amount,
      date: req.body.date || todayStr(),
      payFrom,
      bankAccount,
    });

    await postExpenseEntry({ shopId, expense });
    res.status(201).json({ expense });
  } catch (err) {
    next(err);
  }
}

export async function deleteExpense(req, res, next) {
  try {
    const shopId = getShopId(req);
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, shop: shopId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    await reverseExpenseEntry(shopId, expense._id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
}
