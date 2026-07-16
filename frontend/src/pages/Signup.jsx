import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';

export default function Signup() {
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    package: location.state?.package || 'Basic',
    durationMonths: 12,
    preferredUsername: '',
    message: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get('/tenants/plans').then((res) => setPlans(res.data.plans || []));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/tenants/signup-request', form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit request');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="saas-landing">
      <header className="saas-nav">
        <Link to="/" className="brand">
          MS <span>TECHNO</span>
        </Link>
        <Link className="btn btn-outline" to="/login">
          Login
        </Link>
      </header>

      <div className="signup-wrap">
        <div className="card signup-card">
          <h1 className="page-title">Request a free demo</h1>
          <p className="page-sub">
            Submit your business details. MS Techno reviews the request in Super Admin and
            activates your isolated shop with login credentials.
          </p>

          {done ? (
            <div className="success">
              Request received. We will contact you after approval. You can{' '}
              <Link to="/login">login</Link> once credentials are issued.
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="grid grid-2">
                <div className="field">
                  <label>Business / shop name</label>
                  <input
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Owner name</label>
                  <input
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Package</label>
                  <select
                    value={form.package}
                    onChange={(e) => setForm({ ...form, package: e.target.value })}
                  >
                    {(plans.length ? plans.map((p) => p.key) : ['Basic', 'Premium', 'Enterprise']).map(
                      (p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="field">
                  <label>Duration (months)</label>
                  <select
                    value={form.durationMonths}
                    onChange={(e) =>
                      setForm({ ...form, durationMonths: Number(e.target.value) })
                    }
                  >
                    {[1, 3, 6, 12, 24].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Preferred username</label>
                  <input
                    value={form.preferredUsername}
                    onChange={(e) => setForm({ ...form, preferredUsername: e.target.value })}
                    placeholder="optional"
                  />
                </div>
              </div>
              <div className="field">
                <label>Message</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your shop"
                />
              </div>
              {error && <div className="error">{error}</div>}
              <div className="row">
                <button className="btn btn-primary" disabled={busy}>
                  {busy ? 'Submitting...' : 'Submit signup request'}
                </button>
                <Link className="btn btn-outline" to="/">
                  Back
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
