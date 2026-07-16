import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const prefills = searchParams.get('u') || '';
  const [tab, setTab] = useState(prefills ? 'shop' : 'shop');
  const [username, setUsername] = useState(prefills);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const u = searchParams.get('u');
    if (u) {
      setTab('shop');
      setUsername(u);
    }
  }, [searchParams]);

  function switchTab(next) {
    setTab(next);
    setPassword('');
    setShowPassword(false);
    setError('');
    if (next === 'super') {
      setUsername((u) => (u && u !== prefills ? u : 'admin'));
    } else if (!prefills) {
      setUsername('');
    } else {
      setUsername(prefills);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(username.trim(), password);
      if (tab === 'super' && user.role !== 'super') {
        setError('This account is not a Super Admin. Use the Shop tab.');
        setBusy(false);
        return;
      }
      if (tab === 'shop' && user.role === 'super') {
        setError('Use the Super Admin tab for this account.');
        setBusy(false);
        return;
      }
      window.location.assign(user.role === 'super' ? '/super' : '/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="brand" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
          MS <span>TECHNO</span>
        </Link>
        <p className="page-sub" style={{ textAlign: 'center' }}>
          Cloud Retail ERP
        </p>

        <div className="tabs">
          <button
            type="button"
            className={`tab ${tab === 'shop' ? 'active' : ''}`}
            onClick={() => switchTab('shop')}
          >
            Shop
          </button>
          <button
            type="button"
            className={`tab ${tab === 'super' ? 'active' : ''}`}
            onClick={() => switchTab('super')}
          >
            Super Admin
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder={tab === 'super' ? 'Super admin username' : 'Shop username'}
              autoFocus={!username}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                autoFocus={Boolean(username)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Signing in...' : tab === 'super' ? 'Enter Super Admin' : 'Enter shop dashboard'}
          </button>
        </form>

        <p className="page-sub" style={{ textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>
          Need a shop account? <Link to="/signup">Request a demo</Link>
        </p>
      </div>
    </div>
  );
}
