import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setOk('');
    if (newPassword !== confirm) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      setOk('Password updated successfully');
      setCurrent('');
      setNew('');
      setConfirm('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update password');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="page-title">Change Password</h2>
      <p className="page-sub">Update your account password. You will stay signed in.</p>
      <div className="card" style={{ maxWidth: 420 }}>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          {ok && <div className="success">{ok}</div>}
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
