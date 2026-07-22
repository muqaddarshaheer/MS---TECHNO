/** Frontend permission helpers (mirrors backend matrix) */

const PERMISSIONS = {
  dashboard: ['owner', 'manager', 'cashier'],
  products: ['owner', 'manager'],
  stock: ['owner', 'manager'],
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

export function can(user, permission) {
  if (!user || user.role !== 'shop') return false;
  if (user.permissions && typeof user.permissions[permission] === 'boolean') {
    return user.permissions[permission];
  }
  const role = user.shopRole || 'owner';
  return (PERMISSIONS[permission] || []).includes(role);
}
