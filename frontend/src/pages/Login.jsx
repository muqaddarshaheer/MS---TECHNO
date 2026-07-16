import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState(() => searchParams.get('u') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const u = searchParams.get('u');
    if (u) setUsername(u);
  }, [searchParams]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(username.trim(), password);
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
          Cloud Retail ERP — enter your username and password
        </p>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Your shop username"
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
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="page-sub" style={{ textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>
          Need access? <Link to="/signup">Request a demo account</Link>
        </p>
      </div>
    </div>
  );
}
