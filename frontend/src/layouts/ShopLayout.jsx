import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardShell from './DashboardShell';
import api from '../api';
import { can } from '../utils/permissions';

export default function ShopLayout() {
  const { user, logout, token } = useAuth();
  const shop = user?.shop;
  const hasPos = Boolean(shop?.plan?.hasPos);
  const isBlocked = shop?.status === 'blocked' || shop?.status === 'suspended';
  const roleLabel = user?.shopRole || 'owner';

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    async function refresh() {
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled && data.user) {
          localStorage.setItem('scentra_user', JSON.stringify(data.user));
          window.dispatchEvent(new CustomEvent('ms-auth-refresh', { detail: data.user }));
        }
      } catch {
        /* ignore */
      }
    }
    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, [token]);

  const allLinks = [
    { to: '/shop', end: true, label: 'Dashboard', perm: 'dashboard' },
    { to: '/shop/products', label: 'Products', perm: 'products' },
    { to: '/shop/stock', label: 'Stock', perm: 'stock' },
    ...(hasPos
      ? [
          { to: '/shop/pos', label: 'POS', perm: 'pos' },
          { to: '/shop/invoices', label: 'Invoices', perm: 'invoices' },
        ]
      : []),
    { to: '/shop/customers', label: 'Customers', perm: 'customers' },
    { to: '/shop/suppliers', label: 'Suppliers', perm: 'suppliers' },
    { to: '/shop/purchases', label: 'Purchases', perm: 'purchases' },
    { to: '/shop/accounts/cash', label: 'Cash book', perm: 'accounts' },
    { to: '/shop/accounts/banks', label: 'Banks', perm: 'accounts' },
    { to: '/shop/accounts/daily', label: 'Daily closing', perm: 'accounts' },
    ...(hasPos || shop?.package !== 'Basic'
      ? [{ to: '/shop/reviews', label: 'Reviews', perm: 'reviews' }]
      : []),
    ...(shop?.package !== 'Basic' ? [{ to: '/shop/profit', label: 'Profit', perm: 'profit' }] : []),
    { to: '/shop/expenses', label: 'Expenses', perm: 'expenses' },
    { to: '/shop/reports', label: 'Reports', perm: 'reports' },
    { to: '/shop/staff', label: 'Employees', perm: 'staff' },
    { to: '/shop/password', label: 'Password', perm: 'settings' },
  ];

  const links = allLinks.filter((l) => can(user, l.perm));

  return (
    <DashboardShell
      brand={<>{shop?.name || 'MS Techno'}</>}
      subtitle={`${shop?.package || 'Basic'} · ${roleLabel}${shop?.owner ? ` · ${shop.owner}` : ''}`}
      links={links}
      onLogout={logout}
      accountLocked={isBlocked}
      lockTitle="Your account is blocked"
      lockMessage="Kindly contact your software provider."
    />
  );
}
