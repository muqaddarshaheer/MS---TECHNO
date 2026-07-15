import { Customer } from '../models/Customer.js';
import { getShopId } from '../middleware/auth.js';

export async function listCustomers(req, res, next) {
  try {
    const shopId = getShopId(req);
    const customers = await Customer.find({ shop: shopId }).sort({ spent: -1 });
    res.json({ customers });
  } catch (err) {
    next(err);
  }
}
