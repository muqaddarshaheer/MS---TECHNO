import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardShell from './DashboardShell';
import api from '../api';

export default function ShopLayout() {
  const { user, logout, token } = useAuth();
  const shop = user?.shop;
  const hasPos = Boolean(shop?.plan?.hasPos);
  const isBlocked = shop?.status === 'blocked' || shop?.status === 'suspended';

  // Refresh shop status so a mid-session block shows the lock screen
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

  const links = [
    { to: '/shop', end: true, label: 'Dashboard' },
    { to: '/shop/products', label: 'Products' },
    { to: '/shop/stock', label: 'Stock' },
    ...(hasPos
      ? [
          { to: '/shop/pos', label: 'POS' },
          { to: '/shop/invoices', label: 'Invoices' },
        ]
      : []),
    { to: '/shop/customers', label: 'Customers' },
    ...(hasPos || shop?.package !== 'Basic' ? [{ to: '/shop/reviews', label: 'Reviews' }] : []),
    ...(shop?.package !== 'Basic' ? [{ to: '/shop/profit', label: 'Profit' }] : []),
    { to: '/shop/expenses', label: 'Expenses' },
    { to: '/shop/reports', label: 'Reports' },
    { to: '/shop/password', label: 'Password' },
  ];

  return (
    <DashboardShell
      brand={<>{shop?.name || 'MS Techno'}</>}
      subtitle={`${shop?.package || 'Basic'} plan${shop?.owner ? ` · ${shop.owner}` : ''}`}
      links={links}
      onLogout={logout}
      accountLocked={isBlocked}
      lockTitle="Your account is blocked"
      lockMessage="Kindly contact your software provider."
    />
  );
}
