/** Shop staff roles and route/module permissions */

export const SHOP_ROLES = ['owner', 'manager', 'cashier', 'salesman', 'warehouse'];

/**
 * Default modules per role.
 * Owner always has everything. Custom overrides can be stored on User.customPermissions later.
 */
export const PERMISSIONS = {
  dashboard: ['owner', 'manager', 'cashier', 'salesman', 'warehouse'],
  products: ['owner', 'manager', 'warehouse'],
  stock: ['owner', 'manager', 'warehouse'],
  catalog: ['owner', 'manager', 'cashier', 'salesman', 'warehouse'],
  pos: ['owner', 'manager', 'cashier', 'salesman'],
  invoices: ['owner', 'manager', 'cashier', 'salesman'],
  customers: ['owner', 'manager', 'cashier', 'salesman'],
  suppliers: ['owner', 'manager', 'warehouse'],
  purchases: ['owner', 'manager', 'warehouse'],
  accounts: ['owner', 'manager'],
  expenses: ['owner', 'manager'],
  reports: ['owner', 'manager'],
  reviews: ['owner', 'manager'],
  profit: ['owner', 'manager'],
  staff: ['owner'],
  settings: ['owner'],
  audit: ['owner', 'manager'],
};

export function normalizeShopRole(role) {
  if (SHOP_ROLES.includes(role)) return role;
  return 'owner';
}

export function roleHasPermission(shopRole, permission, customPermissions = null) {
  if (customPermissions && typeof customPermissions[permission] === 'boolean') {
    return customPermissions[permission];
  }
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(normalizeShopRole(shopRole));
}

export function permissionsForRole(shopRole, customPermissions = null) {
  const role = normalizeShopRole(shopRole);
  const out = {};
  for (const key of Object.keys(PERMISSIONS)) {
    out[key] = roleHasPermission(role, key, customPermissions);
  }
  return out;
}

export const ROLE_LABELS = {
  owner: 'Owner — full shop control',
  manager: 'Manager — all except employees & settings',
  cashier: 'Cashier — POS, invoices, customers',
  salesman: 'Salesman — POS & customers',
  warehouse: 'Warehouse — stock, products, purchases',
};
