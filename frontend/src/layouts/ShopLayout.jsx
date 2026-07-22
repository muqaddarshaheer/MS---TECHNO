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

  const sections = [
    {
      group: 'Overview',
      items: [{ to: '/shop', end: true, label: 'Dashboard', hint: 'Business overview', perm: 'dashboard' }],
    },
    {
      group: 'Catalog',
      items: [
        { to: '/shop/products', label: 'Products', hint: 'Add & edit products', perm: 'products' },
        { to: '/shop/stock', label: 'Stock', hint: 'Adjust inventory', perm: 'stock' },
      ],
    },
    {
      group: 'Sales',
      items: [
        ...(hasPos
          ? [
              { to: '/shop/pos', label: 'POS Billing', hint: 'Fast checkout', perm: 'pos' },
              { to: '/shop/invoices', label: 'Invoices', hint: 'Print & returns', perm: 'invoices' },
            ]
          : []),
        { to: '/shop/customers', label: 'Customers', hint: 'Dues & payments', perm: 'customers' },
      ],
    },
    {
      group: 'Buying',
      items: [
        { to: '/shop/suppliers', label: 'Suppliers', hint: 'Supplier dues', perm: 'suppliers' },
        { to: '/shop/purchases', label: 'Purchases', hint: 'Receive stock', perm: 'purchases' },
      ],
    },
    {
      group: 'Money',
      items: [
        { to: '/shop/accounts/cash', label: 'Cash book', hint: 'Cash in & out', perm: 'accounts' },
        { to: '/shop/accounts/banks', label: 'Banks', hint: 'Bank & JazzCash', perm: 'accounts' },
        { to: '/shop/accounts/daily', label: 'Daily closing', hint: 'End of day', perm: 'accounts' },
        { to: '/shop/expenses', label: 'Expenses', hint: 'Shop expenses', perm: 'expenses' },
        ...(shop?.package !== 'Basic'
          ? [{ to: '/shop/profit', label: 'Profit', hint: 'Profit analysis', perm: 'profit' }]
          : []),
      ],
    },
    {
      group: 'Insights',
      items: [
        { to: '/shop/reports', label: 'Reports', hint: 'Sales & purchases', perm: 'reports' },
        ...(hasPos || shop?.package !== 'Basic'
          ? [{ to: '/shop/reviews', label: 'Reviews', hint: 'Customer feedback', perm: 'reviews' }]
          : []),
      ],
    },
    {
      group: 'Team & setup',
      items: [
        { to: '/shop/staff', label: 'Employees', hint: 'Roles & logins', perm: 'staff' },
        { to: '/shop/settings', label: 'Shop settings', hint: 'Profile & invoice', perm: 'settings' },
        { to: '/shop/password', label: 'Password', hint: 'Change password', perm: 'settings' },
      ],
    },
  ];

  const links = [];
  for (const section of sections) {
    const visible = section.items.filter((l) => can(user, l.perm));
    if (!visible.length) continue;
    links.push({ type: 'group', label: section.group });
    links.push(...visible);
  }

  return (
    <DashboardShell
      brand={<>{shop?.name || 'MS Techno'}</>}
      subtitle={`Shop Owner Panel · ${roleLabel}${shop?.package ? ` · ${shop.package}` : ''}`}
      links={links}
      onLogout={logout}
      accountLocked={isBlocked}
      lockTitle="Your account is blocked"
      lockMessage="Kindly contact your software provider."
    />
  );
}
