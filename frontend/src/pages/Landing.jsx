import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Landing() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api
      .get('/tenants/plans')
      .then((res) => setPlans(res.data.plans || []))
      .catch(() => setPlans([]));
  }, []);

  return (
    <div className="saas-landing">
      <header className="saas-nav">
        <div className="brand">
          MS <span>TECHNO</span>
        </div>
        <div className="row">
          <Link className="btn btn-outline" to="/login">
            Login
          </Link>
          <Link className="btn btn-primary" to="/signup">
            Start free request
          </Link>
        </div>
      </header>

      <section className="saas-hero">
        <p className="saas-eyebrow">Multi-tenant SaaS for perfume businesses</p>
        <h1>
          Run every shop on one <em>secure cloud ERP</em>
        </h1>
        <p className="saas-lead">
          MS Techno gives each business its own tenant workspace — products, POS, stock,
          invoices, and reports — isolated from other shops. You sell the platform; they
          run their store.
        </p>
        <div className="row">
          <Link className="btn btn-primary" to="/signup">
            Onboard a business
          </Link>
          <Link className="btn btn-outline" to="/login">
            Shop / Admin login
          </Link>
        </div>
      </section>

      <section className="saas-section">
        <h2>Built for multi-tenant delivery</h2>
        <div className="grid grid-3">
          <div className="card">
            <h3>Isolated tenants</h3>
            <p>Every shop has its own data boundary (shop_id). No shared inventory or sales.</p>
          </div>
          <div className="card">
            <h3>Subscription control</h3>
            <p>Plan start, duration, end date, payment due, and auto-restrict overdue tenants.</p>
          </div>
          <div className="card">
            <h3>You stay in control</h3>
            <p>Super admin creates or approves shops, resets passwords, renews, and announces.</p>
          </div>
        </div>
      </section>

      <section className="saas-section" id="plans">
        <h2>SaaS plans</h2>
        <p className="page-sub">Pick a package when onboarding each business tenant.</p>
        <div className="grid grid-3">
          {plans.map((p) => (
            <div className="card plan-card" key={p.key}>
              <h3>{p.name}</h3>
              <div className="plan-price">
                PKR {p.priceMonthlyPkr.toLocaleString()}
                <span>/mo</span>
              </div>
              <p className="page-sub">or PKR {p.priceYearlyPkr.toLocaleString()}/year</p>
              <p>
                Up to <strong>{p.maxProducts}</strong> products
              </p>
              <ul className="plan-features">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link className="btn btn-primary" to="/signup" state={{ package: p.key }}>
                Request {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="saas-footer">
        <span>MS Techno · Cloud Perfume Management</span>
        <Link to="/login">Login</Link>
      </footer>
    </div>
  );
}
