import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ShopLayout from './layouts/ShopLayout';
import SuperLayout from './layouts/SuperLayout';
import { can } from './utils/permissions';

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
const Staff = lazy(() => import('./pages/shop/Staff'));
const ShopSettings = lazy(() => import('./pages/shop/ShopSettings'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const SuperHome = lazy(() => import('./pages/super/Home'));
const AllShops = lazy(() => import('./pages/super/AllShops'));
const Announcements = lazy(() => import('./pages/super/Announcements'));
const TenantRequests = lazy(() => import('./pages/super/TenantRequests'));
const Billing = lazy(() => import('./pages/super/Billing'));

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

function PermGate({ permission, children }) {
  const { user } = useAuth();
  if (!can(user, permission)) {
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
          <Route
            path="products"
            element={
              <PermGate permission="products">
                <Products />
              </PermGate>
            }
          />
          <Route
            path="stock"
            element={
              <PermGate permission="stock">
                <Stock />
              </PermGate>
            }
          />
          <Route
            path="pos"
            element={
              <PosGate>
                <PermGate permission="pos">
                  <Pos />
                </PermGate>
              </PosGate>
            }
          />
          <Route
            path="invoices"
            element={
              <PosGate>
                <PermGate permission="invoices">
                  <Invoices />
                </PermGate>
              </PosGate>
            }
          />
          <Route
            path="customers"
            element={
              <PermGate permission="customers">
                <Customers />
              </PermGate>
            }
          />
          <Route
            path="suppliers"
            element={
              <PermGate permission="suppliers">
                <Suppliers />
              </PermGate>
            }
          />
          <Route
            path="purchases"
            element={
              <PermGate permission="purchases">
                <Purchases />
              </PermGate>
            }
          />
          <Route
            path="accounts/cash"
            element={
              <PermGate permission="accounts">
                <CashBook />
              </PermGate>
            }
          />
          <Route
            path="accounts/banks"
            element={
              <PermGate permission="accounts">
                <Banks />
              </PermGate>
            }
          />
          <Route
            path="accounts/daily"
            element={
              <PermGate permission="accounts">
                <DailyClosing />
              </PermGate>
            }
          />
          <Route
            path="reviews"
            element={
              <PermGate permission="reviews">
                <Reviews />
              </PermGate>
            }
          />
          <Route
            path="profit"
            element={
              <PermGate permission="profit">
                <Profit />
              </PermGate>
            }
          />
          <Route
            path="expenses"
            element={
              <PermGate permission="expenses">
                <Expenses />
              </PermGate>
            }
          />
          <Route
            path="reports"
            element={
              <PermGate permission="reports">
                <Reports />
              </PermGate>
            }
          />
          <Route
            path="staff"
            element={
              <PermGate permission="staff">
                <Staff />
              </PermGate>
            }
          />
          <Route
            path="settings"
            element={
              <PermGate permission="settings">
                <ShopSettings />
              </PermGate>
            }
          />
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
          <Route path="billing" element={<Billing />} />
          <Route path="password" element={<ChangePassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
