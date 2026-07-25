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
    <div className="landing">
      {/* Navigation */}
      <header className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="brand">
            <span className="brand-icon">◆</span>
            MS <span>TECHNO</span>
          </Link>
          <nav className="nav-menu">
            <a href="#features">Features</a>
            <a href="#plans">Pricing</a>
            <a href="#testimonials">Testimonials</a>
            {dashHref ? (
              <Link className="btn btn-primary" to={dashHref}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="btn btn-outline" to="/login">
                  Sign In
                </Link>
                <Link className="btn btn-primary" to="/signup">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Multi-tenant Retail ERP Platform
            </div>
            <h1 className="hero-title">
              Enterprise Retail <br />
              <span className="hero-highlight">Management Suite</span>
            </h1>
            <p className="hero-description">
              One powerful platform. Isolated shops. Complete control over stock, sales, 
              and reporting — with full tenant isolation and flexible pricing plans.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-hero" to="/signup">
                Start Free Trial
                <span className="btn-arrow">→</span>
              </Link>
              <a className="btn btn-outline btn-hero" href="#plans">
                View Pricing
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">Active Shops</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-panel">
              <div className="panel-header">
                <div className="panel-title-group">
                  <span className="panel-dot"></span>
                  <span className="panel-title">Live Tenants</span>
                </div>
                <span className="panel-count">3 Active</span>
              </div>
              {shops.map((s) => (
                <div className="tenant-item" key={s.name}>
                  <div className="tenant-info">
                    <span className="tenant-avatar">🏪</span>
                    <span className="tenant-name">{s.name}</span>
                  </div>
                  <span className={`tenant-status ${s.statusClass}`}>
                    {s.status}
                  </span>
                </div>
              ))}
              <div className="panel-footer">
                <span className="panel-footer-text">+2 shops in queue</span>
                <span className="panel-footer-arrow">→</span>
              </div>
            </div>
            <div className="hero-decoration">
              <div className="deco-circle deco-1"></div>
              <div className="deco-circle deco-2"></div>
              <div className="deco-circle deco-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Built for <span>software operators</span></h2>
            <p className="section-subtitle">
              Onboard businesses, assign packages, and keep every store's data completely private.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Tenant Isolation</h3>
              <p>Each shop operates in its own secure environment. Products, sales, and customer data never mix.</p>
              <div className="feature-tag">Security First</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Package Control</h3>
              <p>Flexible plans with product limits and feature gates. From basic inventory to premium POS.</p>
              <div className="feature-tag">Scalable</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Admin Center</h3>
              <p>Complete control: approve demos, reset credentials, suspend shops, and broadcast updates.</p>
              <div className="feature-tag">Full Control</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section pricing" id="plans">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">Simple, <span>transparent</span> plans</h2>
            <p className="section-subtitle">
              Choose the perfect plan for your business needs. No hidden fees.
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
                <h3 className="pricing-name">{p.name}</h3>
                <div className="pricing-price">
                  <span className="currency">Rs.</span>
                  {Number(p.priceMonthlyPkr).toLocaleString()}
                  <span className="period">/month</span>
                </div>
                <p className="pricing-detail">
                  {p.unlimitedProducts || p.maxProducts == null
                    ? '♾️ Unlimited products'
                    : `📦 Up to ${p.maxProducts} products`}
                </p>
                <ul className="pricing-features">
                  {(p.features || []).map((f) => (
                    <li key={f}>
                      <span className="check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link 
                  className="btn btn-primary btn-pricing" 
                  to="/signup" 
                  state={{ package: p.key }}
                >
                  Choose {p.name}
                </Link>
              </div>
            ))}
          </div>
          <p className="section-footnote">
            Need a custom enterprise solution? <a href="#contact">Contact our sales team</a>
          </p>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <span className="cta-badge">🚀 Get Started Today</span>
            <h2>Ready to scale your retail operations?</h2>
            <p>Onboard your first tenant in minutes — no commitment required.</p>
          </div>
          <div className="cta-actions">
            <Link className="btn btn-cta-primary" to="/signup">
              Start Free Demo
              <span className="btn-arrow">→</span>
            </Link>
            <a className="btn btn-cta-outline" href="#features">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="section testimonial-section" id="testimonials">
        <div className="section-container">
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <blockquote className="testimonial-text">
                We onboard shops in minutes — each tenant gets their own login, stock, and invoices. 
                The isolation is perfect for our multi-brand strategy.
              </blockquote>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍💼</div>
                <div className="author-info">
                  <span className="author-name">Muqaddar Hussain</span>
                  <span className="author-role">CEO, MS Techno</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <blockquote className="testimonial-text">
                The super admin dashboard gives us complete visibility across all shops. 
                Managing plans and users has never been easier.
              </blockquote>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍💻</div>
                <div className="author-info">
                  <span className="author-name">Mooz Kamal</span>
                  <span className="author-role">Co-Founder, MS Techno</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <span className="brand-icon">◆</span>
              MS <span>TECHNO</span>
            </Link>
            <p className="footer-desc">Cloud Retail Management ERP</p>
            <p className="footer-copy">© 2026 MS Techno. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#plans">Pricing</a>
              <a href="#testimonials">Testimonials</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#contact">Contact</a>
              <a href="#careers">Careers</a>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <a href="#help">Help Center</a>
              <a href="#docs">Documentation</a>
              <a href="#status">System Status</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}