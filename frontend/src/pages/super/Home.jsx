import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

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
  const [shops, setShops] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/shops/stats'), api.get('/shops')]).then(([st, sh]) => {
      setStats(st.data);
      setShops(sh.data.shops || []);
    });
  }, []);

  if (!stats) return <p className="empty">Loading...</p>;

  return (
    <div>
      <h2 className="page-title">MS Techno Super Dashboard</h2>
      <p className="page-sub">Full control over shops, plans, and payments</p>
      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="card stat">
          <h6>Total</h6>
          <h2>{stats.total}</h2>
        </div>
        <div className="card stat">
          <h6>Active</h6>
          <h2 style={{ color: 'var(--ok)' }}>{stats.active}</h2>
        </div>
        <div className="card stat danger">
          <h6>Expired</h6>
          <h2>{stats.expired}</h2>
        </div>
        <div className="card stat warn">
          <h6>Payment overdue</h6>
          <h2>{stats.paymentOverdue ?? 0}</h2>
        </div>
      </div>
      <div className="row" style={{ marginBottom: '0.85rem' }}>
        <Link className="btn btn-gold" to="/super/shops">
          Manage shops
        </Link>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Shop</th>
              <th>Package</th>
              <th>Plan start</th>
              <th>Duration</th>
              <th>Package end</th>
              <th>Payment due</th>
              <th>Payment</th>
              <th>Restrict</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((s) => (
              <tr key={s._id}>
                <td>
                  <strong>{s.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{s.owner}</div>
                </td>
                <td>{s.package}</td>
                <td>{String(s.planStart || s.createdAt).slice(0, 10)}</td>
                <td>{s.durationLabel || '—'}</td>
                <td>{String(s.planEnd || s.expiry).slice(0, 10)}</td>
                <td>
                  {s.paymentDueDate ? String(s.paymentDueDate).slice(0, 10) : '—'}
                  {s.paymentOverdue && (
                    <div>
                      <span className="badge danger">Overdue</span>
                    </div>
                  )}
                </td>
                <td>
                  <span className={`badge ${s.payment === 'paid' ? '' : 'warn'}`}>{s.payment}</span>
                </td>
                <td>{s.restrictOnPaymentOverdue ? 'On' : 'Off'}</td>
                <td>
                  <span className={`badge ${statusBadge(s.computedStatus)}`}>
                    {statusLabel(s.computedStatus)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
