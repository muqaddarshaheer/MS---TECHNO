import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api
      .get('/tenants/plans')
      .then((res) => setPlans(res.data.plans || []))
      .catch(() => setPlans([]));
  }, []);

  const dashHref = user ? (user.role === 'super' ? '/super' : '/shop') : null;

  return (
    <div className="saas-landing landing-v2">
      <header className="saas-nav">
        <Link to="/" className="brand">
          MS <span>TECHNO</span>
        </Link>
        <nav className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#plans">Pricing</a>
          {dashHref ? (
            <Link className="btn btn-primary" to={dashHref}>
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link className="btn btn-outline" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary" to="/signup">
                Request demo
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="saas-hero hero-v2">
        <div className="hero-copy">
          <p className="saas-eyebrow">Perfume retail ERP · Multi-tenant SaaS</p>
          <h1 className="hero-brand">MS TECHNO</h1>
          <p className="saas-lead">
            One platform. Isolated shops. Stock, sales, and reports your tenants can trust —
            with you in full control of plans and access.
          </p>
          <div className="row hero-cta">
            <Link className="btn btn-primary btn-lg" to="/signup">
              Start free demo request
            </Link>
            <a className="btn btn-outline btn-lg" href="#plans">
              View pricing
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-panel">
            <span>Live tenants</span>
            <strong>Isolated by shop</strong>
            <span>POS · Stock · Reports</span>
          </div>
        </div>
      </section>

      <section className="saas-section" id="features">
        <h2>Built for operators who sell software</h2>
        <p className="page-sub section-lead">
          Onboard perfume businesses, assign packages, and keep every store&apos;s data private.
        </p>
        <div className="grid grid-3 feature-grid">
          <article className="feature-block">
            <h3>Tenant isolation</h3>
            <p>Each shop is scoped by shop ID — products, sales, and customers never mix.</p>
          </article>
          <article className="feature-block">
            <h3>Package control</h3>
            <p>Basic inventory or Premium POS. Product limits and feature gates enforced in the API.</p>
          </article>
          <article className="feature-block">
            <h3>Super admin center</h3>
            <p>Approve demos, reset credentials, suspend shops, renew plans, and broadcast updates.</p>
          </article>
        </div>
      </section>

      <section className="saas-section" id="plans">
        <h2>Simple pricing</h2>
        <p className="page-sub section-lead">Transparent monthly packages for each business tenant.</p>
        <div className="grid grid-2 pricing-grid">
          {plans.map((p) => (
            <div className={`card plan-card ${p.key === 'Premium' ? 'plan-featured' : ''}`} key={p.key}>
              <h3>{p.name}</h3>
              <div className="plan-price">
                Rs. {Number(p.priceMonthlyPkr).toLocaleString()}
                <span>/month</span>
              </div>
              <p>
                {p.unlimitedProducts || p.maxProducts == null
                  ? 'Unlimited products'
                  : `Up to ${p.maxProducts} products`}
              </p>
              <ul className="plan-features">
                {(p.features || []).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link className="btn btn-primary" to="/signup" state={{ package: p.key }}>
                Request {p.name}
              </Link>
            </div>
          ))}
        </div>
        <p className="page-sub" style={{ marginTop: '1rem' }}>
          Need Enterprise? Contact MS Techno after submitting a request.
        </p>
      </section>

      <section className="saas-section testimonial-section">
        <h2>Built for perfume retail</h2>
        <blockquote className="testimonial">
          “We onboard shops in minutes — each tenant gets their own login, stock, and invoices.”
          <cite>— MS Techno platform operators</cite>
        </blockquote>
      </section>

      <footer className="saas-footer">
        <div>
          <strong className="brand">
            MS <span>TECHNO</span>
          </strong>
          <p className="page-sub">Cloud Perfume Management ERP</p>
        </div>
        <div className="row">
          <Link to="/login">Login</Link>
          <Link to="/signup">Request demo</Link>
        </div>
      </footer>
    </div>
  );
}
