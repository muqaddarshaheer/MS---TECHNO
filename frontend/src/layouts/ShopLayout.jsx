import { useAuth } from '../context/AuthContext';
import DashboardShell from './DashboardShell';

export default function ShopLayout() {
  const { user, logout } = useAuth();
  const shop = user?.shop;
  const hasPos = Boolean(shop?.plan?.hasPos);

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
    />
  );
}
