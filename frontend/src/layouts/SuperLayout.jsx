import { useAuth } from '../context/AuthContext';
import DashboardShell from './DashboardShell';

const links = [
  { to: '/super', end: true, label: 'Dashboard' },
  { to: '/super/shops', label: 'All Shops' },
  { to: '/super/requests', label: 'Demo requests' },
  { to: '/super/announcements', label: 'Announcements' },
  { to: '/super/password', label: 'Password' },
];

export default function SuperLayout() {
  const { logout } = useAuth();

  return (
    <DashboardShell
      brand={
        <>
          MS <span>TECHNO</span>
        </>
      }
      subtitle="Super Admin"
      links={links}
      onLogout={logout}
      superTheme
    />
  );
}
