import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('shop');
  const [shops, setShops] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get('/auth/login-shops')
      .then((res) => setShops(res.data.shops || []))
      .catch(() => setShops([]));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(username, password);
      navigate(user.role === 'super' ? '/super' : '/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>
          MS <span>TECHNO</span>
        </h1>
        <p className="page-sub" style={{ textAlign: 'center' }}>
          Cloud Perfume Management
        </p>

        <div className="tabs">
          <button
            type="button"
            className={`tab ${tab === 'shop' ? 'active' : ''}`}
            onClick={() => {
              setTab('shop');
              setUsername('');
              setPassword('');
              setShowPassword(false);
              setError('');
            }}
          >
            Shop
          </button>
          <button
            type="button"
            className={`tab ${tab === 'super' ? 'active' : ''}`}
            onClick={() => {
              setTab('super');
              setUsername('admin');
              setPassword('');
              setShowPassword(false);
              setError('');
            }}
          >
            Super Admin
          </button>
        </div>

        <form onSubmit={onSubmit}>
          {tab === 'shop' ? (
            <div className="field">
              <label>Shop</label>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              >
                <option value="">Select your shop</option>
                {shops.map((s) => (
                  <option key={s.username} value={s.username}>
                    {s.name} ({s.username})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="field">
              <label>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          )}

          <div className="field">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Signing in...' : tab === 'super' ? 'Enter Super Panel' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
