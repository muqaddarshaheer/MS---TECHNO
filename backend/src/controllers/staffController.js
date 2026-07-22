import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';
import { getShopId } from '../middleware/auth.js';
import { SHOP_ROLES, normalizeShopRole } from '../config/permissions.js';
import { getPlan } from '../config/plans.js';

function maxUsersForShop(shop) {
  const plan = getPlan(shop.package);
  return plan.maxUsers == null ? 99 : Number(plan.maxUsers) || 1;
}

export async function listStaff(req, res, next) {
  try {
    const shopId = getShopId(req);
    const users = await User.find({ shop: shopId, role: 'shop' })
      .sort({ shopRole: 1, createdAt: 1 })
      .select('username displayName shopRole isActive createdAt');
    const shop = await Shop.findById(shopId);
    res.json({
      users: users.map((u) => u.toSafeJSON()),
      limits: {
        maxUsers: shop ? maxUsersForShop(shop) : 1,
        used: users.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createStaff(req, res, next) {
  try {
    const shopId = getShopId(req);
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const maxUsers = maxUsersForShop(shop);
    const used = await User.countDocuments({ shop: shopId, role: 'shop' });
    if (used >= maxUsers) {
      return res.status(403).json({
        message: `User limit reached for ${shop.package} plan (${maxUsers}). Upgrade to add more staff.`,
        code: 'USER_LIMIT',
      });
    }

    const username = String(req.body.username || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');
    const shopRole = normalizeShopRole(req.body.shopRole || 'cashier');
    const displayName = String(req.body.displayName || '').trim();

    if (!username || password.length < 6) {
      return res.status(400).json({ message: 'Username and password (min 6) required' });
    }
    if (!SHOP_ROLES.includes(shopRole) || shopRole === 'owner') {
      return res.status(400).json({
        message: 'Can create manager, cashier, salesman, or warehouse (one owner per shop)',
      });
    }

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: 'Username already taken' });

    const user = await User.create({
      username,
      password,
      role: 'shop',
      shopRole,
      displayName: displayName || username,
      shop: shopId,
      isActive: true,
    });

    res.status(201).json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

export async function updateStaff(req, res, next) {
  try {
    const shopId = getShopId(req);
    const user = await User.findOne({ _id: req.params.id, shop: shopId, role: 'shop' });
    if (!user) return res.status(404).json({ message: 'Staff not found' });

    // Cannot demote/disable the last owner
    if (user.shopRole === 'owner' || normalizeShopRole(user.shopRole) === 'owner') {
      if (req.body.shopRole && req.body.shopRole !== 'owner') {
        return res.status(400).json({ message: 'Cannot change owner role here' });
      }
      if (req.body.isActive === false || req.body.isActive === 'false') {
        return res.status(400).json({ message: 'Cannot deactivate the shop owner' });
      }
    }

    if (req.body.displayName != null) user.displayName = String(req.body.displayName).trim();
    if (req.body.isActive != null && normalizeShopRole(user.shopRole) !== 'owner') {
      user.isActive = Boolean(req.body.isActive);
    }
    if (req.body.shopRole && normalizeShopRole(user.shopRole) !== 'owner') {
      const nextRole = normalizeShopRole(req.body.shopRole);
      if (nextRole === 'owner') {
        return res.status(400).json({ message: 'Cannot promote to owner this way' });
      }
      user.shopRole = nextRole;
    }
    if (req.body.password) {
      if (String(req.body.password).length < 6) {
        return res.status(400).json({ message: 'Password min 6 characters' });
      }
      user.password = req.body.password;
    }

    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

export async function deleteStaff(req, res, next) {
  try {
    const shopId = getShopId(req);
    const user = await User.findOne({ _id: req.params.id, shop: shopId, role: 'shop' });
    if (!user) return res.status(404).json({ message: 'Staff not found' });
    if (normalizeShopRole(user.shopRole) === 'owner') {
      return res.status(400).json({ message: 'Cannot delete the shop owner' });
    }
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await user.deleteOne();
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    next(err);
  }
}
