import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

export default function ShopDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/sales/dashboard'), api.get('/announcements')])
      .then(([dash, ann]) => {
        setData(dash.data);
        setAnnouncements(ann.data.announcements || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!data) return <p className="empty">Loading dashboard...</p>;

  const { stats, recentOrders, topSelling, charts, shop } = data;
  const today = new Date().toISOString().split('T')[0];
  const plan = user?.shop?.plan;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            {shop?.name} · Exp {shop?.expiry?.slice?.(0, 10) || String(shop?.expiry).slice(0, 10)} · {today}
          </p>
          {plan && (
            <div className="tenant-pill">
              <span className="badge gold">{plan.name} plan</span>
              <span className="badge">
                Products {stats.products}
                {plan.unlimitedProducts || plan.maxProducts == null
                  ? ' · Unlimited'
                  : `/${plan.maxProducts}`}
              </span>
              {plan.hasPos ? (
                <span className="badge">POS enabled</span>
              ) : (
                <span className="badge warn">POS locked — upgrade</span>
              )}
              {user?.shop?.slug && <span className="badge">tenant:{user.shop.slug}</span>}
            </div>
          )}
        </div>
        <span className="badge">{shop?.status}</span>
      </div>

      {announcements.map((a) => (
        <div className="announce" key={a._id}>
          <strong>{a.title}</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{a.msg}</div>
        </div>
      ))}

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Today sales</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.todaySales ?? stats.todayRevenue)}</h2>
        </div>
        <div className="card stat">
          <h6>Monthly sales</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.monthSales ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Yearly sales</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.yearSales ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Total purchase</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.totalPurchase ?? 0)}</h2>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Today purchase</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.todayPurchase ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Month purchase</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.monthPurchase ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Expenses today</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.expensesToday ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Gross profit</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.profit ?? 0)}</h2>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Cash balance</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.cashBalance ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Bank balance</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.bankBalance ?? 0)}</h2>
        </div>
        <div className="card stat warn">
          <h6>Customer due</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.customerDue ?? 0)}</h2>
        </div>
        <div className="card stat danger">
          <h6>Supplier due</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.supplierDue ?? 0)}</h2>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--display)', fontSize: '1.05rem' }}>Daily closing</h3>
            <p className="page-sub" style={{ margin: '0.25rem 0 0' }}>
              Today {money(stats.todaySales ?? 0)} sales · {money(stats.expensesToday ?? 0)} expenses ·
              net {money((stats.todaySales ?? 0) - (stats.expensesToday ?? 0))}
            </p>
          </div>
          <Link className="btn btn-outline btn-sm" to="/shop/accounts/daily">
            Open daily closing
          </Link>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat warn">
          <h6>Low stock</h6>
          <h2>{stats.low}</h2>
        </div>
        <div className="card stat danger">
          <h6>Out of stock</h6>
          <h2>{stats.out}</h2>
        </div>
        <div className="card stat">
          <h6>Products</h6>
          <h2>{stats.products}</h2>
        </div>
        <div className="card stat">
          <h6>Profit (all)</h6>
          <h2 style={{ fontSize: '1.1rem' }}>{money(stats.profit)}</h2>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '1rem' }}>
        <div className="card chart-box">
          <Line
            data={{
              labels: charts.labels,
              datasets: [
                {
                  label: 'Sales (PKR)',
                  data: charts.sales,
                  borderColor: '#0f5c4c',
                  tension: 0.3,
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
        <div className="card chart-box">
          <Bar
            data={{
              labels: charts.labels,
              datasets: [
                {
                  label: 'Profit (PKR)',
                  data: charts.profit,
                  backgroundColor: '#b0892e',
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Recent orders</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Source</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">
                      No sales yet
                    </td>
                  </tr>
                )}
                {recentOrders.map((s) => (
                  <tr key={s._id}>
                    <td>{s.invoice}</td>
                    <td>{s.customerName}</td>
                    <td>{s.source}</td>
                    <td>{money(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Top selling</h3>
          {topSelling.length === 0 && <p className="empty">No data yet</p>}
          <ul style={{ listStyle: 'none' }}>
            {topSelling.map((t) => (
              <li
                key={t.productId}
                className="row"
                style={{ justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--line)' }}
              >
                <span>{t.name}</span>
                <strong>{t.qty}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
