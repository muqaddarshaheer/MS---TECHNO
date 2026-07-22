import { useEffect, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Staff() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [limits, setLimits] = useState({ maxUsers: 1, used: 0 });
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [shopRole, setShopRole] = useState('cashier');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await api.get('/staff');
    setUsers(data.users || []);
    setLimits(data.limits || { maxUsers: 1, used: 0 });
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load staff'));
  }, []);

  async function add(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await api.post('/staff', { displayName, username, password, shopRole });
      setDisplayName('');
      setUsername('');
      setPassword('');
      setShopRole('cashier');
      setMessage('Staff account created');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create');
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(u) {
    if (u.shopRole === 'owner') return;
    try {
      await api.patch(`/staff/${u.id}`, { isActive: !u.isActive });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  }

  async function remove(u) {
    if (u.shopRole === 'owner') return;
    if (!window.confirm(`Delete ${u.username}?`)) return;
    try {
      await api.delete(`/staff/${u.id}`);
      setMessage('Staff deleted');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  }

  const atLimit = limits.used >= limits.maxUsers;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Employees</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Owner · Manager · Cashier — {limits.used}/{limits.maxUsers} users on your plan
            {me?.shopRole ? ` · you are ${me.shopRole}` : ''}
          </p>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="card" style={{ marginBottom: '1rem', maxWidth: 560 }}>
        <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Add staff</h3>
        {atLimit && (
          <p className="empty">User limit reached. Upgrade plan to add more staff.</p>
        )}
        <form onSubmit={add}>
          <div className="field">
            <label>Display name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="field">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="field">
            <label>Role</label>
            <select value={shopRole} onChange={(e) => setShopRole(e.target.value)}>
              <option value="cashier">Cashier — POS, invoices, customers</option>
              <option value="manager">Manager — all except staff</option>
            </select>
          </div>
          <button className="btn btn-primary" disabled={busy || atLimit}>
            {busy ? 'Saving...' : 'Create login'}
          </button>
        </form>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.displayName || '—'}</td>
                <td>{u.username}</td>
                <td>{u.shopRole}</td>
                <td>{u.isActive ? 'Active' : 'Off'}</td>
                <td className="row">
                  {u.shopRole !== 'owner' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => toggleActive(u)}
                      >
                        {u.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(u)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
