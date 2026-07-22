/** Shop staff roles and route/module permissions */

export const SHOP_ROLES = ['owner', 'manager', 'cashier'];

/** Module keys used by API + frontend nav */
export const PERMISSIONS = {
  dashboard: ['owner', 'manager', 'cashier'],
  /** Product catalog edits + stock page */
  products: ['owner', 'manager'],
  stock: ['owner', 'manager'],
  /** Read products for POS (cashiers need this) */
  catalog: ['owner', 'manager', 'cashier'],
  pos: ['owner', 'manager', 'cashier'],
  invoices: ['owner', 'manager', 'cashier'],
  customers: ['owner', 'manager', 'cashier'],
  suppliers: ['owner', 'manager'],
  purchases: ['owner', 'manager'],
  accounts: ['owner', 'manager'],
  expenses: ['owner', 'manager'],
  reports: ['owner', 'manager'],
  reviews: ['owner', 'manager'],
  profit: ['owner', 'manager'],
  staff: ['owner'],
  settings: ['owner', 'manager'],
};

export function normalizeShopRole(role) {
  if (SHOP_ROLES.includes(role)) return role;
  return 'owner';
}

export function roleHasPermission(shopRole, permission) {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(normalizeShopRole(shopRole));
}

export function permissionsForRole(shopRole) {
  const role = normalizeShopRole(shopRole);
  const out = {};
  for (const [key, roles] of Object.entries(PERMISSIONS)) {
    out[key] = roles.includes(role);
  }
  return out;
}
