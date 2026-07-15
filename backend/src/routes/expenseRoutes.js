import { Router } from 'express';
import {
  listExpenses,
  createExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { requireAuth, requireShopAccess } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireShopAccess);
router.get('/', listExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);
export default router;
