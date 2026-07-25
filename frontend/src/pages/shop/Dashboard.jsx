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
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
  ArcElement
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

  // Chart Colors
  const colors = {
    primary: '#0f5c4c',
    primaryLight: 'rgba(15, 92, 76, 0.1)',
    secondary: '#b0892e',
    secondaryLight: 'rgba(176, 137, 46, 0.1)',
    blue: '#4f7eb3',
    blueLight: 'rgba(79, 126, 179, 0.1)',
    purple: '#8b5cf6',
    purpleLight: 'rgba(139, 92, 246, 0.1)',
    red: '#ef4444',
    redLight: 'rgba(239, 68, 68, 0.1)',
    green: '#22c55e',
    greenLight: 'rgba(34, 197, 94, 0.1)',
    orange: '#f59e0b',
    orangeLight: 'rgba(245, 158, 11, 0.1)',
  };

  // Sales Chart Data
  const salesChartData = {
    labels: charts.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales Revenue',
        data: charts.sales || [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 40000, 38000, 42000, 45000],
        borderColor: colors.primary,
        backgroundColor: (context) => {
          const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(15, 92, 76, 0.3)');
          gradient.addColorStop(1, 'rgba(15, 92, 76, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: 'Expenses',
        data: charts.expenses || [5000, 8000, 6000, 10000, 9000, 12000, 11000, 14000, 16000, 15000, 17000, 18000],
        borderColor: colors.red,
        backgroundColor: (context) => {
          const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.red,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  // Profit Chart Data
  const profitChartData = {
    labels: charts.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Net Profit',
        data: charts.profit || [7000, 11000, 9000, 15000, 13000, 18000, 17000, 21000, 24000, 23000, 25000, 27000],
        backgroundColor: [
          colors.primary,
          colors.secondary,
          colors.blue,
          colors.purple,
          colors.green,
          colors.orange,
          colors.primary,
          colors.secondary,
          colors.blue,
          colors.purple,
          colors.green,
          colors.orange,
        ],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  // Monthly Comparison Chart
  const comparisonData = {
    labels: charts.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'This Year',
        data: charts.sales || [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 40000, 38000, 42000, 45000],
        backgroundColor: 'rgba(15, 92, 76, 0.7)',
        borderColor: colors.primary,
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Last Year',
        data: charts.lastYearSales || [10000, 16000, 12000, 20000, 18000, 25000, 23000, 28000, 32000, 30000, 35000, 38000],
        backgroundColor: 'rgba(176, 137, 46, 0.6)',
        borderColor: colors.secondary,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  // Top Products Doughnut Chart
  const doughnutData = {
    labels: topSelling?.map(t => t.name) || ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    datasets: [
      {
        data: topSelling?.map(t => t.qty) || [30, 25, 20, 15, 10],
        backgroundColor: [
          colors.primary,
          colors.secondary,
          colors.blue,
          colors.purple,
          colors.green,
          colors.orange,
          colors.red,
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  // Chart Options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return 'PKR ' + context.parsed.y.toLocaleString();
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return 'PKR ' + value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return 'PKR ' + context.parsed.y.toLocaleString();
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return 'PKR ' + value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
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
          font: {
            size: 11,
            weight: '500',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
          }
        }
      },
    },
    cutout: '70%',
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
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{a.msg}</div>
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
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.todaySales ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Today purchases</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.todayPurchase ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Today profit</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.todayNetProfit ?? stats.todayProfit ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Expenses today</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.expensesToday ?? 0)}</h2>
        </div>
      </div>

      <p className="page-sub" style={{ marginBottom: '0.5rem' }}>
        Balances
      </p>
      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Cash in hand</h6>
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

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Monthly sales</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.monthSales ?? 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Pending holds</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{stats.pendingOrders ?? 0}</h2>
        </div>
        <div className="card stat warn">
          <h6>Low / Out / Expiring</h6>
          <h2 style={{ fontSize: '1.05rem' }}>
            {stats.low}/{stats.out}/{stats.expiring ?? 0}
          </h2>
          {can(user, 'stock') && (stats.low > 0 || stats.out > 0) && (
            <Link className="btn btn-outline btn-sm" to="/shop/stock" style={{ marginTop: '0.5rem' }}>
              Review stock
            </Link>
          )}
        </div>
        <div className="card stat">
          <h6>Gross profit (all)</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{money(stats.profit)}</h2>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--display)', fontSize: '1.05rem' }}>Daily closing</h3>
            <p className="page-sub" style={{ margin: '0.25rem 0 0' }}>
              Net today {money((stats.todaySales ?? 0) - (stats.expensesToday ?? 0))}
            </p>
          </div>
          {can(user, 'accounts') && (
            <Link className="btn btn-outline btn-sm" to="/shop/accounts/daily">
              Open daily closing
            </Link>
          )}
        </div>
      </div>

      {/* ===== GRAPHS SECTION ===== */}
      <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
            📈 Sales & Expenses Trend
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Monthly revenue and expense comparison
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            <Line data={salesChartData} options={lineOptions} />
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
            📊 Monthly Profit
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Net profit breakdown by month
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            <Bar data={profitChartData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* ===== COMPARISON & DOUGHNUT ===== */}
      <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
            📉 Year-over-Year Comparison
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            This year vs last year performance
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            <Bar data={comparisonData} options={barOptions} />
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
            🍩 Top Selling Products
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Best performing products by quantity
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            {topSelling?.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <p className="empty" style={{ textAlign: 'center', paddingTop: '80px' }}>
                No product data available yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ===== RECENT ACTIVITIES ===== */}
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Recent invoices</h3>
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
          <h3 style={{ marginBottom: '0.75rem', fontFamily: 'var(--display)' }}>Top selling</h3>
          {!topSelling?.length && <p className="empty">No data yet</p>}
          <ul style={{ listStyle: 'none' }}>
            {topSelling?.map((t) => (
              <li
                key={t.productId}
                className="row"
                style={{
                  justifyContent: 'space-between',
                  padding: '0.4rem 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span>{t.name}</span>
                <strong>{t.qty}</strong>
              </li>
            ))}
          </ul>
          {recentPurchases?.length > 0 && (
            <>
              <h3 style={{ margin: '1rem 0 0.5rem', fontFamily: 'var(--display)' }}>
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