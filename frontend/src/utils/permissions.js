/** Frontend permission helpers (mirrors backend matrix) */

const PERMISSIONS = {
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

export function can(user, permission) {
  if (!user || user.role !== 'shop') return false;
  if (user.permissions && typeof user.permissions[permission] === 'boolean') {
    return user.permissions[permission];
  }
  const role = user.shopRole || 'owner';
  return (PERMISSIONS[permission] || []).includes(role);
}
