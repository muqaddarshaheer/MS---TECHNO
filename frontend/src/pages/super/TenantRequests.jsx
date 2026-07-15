import { useEffect, useState } from 'react';
import api from '../../api';

export default function TenantRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState(null);

  async function load() {
    const { data } = await api.get('/tenants/signup-requests');
    setRequests(data.requests || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, []);

  async function approve(id) {
    setError('');
    try {
      const { data } = await api.post(`/tenants/signup-requests/${id}/approve`, {});
      setCredentials(data.credentials);
      setMessage(`Approved ${data.shop?.name}. Share login credentials with the business.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Approve failed');
    }
  }

  async function reject(id) {
    if (!confirm('Reject this signup request?')) return;
    await api.post(`/tenants/signup-requests/${id}/reject`, { notes: 'Rejected by admin' });
    setMessage('Request rejected');
    await load();
  }

  return (
    <div>
      <h2 className="page-title">Tenant signup requests</h2>
      <p className="page-sub">
        Businesses that requested access. Approve to create an isolated shop tenant.
      </p>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      {credentials && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <strong>New tenant login</strong>
          <p>
            Username: <code>{credentials.username}</code>
          </p>
          <p>
            Password: <code>{credentials.password}</code>
          </p>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Copy these once — the password is hashed and cannot be shown again.
          </p>
        </div>
      )}

      <div className="grid grid-2">
        {requests.length === 0 && <p className="empty">No signup requests yet</p>}
        {requests.map((r) => (
          <div className="card" key={r._id}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'var(--display)' }}>{r.businessName}</h3>
              <span
                className={`badge ${
                  r.status === 'approved' ? '' : r.status === 'rejected' ? 'danger' : 'warn'
                }`}
              >
                {r.status}
              </span>
            </div>
            <p className="page-sub" style={{ marginBottom: '0.35rem' }}>
              {r.ownerName} · {r.email} · {r.phone || 'no phone'}
            </p>
            <p>
              Package <strong>{r.package}</strong> · {r.durationMonths} months
            </p>
            {r.message && <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>{r.message}</p>}
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {new Date(r.createdAt).toLocaleString()}
            </p>
            {r.status === 'pending' && (
              <div className="row" style={{ marginTop: '0.75rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => approve(r._id)}>
                  Approve tenant
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => reject(r._id)}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
