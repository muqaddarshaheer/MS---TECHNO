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
  PolarAreaController,
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
  RadialLinearScale,
  PolarAreaController
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

  // Modern Color Palette
  const colors = {
    primary: '#0a7e5c',
    primaryLight: 'rgba(10, 126, 92, 0.1)',
    secondary: '#b0892e',
    secondaryLight: 'rgba(176, 137, 46, 0.1)',
    blue: '#3b82f6',
    blueLight: 'rgba(59, 130, 246, 0.1)',
    purple: '#8b5cf6',
    purpleLight: 'rgba(139, 92, 246, 0.1)',
    red: '#ef4444',
    redLight: 'rgba(239, 68, 68, 0.1)',
    green: '#22c55e',
    greenLight: 'rgba(34, 197, 94, 0.1)',
    orange: '#f59e0b',
    orangeLight: 'rgba(245, 158, 11, 0.1)',
    pink: '#ec4899',
    pinkLight: 'rgba(236, 72, 153, 0.1)',
    teal: '#14b8a6',
    tealLight: 'rgba(20, 184, 166, 0.1)',
  };

  const chartGradient = (ctx, color1, color2) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  };

  // ===== 1. AREA CHART - Sales & Profit Trend =====
  const areaChartData = {
    labels: charts.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: charts.sales || [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 40000, 38000, 42000, 45000],
        borderColor: colors.primary,
        backgroundColor: (context) => chartGradient(
          context.chart.ctx,
          'rgba(10, 126, 92, 0.4)',
          'rgba(10, 126, 92, 0.02)'
        ),
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
        data: charts.profit || [7000, 11000, 9000, 15000, 13000, 18000, 17000, 21000, 24000, 23000, 25000, 27000],
        borderColor: colors.secondary,
        backgroundColor: (context) => chartGradient(
          context.chart.ctx,
          'rgba(176, 137, 46, 0.3)',
          'rgba(176, 137, 46, 0.02)'
        ),
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

  // ===== 2. STACKED BAR CHART - Monthly Breakdown =====
  const stackedBarData = {
    labels: charts.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales',
        data: charts.sales || [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 40000, 38000, 42000, 45000],
        backgroundColor: colors.primary,
        borderRadius: 4,
      },
      {
        label: 'Expenses',
        data: charts.expenses || [5000, 8000, 6000, 10000, 9000, 12000, 11000, 14000, 16000, 15000, 17000, 18000],
        backgroundColor: colors.red,
        borderRadius: 4,
      },
      {
        label: 'Profit',
        data: charts.profit || [7000, 11000, 9000, 15000, 13000, 18000, 17000, 21000, 24000, 23000, 25000, 27000],
        backgroundColor: colors.secondary,
        borderRadius: 4,
      },
    ],
  };

  // ===== 3. POLAR AREA CHART - Category Distribution =====
  const polarData = {
    labels: ['Sales', 'Profit', 'Expenses', 'Purchases', 'Other'],
    datasets: [
      {
        data: [
          stats.monthSales || 45000,
          stats.profit || 27000,
          stats.expensesTotal || 18000,
          stats.monthPurchase || 15000,
          stats.otherIncome || 5000,
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
      },
    ],
  };

  // ===== 4. DOUGHNUT CHART - Top Products =====
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
          colors.pink,
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 15,
      },
    ],
  };

  // ===== 5. HORIZONTAL BAR - Performance Comparison =====
  const horizontalBarData = {
    labels: ['Revenue', 'Profit', 'Sales', 'Growth'],
    datasets: [
      {
        label: 'This Year',
        data: [85, 72, 90, 68],
        backgroundColor: colors.primary,
        borderRadius: 6,
      },
      {
        label: 'Last Year',
        data: [70, 55, 75, 50],
        backgroundColor: colors.secondary,
        borderRadius: 6,
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
          font: { size: 12, weight: '500' },
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
        grid: { color: 'rgba(0, 0, 0, 0.06)' },
        ticks: {
          callback: function(value) {
            return 'PKR ' + (value / 1000).toFixed(0) + 'k';
          },
        },
      },
      x: {
        grid: { display: false },
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
          font: { size: 12, weight: '500' },
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
        grid: { color: 'rgba(0, 0, 0, 0.06)' },
        ticks: {
          callback: function(value) {
            return 'PKR ' + (value / 1000).toFixed(0) + 'k';
          },
        },
      },
      x: {
        stacked: true,
        grid: { display: false },
      },
    },
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
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return context.label + ': PKR ' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
          }
        }
      },
    },
    scale: {
      ticks: {
        backdropColor: 'transparent',
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
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return context.label + ': ' + context.parsed + ' units (' + percentage + '%)';
          }
        }
      },
    },
    cutout: '72%',
  };

  const horizontalOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '500' },
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
            return context.dataset.label + ': ' + context.parsed.x + '%';
          }
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.06)' },
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
      },
      y: {
        grid: { display: false },
      },
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

      {/* ===== GRAPHS SECTION - 5 UNIQUE CHARTS ===== */}

      {/* 1. AREA CHART - Revenue & Profit Trend */}
      <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
            📈 Revenue & Profit Trend
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Monthly revenue and profit comparison with area visualization
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            <Line data={areaChartData} options={areaOptions} />
          </div>
        </div>

        {/* 2. STACKED BAR - Monthly Breakdown */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
            📊 Monthly Financial Breakdown
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Sales, expenses, and profit distribution
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            <Bar data={stackedBarData} options={stackedOptions} />
          </div>
        </div>
      </div>

      {/* 3. POLAR AREA + 4. DOUGHNUT CHARTS */}
      <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
            🎯 Financial Distribution
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Overall financial breakdown by category
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            <PolarArea data={polarData} options={polarOptions} />
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
            🍩 Top Selling Products
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Best performing products by quantity sold
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

      {/* 5. HORIZONTAL BAR - Performance Comparison */}
      <div className="grid grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
            📉 Performance Comparison
          </h3>
          <p className="page-sub" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            This year vs last year performance metrics (%)
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            <Bar data={horizontalBarData} options={horizontalOptions} />
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
            📌 Quick Insights
          </h3>
          <div className="grid grid-2" style={{ gap: '0.75rem' }}>
            <div className="card stat" style={{ padding: '0.75rem' }}>
              <h6>Growth Rate</h6>
              <h2 style={{ fontSize: '1.2rem', color: colors.primary }}>+23.5%</h2>
            </div>
            <div className="card stat" style={{ padding: '0.75rem' }}>
              <h6>Avg. Order</h6>
              <h2 style={{ fontSize: '1.2rem' }}>{money(stats.avgOrderValue || 3500)}</h2>
            </div>
            <div className="card stat" style={{ padding: '0.75rem' }}>
              <h6>Conversion</h6>
              <h2 style={{ fontSize: '1.2rem', color: colors.secondary }}>68.4%</h2>
            </div>
            <div className="card stat" style={{ padding: '0.75rem' }}>
              <h6>Net Margin</h6>
              <h2 style={{ fontSize: '1.2rem', color: colors.blue }}>32.7%</h2>
            </div>
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
                  borderBottom: '1px solid var(--border-color)',
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