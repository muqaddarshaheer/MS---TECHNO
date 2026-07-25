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
  Filler,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
);

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

  const { stats, recentOrders, recentPurchases, topSelling, charts, shop } = data;
  const today = new Date().toISOString().split('T')[0];
  const plan = user?.shop?.plan;
  const hasPos = Boolean(plan?.hasPos);

  const quick = [
    hasPos && can(user, 'pos') && { to: '/shop/pos', label: 'New sale', primary: true },
    can(user, 'purchases') && { to: '/shop/purchases', label: 'New purchase' },
    can(user, 'products') && { to: '/shop/products', label: 'Add product' },
    can(user, 'customers') && { to: '/shop/customers', label: 'Customers' },
    can(user, 'accounts') && { to: '/shop/accounts/cash', label: 'Cash book' },
    can(user, 'accounts') && { to: '/shop/accounts/daily', label: 'Daily closing' },
    can(user, 'expenses') && { to: '/shop/expenses', label: 'Add expense' },
    can(user, 'reports') && { to: '/shop/reports', label: 'Reports' },
  ].filter(Boolean);

  // Professional Color Palette
  const colors = {
    primary: '#0a7e5c',
    primaryLight: 'rgba(10, 126, 92, 0.15)',
    secondary: '#b0892e',
    secondaryLight: 'rgba(176, 137, 46, 0.15)',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    red: '#ef4444',
    green: '#22c55e',
    orange: '#f59e0b',
    pink: '#ec4899',
    teal: '#14b8a6',
  };

  // ===== USE ORIGINAL DATA FROM API =====
  const monthLabels = charts?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const salesData = charts?.sales || [];
  const profitData = charts?.profit || [];
  const expensesData = charts?.expenses || [];

  // ===== GRAPH 1: AREA CHART - Revenue & Profit Trend =====
  const areaChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Revenue',
        data: salesData,
        borderColor: colors.primary,
        backgroundColor: (context) => {
          const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 280);
          gradient.addColorStop(0, 'rgba(10, 126, 92, 0.35)');
          gradient.addColorStop(0.5, 'rgba(10, 126, 92, 0.12)');
          gradient.addColorStop(1, 'rgba(10, 126, 92, 0.01)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 8,
        borderWidth: 3,
      },
      {
        label: 'Profit',
        data: profitData,
        borderColor: colors.secondary,
        backgroundColor: (context) => {
          const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 280);
          gradient.addColorStop(0, 'rgba(176, 137, 46, 0.25)');
          gradient.addColorStop(0.5, 'rgba(176, 137, 46, 0.08)');
          gradient.addColorStop(1, 'rgba(176, 137, 46, 0.01)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.secondary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 8,
        borderWidth: 3,
      },
    ],
  };

  // ===== GRAPH 2: STACKED BAR - Monthly Breakdown =====
  const stackedBarData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Revenue',
        data: salesData,
        backgroundColor: colors.primary,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: expensesData,
        backgroundColor: colors.red,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Profit',
        data: profitData,
        backgroundColor: colors.secondary,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // ===== GRAPH 3: DOUGHNUT - Top Products =====
  const doughnutData = {
    labels: topSelling?.map(t => t.name) || ['No Data'],
    datasets: [
      {
        data: topSelling?.map(t => t.qty) || [1],
        backgroundColor: topSelling?.length > 0 
          ? [
              colors.primary,
              colors.secondary,
              colors.blue,
              colors.purple,
              colors.pink,
              colors.orange,
              colors.teal,
            ]
          : [colors.primary],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 15,
      },
    ],
  };

  // ===== GRAPH 4: POLAR AREA - Financial Distribution =====
  const polarData = {
    labels: ['Revenue', 'Profit', 'Expenses', 'Purchases', 'Other'],
    datasets: [
      {
        data: [
          stats?.monthSales || 0,
          stats?.profit || 0,
          stats?.expensesTotal || 0,
          stats?.monthPurchase || 0,
          stats?.otherIncome || 0,
        ],
        backgroundColor: [
          colors.primary,
          colors.secondary,
          colors.red,
          colors.blue,
          colors.purple,
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  // ===== CHART OPTIONS =====
  const areaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '600' },
          color: '#1a1a1a',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 14,
        cornerRadius: 10,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': PKR ' + context.parsed.y.toLocaleString();
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(value) {
            return 'PKR ' + (value / 1000).toFixed(0) + 'k';
          },
          color: '#4a4a4a',
          font: { size: 11 },
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#4a4a4a', font: { size: 11 } },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const stackedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '600' },
          color: '#1a1a1a',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 14,
        cornerRadius: 10,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': PKR ' + context.parsed.y.toLocaleString();
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(value) {
            return 'PKR ' + (value / 1000).toFixed(0) + 'k';
          },
          color: '#4a4a4a',
          font: { size: 11 },
        },
      },
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#4a4a4a', font: { size: 11 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11, weight: '500' },
          color: '#1a1a1a',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 14,
        cornerRadius: 10,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            if (total === 0) return context.label + ': 0';
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return context.label + ': ' + context.parsed + ' units (' + percentage + '%)';
          }
        }
      },
    },
    cutout: '70%',
  };

  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11, weight: '500' },
          color: '#1a1a1a',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 14,
        cornerRadius: 10,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            if (total === 0) return context.label + ': 0';
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return context.label + ': PKR ' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
          }
        }
      },
    },
    scale: {
      ticks: {
        backdropColor: 'transparent',
        color: '#4a4a4a',
        font: { size: 10 },
      },
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
    },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Business overview</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            {shop?.name} · {today} · Welcome, {user?.displayName || user?.username || 'Owner'}
          </p>
          {plan && (
            <div className="tenant-pill">
              <span className="badge gold">{plan.name}</span>
              <span className="badge">{user?.shopRole || 'owner'}</span>
              {plan.hasPos ? (
                <span className="badge">POS ready</span>
              ) : (
                <span className="badge warn">POS locked — ask Super Admin</span>
              )}
            </div>
          )}
        </div>
        <span className="badge">{shop?.status}</span>
      </div>

      {announcements.map((a) => (
        <div className="announce" key={a._id}>
          <strong>{a.title}</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.msg}</div>
        </div>
      ))}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.65rem', fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
          Quick actions
        </h3>
        <div className="row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          {quick.map((q) => (
            <Link
              key={q.to + q.label}
              className={`btn btn-sm ${q.primary ? 'btn-primary' : 'btn-outline'}`}
              to={q.to}
            >
              {q.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="page-sub" style={{ marginBottom: '0.5rem' }}>
        Today
      </p>
      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Today sales</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats?.todaySales ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Today purchases</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats?.todayPurchase ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Today profit</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats?.todayNetProfit ?? stats?.todayProfit ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Expenses today</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats?.expensesToday ?? 0)}</h2>
        </div>
      </div>

      <p className="page-sub" style={{ marginBottom: '0.5rem' }}>
        Balances
      </p>
      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Cash in hand</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats?.cashBalance ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Bank balance</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats?.bankBalance ?? 0)}</h2>
        </div>
        <div className="card stat warn">
          <h6>Customer due</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats?.customerDue ?? 0)}</h2>
        </div>
        <div className="card stat danger">
          <h6>Supplier due</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats?.supplierDue ?? 0)}</h2>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Monthly sales</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats?.monthSales ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Pending holds</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{stats?.pendingOrders ?? 0}</h2>
        </div>
        <div className="card stat warn">
          <h6>Low / Out / Expiring</h6>
          <h2 style={{ fontSize: '1.05rem' }}>
            {stats?.low ?? 0}/{stats?.out ?? 0}/{stats?.expiring ?? 0}
          </h2>
          {can(user, 'stock') && (stats?.low > 0 || stats?.out > 0) && (
            <Link className="btn btn-outline btn-sm" to="/shop/stock" style={{ marginTop: '0.5rem' }}>
              Review stock
            </Link>
          )}
        </div>
        <div className="card stat">
          <h6>Gross profit (all)</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats?.profit ?? 0)}</h2>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--display)', fontSize: '1.05rem' }}>Daily closing</h3>
            <p className="page-sub" style={{ margin: '0.25rem 0 0' }}>
              Net today {money((stats?.todaySales ?? 0) - (stats?.expensesToday ?? 0))}
            </p>
          </div>
          {can(user, 'accounts') && (
            <Link className="btn btn-outline btn-sm" to="/shop/accounts/daily">
              Open daily closing
            </Link>
          )}
        </div>
      </div>

      {/* ===== 4 BEAUTIFUL GRAPHS - ORIGINAL DATA ===== */}

      {/* Row 1: Area Chart + Stacked Bar */}
      <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.1rem', color: '#1a1a1a' }}>
            📈 Revenue & Profit Trend
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Monthly revenue and profit with area visualization
          </p>
          <div style={{ height: '290px', position: 'relative' }}>
            {salesData.length > 0 ? (
              <Line data={areaChartData} options={areaOptions} />
            ) : (
              <p className="empty" style={{ textAlign: 'center', paddingTop: '100px' }}>No data available</p>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.1rem', color: '#1a1a1a' }}>
            📊 Financial Breakdown
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Revenue, expenses, and profit distribution
          </p>
          <div style={{ height: '290px', position: 'relative' }}>
            {salesData.length > 0 ? (
              <Bar data={stackedBarData} options={stackedOptions} />
            ) : (
              <p className="empty" style={{ textAlign: 'center', paddingTop: '100px' }}>No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Doughnut + Polar Area */}
      <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.1rem', color: '#1a1a1a' }}>
            🍩 Top Selling Products
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Best performing products by quantity
          </p>
          <div style={{ height: '290px', position: 'relative' }}>
            {topSelling?.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <p className="empty" style={{ textAlign: 'center', paddingTop: '100px' }}>No product data available</p>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.1rem', color: '#1a1a1a' }}>
            🔄 Financial Distribution
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Overall financial breakdown by category
          </p>
          <div style={{ height: '290px', position: 'relative' }}>
            {stats?.monthSales > 0 ? (
              <PolarArea data={polarData} options={polarOptions} />
            ) : (
              <p className="empty" style={{ textAlign: 'center', paddingTop: '100px' }}>No financial data available</p>
            )}
          </div>
        </div>
      </div>

      {/* ===== RECENT ACTIVITIES ===== */}
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)', fontSize: '1.05rem', color: '#1a1a1a' }}>
            Recent invoices
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {!recentOrders?.length && (
                  <tr>
                    <td colSpan={3} className="empty">
                      No sales yet
                    </td>
                  </tr>
                )}
                {recentOrders?.map((s) => (
                  <tr key={s._id}>
                    <td>{s.invoice}</td>
                    <td>{s.customerName}</td>
                    <td>{money(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)', fontSize: '1.05rem', color: '#1a1a1a' }}>
            Top selling
          </h3>
          {!topSelling?.length && <p className="empty">No data yet</p>}
          <ul style={{ listStyle: 'none' }}>
            {topSelling?.map((t) => (
              <li
                key={t.productId}
                className="row"
                style={{
                  justifyContent: 'space-between',
                  padding: '0.4rem 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span style={{ color: '#1a1a1a' }}>{t.name}</span>
                <strong style={{ color: '#1a1a1a' }}>{t.qty}</strong>
              </li>
            ))}
          </ul>
          {recentPurchases?.length > 0 && (
            <>
              <h3 style={{ margin: '1rem 0 0.5rem', fontFamily: 'var(--display)', fontSize: '1.05rem', color: '#1a1a1a' }}>
                Recent purchases
              </h3>
              {recentPurchases.map((p) => (
                <div key={p._id} className="cart-item">
                  <span>
                    {p.purchaseNo} · {p.supplierName}
                  </span>
                  <strong>{money(p.total)}</strong>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}