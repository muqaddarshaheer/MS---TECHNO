import { useEffect, useState } from 'react';
import api from '../../api';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function TenantRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [busyId, setBusyId] = useState('');

  async function load() {
    const { data } = await api.get('/tenants/signup-requests', {
      params: filter ? { status: filter } : undefined,
    });
    setRequests(data.requests || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, [filter]);

  async function approve(id) {
    setError('');
    setBusyId(id);
    try {
      const { data } = await api.post(`/tenants/signup-requests/${id}/approve`, {});
      setCredentials(data.credentials);
      setMessage(`Approved ${data.shop?.name}. Share login credentials once.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Approve failed');
    } finally {
      setBusyId('');
    }
  }

  async function reject(id) {
    if (!confirm('Reject this signup request?')) return;
    setBusyId(id);
    try {
      await api.post(`/tenants/signup-requests/${id}/reject`, { notes: 'Rejected by admin' });
      setMessage('Request rejected');
      await load();
    } finally {
      setBusyId('');
    }
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div>
      <h2 className="page-title">Demo & signup requests</h2>
      <p className="page-sub">
        Requests from the landing page create pending items here. Approve to provision a shop tenant.
      </p>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      {credentials && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <strong>New tenant login (copy once)</strong>
          <p>
            Username: <code>{credentials.username}</code>
          </p>
          <p>
            Password: <code>{credentials.password}</code>
          </p>
          {credentials.loginLink && (
            <p>
              Link: <code>{credentials.loginLink}</code>
            </p>
          )}
          <div className="row">
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={async () => {
                const ok = await copyText(credentials.loginLink || '');
                setMessage(ok ? 'Shop link copied' : 'Copy failed');
              }}
            >
              Copy shop link
            </button>
            <button
              className="btn btn-outline btn-sm"
              type="button"
              onClick={async () => {
                const ok = await copyText(
                  `Username: ${credentials.username}\nPassword: ${credentials.password}\nLink: ${credentials.loginLink}`
                );
                setMessage(ok ? 'Credentials copied' : 'Copy failed');
              }}
            >
              Copy all
            </button>
            <button className="btn btn-outline btn-sm" type="button" onClick={() => setCredentials(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="row" style={{ marginBottom: '0.85rem' }}>
        {['pending', 'approved', 'rejected', ''].map((f) => (
          <button
            key={f || 'all'}
            type="button"
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f || 'all'}
            {f === 'pending' ? ` (${pendingCount || '…'})` : ''}
          </button>
        ))}
      </div>

      <div className="grid grid-2">
        {requests.length === 0 && <p className="empty">No requests in this filter</p>}
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
                <button
                  className="btn btn-primary btn-sm"
                  disabled={busyId === r._id}
                  onClick={() => approve(r._id)}
                >
                  {busyId === r._id ? 'Working...' : 'Approve tenant'}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={busyId === r._id}
                  onClick={() => reject(r._id)}
                >
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
