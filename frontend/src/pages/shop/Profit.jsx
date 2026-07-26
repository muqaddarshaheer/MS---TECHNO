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
import api, { money } from '../../api';

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

export default function Profit() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/sales/dashboard'),
      api.get('/sales/charts')
    ])
      .then(([dash, charts]) => {
        setStats(dash.data.stats);
        setChartData(charts.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="empty">Loading...</p>;
  if (!stats) return <p className="empty">No data available</p>;

  // Colors
  const colors = {
    primary: '#0a7e5c',
    primaryLight: 'rgba(10, 126, 92, 0.15)',
    secondary: '#b0892e',
    secondaryLight: 'rgba(176, 137, 46, 0.15)',
    red: '#ef4444',
    redLight: 'rgba(239, 68, 68, 0.15)',
    blue: '#3b82f6',
    blueLight: 'rgba(59, 130, 246, 0.15)',
    purple: '#8b5cf6',
    purpleLight: 'rgba(139, 92, 246, 0.15)',
    green: '#22c55e',
    greenLight: 'rgba(34, 197, 94, 0.15)',
    orange: '#f59e0b',
    orangeLight: 'rgba(245, 158, 11, 0.15)',
  };

  // Monthly data
  const months = chartData?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const profitData = chartData?.profit || [5000, 8000, 6000, 12000, 10000, 15000, 14000, 18000, 20000, 19000, 22000, 25000];
  const revenueData = chartData?.revenue || [15000, 22000, 18000, 28000, 25000, 35000, 32000, 40000, 45000, 42000, 48000, 50000];
  const expensesData = chartData?.expenses || [10000, 14000, 12000, 16000, 15000, 20000, 18000, 22000, 25000, 23000, 26000, 25000];
  const profitMarginData = chartData?.profitMargin || [33, 36, 33, 43, 40, 43, 44, 45, 44, 45, 46, 50];

  // ===== GRAPH 1: Profit Trend (Line Chart) =====
  const profitTrendData = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Profit',
        data: profitData,
        borderColor: colors.primary,
        backgroundColor: (context) => {
          const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 280);
          gradient.addColorStop(0, 'rgba(10, 126, 92, 0.3)');
          gradient.addColorStop(1, 'rgba(10, 126, 92, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
      }
    ],
  };

  // ===== GRAPH 2: Revenue vs Expenses (Bar Chart) =====
  const revenueExpensesData = {
    labels: months,
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
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
    ],
  };

  // ===== GRAPH 3: Profit Distribution (Doughnut Chart) =====
  const profitDistributionData = {
    labels: ['Revenue', 'Profit', 'Expenses'],
    datasets: [
      {
        data: [
          stats.revenue || 0,
          stats.profit || 0,
          stats.expenses || 0,
        ],
        backgroundColor: [
          colors.primary,
          colors.secondary,
          colors.red,
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  // ===== GRAPH 4: Profit Margin (Polar Area Chart) =====
  const profitMarginChartData = {
    labels: months.slice(0, 6),
    datasets: [
      {
        data: profitMarginData.slice(0, 6),
        backgroundColor: [
          colors.primary,
          colors.secondary,
          colors.blue,
          colors.purple,
          colors.green,
          colors.orange,
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

  const barOptions = {
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
          font: { size: 12, weight: '500' },
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
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return context.label + ': PKR ' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
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
            return context.label + ': ' + context.parsed + '%';
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
    <div style={{ padding: '0.5rem 0' }}>
      <h2 style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', marginBottom: '0.2rem', fontSize: '1.5rem' }}>
        Profit Overview
      </h2>
      <p style={{ color: '#666666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Visualize your profit, revenue, and expenses
      </p>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid rgba(0,0,0,0.06)', 
          borderRadius: '12px', 
          padding: '1rem',
          borderLeft: '4px solid #0a7e5c',
          transition: 'all 0.3s ease'
        }}>
          <h6 style={{ color: '#666666', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Total Profit</h6>
          <h2 style={{ fontSize: '1.2rem', color: '#0a7e5c', fontFamily: 'Georgia, serif', margin: 0 }}>{money(stats.profit)}</h2>
        </div>
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid rgba(0,0,0,0.06)', 
          borderRadius: '12px', 
          padding: '1rem',
          borderLeft: '4px solid #3b82f6',
          transition: 'all 0.3s ease'
        }}>
          <h6 style={{ color: '#666666', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Total Revenue</h6>
          <h2 style={{ fontSize: '1.2rem', color: '#3b82f6', fontFamily: 'Georgia, serif', margin: 0 }}>{money(stats.revenue)}</h2>
        </div>
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid rgba(0,0,0,0.06)', 
          borderRadius: '12px', 
          padding: '1rem',
          borderLeft: '4px solid #ef4444',
          transition: 'all 0.3s ease'
        }}>
          <h6 style={{ color: '#666666', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Total Expenses</h6>
          <h2 style={{ fontSize: '1.2rem', color: '#ef4444', fontFamily: 'Georgia, serif', margin: 0 }}>{money(stats.expenses)}</h2>
        </div>
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid rgba(0,0,0,0.06)', 
          borderRadius: '12px', 
          padding: '1rem',
          borderLeft: '4px solid #b0892e',
          transition: 'all 0.3s ease'
        }}>
          <h6 style={{ color: '#666666', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Net Profit</h6>
          <h2 style={{ fontSize: '1.2rem', color: '#b0892e', fontFamily: 'Georgia, serif', margin: 0 }}>{money(stats.net)}</h2>
        </div>
      </div>

      {/* ===== 4 GRAPHS ===== */}
      
      {/* Row 1: Profit Trend + Revenue vs Expenses */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid rgba(0,0,0,0.06)', 
          borderRadius: '12px', 
          padding: '1.25rem',
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'Georgia, serif', fontSize: '1.05rem', color: '#1a1a1a' }}>
            📈 Profit Trend
          </h3>
          <p style={{ color: '#666666', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Monthly profit performance
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            <Line data={profitTrendData} options={lineOptions} />
          </div>
        </div>

        <div style={{ 
          background: '#ffffff', 
          border: '1px solid rgba(0,0,0,0.06)', 
          borderRadius: '12px', 
          padding: '1.25rem',
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'Georgia, serif', fontSize: '1.05rem', color: '#1a1a1a' }}>
            📊 Revenue vs Expenses
          </h3>
          <p style={{ color: '#666666', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Monthly revenue and expense comparison
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            <Bar data={revenueExpensesData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Row 2: Profit Distribution + Profit Margin */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid rgba(0,0,0,0.06)', 
          borderRadius: '12px', 
          padding: '1.25rem',
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'Georgia, serif', fontSize: '1.05rem', color: '#1a1a1a' }}>
            🍩 Profit Distribution
          </h3>
          <p style={{ color: '#666666', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Revenue, profit, and expenses breakdown
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            <Doughnut data={profitDistributionData} options={doughnutOptions} />
          </div>
        </div>

        <div style={{ 
          background: '#ffffff', 
          border: '1px solid rgba(0,0,0,0.06)', 
          borderRadius: '12px', 
          padding: '1.25rem',
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ marginBottom: '0.5rem', fontFamily: 'Georgia, serif', fontSize: '1.05rem', color: '#1a1a1a' }}>
            🎯 Profit Margin
          </h3>
          <p style={{ color: '#666666', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            Monthly profit margin percentage
          </p>
          <div style={{ height: '280px', position: 'relative' }}>
            <PolarArea data={profitMarginChartData} options={polarOptions} />
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          .profit-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .profit-grid-4 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .profit-grid-4 {
            grid-template-columns: 1fr !important;
          }
          .profit-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}