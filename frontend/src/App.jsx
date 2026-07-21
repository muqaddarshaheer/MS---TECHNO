import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ShopLayout from './layouts/ShopLayout';
import SuperLayout from './layouts/SuperLayout';

const ShopDashboard = lazy(() => import('./pages/shop/Dashboard'));
const Products = lazy(() => import('./pages/shop/Products'));
const Stock = lazy(() => import('./pages/shop/Stock'));
const Pos = lazy(() => import('./pages/shop/Pos'));
const Invoices = lazy(() => import('./pages/shop/Invoices'));
const Customers = lazy(() => import('./pages/shop/Customers'));
const Suppliers = lazy(() => import('./pages/shop/Suppliers'));
const Purchases = lazy(() => import('./pages/shop/Purchases'));
const CashBook = lazy(() => import('./pages/shop/CashBook'));
const Banks = lazy(() => import('./pages/shop/Banks'));
const DailyClosing = lazy(() => import('./pages/shop/DailyClosing'));
const Reviews = lazy(() => import('./pages/shop/Reviews'));
const Profit = lazy(() => import('./pages/shop/Profit'));
const Expenses = lazy(() => import('./pages/shop/Expenses'));
const Reports = lazy(() => import('./pages/shop/Reports'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const SuperHome = lazy(() => import('./pages/super/Home'));
const AllShops = lazy(() => import('./pages/super/AllShops'));
const Announcements = lazy(() => import('./pages/super/Announcements'));
const TenantRequests = lazy(() => import('./pages/super/TenantRequests'));

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="login-page">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'super' ? '/super' : '/shop'} replace />;
  }
  return children;
}

function PosGate({ children }) {
  const { user } = useAuth();
  if (!user?.shop?.plan?.hasPos) {
    return <Navigate to="/shop" replace />;
  }
  return children;
}

function Fallback() {
  return <div className="login-page">Loading...</div>;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <Fallback />;

  return (
    <Suspense fallback={<Fallback />}>
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
          <Route
            path="pos"
            element={
              <PosGate>
                <Pos />
              </PosGate>
            }
          />
          <Route
            path="invoices"
            element={
              <PosGate>
                <Invoices />
              </PosGate>
            }
          />
          <Route path="customers" element={<Customers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="accounts/cash" element={<CashBook />} />
          <Route path="accounts/banks" element={<Banks />} />
          <Route path="accounts/daily" element={<DailyClosing />} />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
