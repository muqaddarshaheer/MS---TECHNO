import { Expense } from '../models/Expense.js';
import { getShopId } from '../middleware/auth.js';

function today() {
  return new Date().toISOString().split('T')[0];
}

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
    const expense = await Expense.create({
      shop: shopId,
      desc: req.body.desc || 'Expense',
      amount: Number(req.body.amount) || 0,
      date: req.body.date || today(),
    });
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
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
}
