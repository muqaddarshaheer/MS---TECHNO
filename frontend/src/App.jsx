import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ShopLayout from './layouts/ShopLayout';
import SuperLayout from './layouts/SuperLayout';
import ShopDashboard from './pages/shop/Dashboard';
import Products from './pages/shop/Products';
import Stock from './pages/shop/Stock';
import Pos from './pages/shop/Pos';
import Invoices from './pages/shop/Invoices';
import Customers from './pages/shop/Customers';
import Reviews from './pages/shop/Reviews';
import Profit from './pages/shop/Profit';
import Expenses from './pages/shop/Expenses';
import Reports from './pages/shop/Reports';
import ChangePassword from './pages/ChangePassword';
import SuperHome from './pages/super/Home';
import AllShops from './pages/super/AllShops';
import Announcements from './pages/super/Announcements';
import TenantRequests from './pages/super/TenantRequests';

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="login-page">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'super' ? '/super' : '/shop'} replace />;
  }
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="login-page">Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={user.role === 'super' ? '/super' : '/shop'} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/shop"
        element={
          <Protected role="shop">
            <ShopLayout />
          </Protected>
        }
      >
        <Route index element={<ShopDashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="stock" element={<Stock />} />
        <Route path="pos" element={<Pos />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="profit" element={<Profit />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="password" element={<ChangePassword />} />
      </Route>

      <Route
        path="/super"
        element={
          <Protected role="super">
            <SuperLayout />
          </Protected>
        }
      >
        <Route index element={<SuperHome />} />
        <Route path="shops" element={<AllShops />} />
        <Route path="requests" element={<TenantRequests />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="password" element={<ChangePassword />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={user ? (user.role === 'super' ? '/super' : '/shop') : '/'}
            replace
          />
        }
      />
    </Routes>
  );
}
