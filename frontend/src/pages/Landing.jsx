import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

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

  const shops = [
    { name: 'City Mart', status: 'Live', statusClass: 'live' },
    { name: 'Green Store', status: 'Live', statusClass: 'live' },
    { name: 'Metro Hub', status: 'Demo', statusClass: 'demo' },
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <header className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            MS <span>TECHNO</span>
          </Link>
          <nav className="nav-menu">
            <a href="#features">Features</a>
            <a href="#plans">Pricing</a>
            {dashHref ? (
              <Link className="btn btn-primary btn-sm" to={dashHref}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="btn btn-outline btn-sm" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary btn-sm" to="/signup">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-badge">✨ Multi-tenant Retail ERP</span>
            <h1 className="hero-title">
              MS <span className="hero-highlight">TECHNO</span>
            </h1>
            <p className="hero-description">
              One platform. Isolated shops. Stock, sales, and reports your tenants can trust —
              with you in full control of plans and access.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to="/signup">
                Start Free Demo
              </Link>
              <a className="btn btn-outline btn-lg" href="#plans">
                View Pricing
              </a>
            </div>
            <div className="hero-features">
              <span className="hero-feature">🏢 Multi-tenant</span>
              <span className="hero-feature">💳 POS Ready</span>
              <span className="hero-feature">☁️ Cloud Based</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="tenant-panel">
              <div className="panel-header">
                <span className="panel-title">Live Tenants</span>
                <span className="panel-badge">3 active</span>
              </div>
              {shops.map((s) => (
                <div className="tenant-item" key={s.name}>
                  <span className="tenant-name">{s.name}</span>
                  <span className={`tenant-status ${s.statusClass}`}>
                    {s.status}
                  </span>
                </div>
              ))}
              <div className="panel-footer">
                <span>+2 more in queue</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Built for operators who sell software</h2>
            <p className="section-subtitle">
              Onboard businesses, assign packages, and keep every store's data private.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Tenant Isolation</h3>
              <p>Each shop is scoped by shop ID — products, sales, and customers never mix.</p>
              <div className="feature-tag">Security</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Package Control</h3>
              <p>Basic inventory or Premium POS. Product limits and feature gates enforced in the API.</p>
              <div className="feature-tag">Flexibility</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Super Admin Center</h3>
              <p>Approve demos, reset credentials, suspend shops, renew plans, and broadcast updates.</p>
              <div className="feature-tag">Control</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section section-alt" id="plans">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">Simple, transparent pricing</h2>
            <p className="section-subtitle">
              Choose the perfect plan for your business needs.
            </p>
          </div>
          <div className="pricing-grid">
            {plans.map((p) => (
              <div 
                className={`pricing-card ${p.key === 'Premium' ? 'pricing-card-featured' : ''}`} 
                key={p.key}
              >
                {p.key === 'Premium' && (
                  <div className="pricing-badge">Most Popular</div>
                )}
                <div className="pricing-header">
                  <h3 className="pricing-name">{p.name}</h3>
                  <div className="pricing-price">
                    Rs. {Number(p.priceMonthlyPkr).toLocaleString()}
                    <span>/month</span>
                  </div>
                </div>
                <p className="pricing-detail">
                  {p.unlimitedProducts || p.maxProducts == null
                    ? '♾️ Unlimited products'
                    : `📦 Up to ${p.maxProducts} products`}
                </p>
                <ul className="pricing-features">
                  {(p.features || []).map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
                <Link 
                  className="btn btn-primary" 
                  to="/signup" 
                  state={{ package: p.key }}
                >
                  Choose {p.name}
                </Link>
              </div>
            ))}
          </div>
          <p className="section-footnote">
            Need Enterprise? <a href="#contact">Contact MS Techno</a> for custom solutions.
          </p>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to get started?</h2>
            <p>Onboard your first tenant in minutes — no commitment required.</p>
          </div>
          <Link className="btn btn-cta" to="/signup">
            Start Free Demo →
          </Link>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section testimonial-section">
        <div className="section-container">
          <div className="testimonial-wrapper">
            <div className="testimonial-icon">💬</div>
            <blockquote className="testimonial">
              "We onboard shops in minutes — each tenant gets their own login, stock, and invoices."
              <cite>— MS Techno platform operators</cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <strong className="brand">
              MS <span>TECHNO</span>
            </strong>
            <p className="footer-subtitle">Cloud Retail Management ERP</p>
          </div>
          <div className="footer-links">
            <Link to="/login">Login</Link>
            <Link to="/signup">Request Demo</Link>
            <a href="#features">Features</a>
            <a href="#plans">Pricing</a>
          </div>
          <div className="footer-copy">
            © 2026 MS Techno. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}