import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { money } from '../../api';

function statusBadge(status) {
  if (status === 'active') return '';
  if (status === 'expired' || status === 'payment_overdue') return 'danger';
  return 'warn';
}

function statusLabel(status) {
  if (status === 'payment_overdue') return 'Payment overdue';
  return status;
}

export default function SuperHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/shops/stats').then((st) => setStats(st.data));
  }, []);

  if (!stats) return <p className="empty">Loading...</p>;

  return (
    <div>
      <h2 className="page-title">MS Techno Control Center</h2>
      <p className="page-sub">Shops, packages, demo requests, and platform analytics</p>

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Total shops</h6>
          <h2>{stats.total}</h2>
        </div>
        <div className="card stat">
          <h6>Active shops</h6>
          <h2 style={{ color: 'var(--ok)' }}>{stats.active}</h2>
        </div>
        <div className="card stat warn">
          <h6>Pending demos</h6>
          <h2>{stats.pendingDemoRequests ?? 0}</h2>
        </div>
        <div className="card stat danger">
          <h6>Blocked / overdue</h6>
          <h2>
            {stats.blocked}/{stats.paymentOverdue ?? 0}
          </h2>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Platform sales</h6>
          <h2 style={{ fontSize: '1.15rem' }}>{stats.salesCount ?? 0}</h2>
        </div>
        <div className="card stat">
          <h6>Total revenue</h6>
          <h2 style={{ fontSize: '1.05rem' }}>{money(stats.revenue || 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Total profit</h6>
          <h2 style={{ fontSize: '1.05rem' }}>{money(stats.profit || 0)}</h2>
        </div>
        <div className="card stat">
          <h6>Stock / customers</h6>
          <h2 style={{ fontSize: '1.05rem' }}>
            {stats.stockQty ?? 0} / {stats.customers ?? 0}
          </h2>
        </div>
      </div>

      <div className="row" style={{ marginBottom: '0.85rem' }}>
        <Link className="btn btn-gold" to="/super/shops">
          Manage shops
        </Link>
        <Link className="btn btn-primary" to="/super/requests">
          Demo requests ({stats.pendingDemoRequests ?? 0})
        </Link>
        <Link className="btn btn-outline" to="/super/announcements">
          Announcements
        </Link>
      </div>

      <div className="card table-wrap">
        <h3 style={{ fontFamily: 'var(--display)', marginBottom: '0.75rem' }}>Recent shops</h3>
        <table>
          <thead>
            <tr>
              <th>Shop</th>
              <th>Package</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {(stats.recentShops || []).map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.name}</strong>
                </td>
                <td>{s.package}</td>
                <td>
                  <span className={`badge ${statusBadge(s.status)}`}>{statusLabel(s.status)}</span>
                </td>
                <td>{s.createdAt ? String(s.createdAt).slice(0, 10) : '—'}</td>
              </tr>
            ))}
            {!(stats.recentShops || []).length && (
              <tr>
                <td colSpan={4} className="empty">
                  No shops yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
