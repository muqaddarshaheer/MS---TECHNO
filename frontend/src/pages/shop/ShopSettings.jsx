import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { money } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';

export default function ShopSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');

  async function load() {
    const [s, a] = await Promise.all([
      api.get('/shop-settings'),
      can(user, 'audit') ? api.get('/shop-settings/audit') : Promise.resolve({ data: { logs: [] } }),
    ]);
    setForm(s.data.settings);
    setLogs(a.data.logs || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
  }, []);

  async function save(e) {
    e.preventDefault();
    if (!window.confirm('Save shop settings?')) return;
    setBusy(true);
    setError('');
    try {
      await api.patch('/shop-settings', { ...form, reason: reason || 'Shop profile updated' });
      setMessage('Settings saved');
      setReason('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  if (!form) return <p className="empty">Loading settings...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Shop settings</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Your shop profile, invoice text, and business hours. Super Admin still controls plan & access.
          </p>
        </div>
        <Link className="btn btn-outline btn-sm" to="/shop/password">
          Change password
        </Link>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="card" style={{ marginBottom: '1rem', maxWidth: 640 }}>
        <form onSubmit={save}>
          <div className="grid grid-2">
            {[
              ['name', 'Shop name'],
              ['owner', 'Owner name'],
              ['phone', 'Phone'],
              ['email', 'Email'],
              ['address', 'Address'],
              ['logoUrl', 'Logo URL'],
              ['currency', 'Currency'],
              ['openTime', 'Open time'],
              ['closeTime', 'Close time'],
            ].map(([key, label]) => (
              <div className="field" key={key}>
                <label>{label}</label>
                <input
                  value={form[key] || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={key === 'name'}
                />
              </div>
            ))}
            <div className="field">
              <label>Default tax %</label>
              <input
                type="number"
                min="0"
                value={form.defaultTaxPct ?? 0}
                onChange={(e) => setForm({ ...form, defaultTaxPct: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>Invoice footer</label>
            <textarea
              rows={2}
              value={form.invoiceFooter || ''}
              onChange={(e) => setForm({ ...form, invoiceFooter: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Reason (for audit log)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Updated phone number"
            />
          </div>
          <p className="page-sub">
            Plan: <strong>{form.package}</strong>
            {form.plan?.hasPos ? ' · POS on' : ' · POS locked'} · Expiry{' '}
            {String(form.expiry).slice(0, 10)}
          </p>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving...' : 'Save settings'}
          </button>
        </form>
      </div>

      {can(user, 'audit') && (
        <div className="card table-wrap">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Recent activity (audit)</h3>
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>User</th>
                <th>Action</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {!logs.length && (
                <tr>
                  <td colSpan={4} className="empty">
                    No audit entries yet
                  </td>
                </tr>
              )}
              {logs.map((l) => (
                <tr key={l._id}>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                  <td>{l.username || '—'}</td>
                  <td>{l.action}</td>
                  <td>{l.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
