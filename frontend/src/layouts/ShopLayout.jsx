import { useAuth } from '../context/AuthContext';
import DashboardShell from './DashboardShell';

const links = [
  { to: '/shop', end: true, label: 'Dashboard' },
  { to: '/shop/products', label: 'Products' },
  { to: '/shop/stock', label: 'Stock' },
  { to: '/shop/pos', label: 'POS' },
  { to: '/shop/invoices', label: 'Invoices' },
  { to: '/shop/customers', label: 'Customers' },
  { to: '/shop/reviews', label: 'Reviews' },
  { to: '/shop/profit', label: 'Profit' },
  { to: '/shop/expenses', label: 'Expenses' },
  { to: '/shop/reports', label: 'Reports' },
  { to: '/shop/password', label: 'Password' },
];

export default function ShopLayout() {
  const { user, logout } = useAuth();
  const shop = user?.shop;

  return (
    <DashboardShell
      brand={<>{shop?.name || 'MS Techno'}</>}
      subtitle={shop?.owner || ''}
      links={links}
      onLogout={logout}
    />
  );
}
