// Landing.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

export default function Landing() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    api
      .get('/tenants/plans')
      .then((res) => setPlans(res.data.plans || []))
      .catch(() => setPlans([]));
  }, []);

  const dashHref = user ? (user.role === 'super' ? '/super' : '/shop') : null;

  const features = [
    { icon: '🛒', title: 'POS Management', desc: 'Complete point of sale system with quick checkout and billing.' },
    { icon: '📦', title: 'Inventory Management', desc: 'Track stock levels, manage products, and automate reordering.' },
    { icon: '📊', title: 'Sales Reports', desc: 'Real-time sales analytics and comprehensive reporting dashboard.' },
    { icon: '👥', title: 'Customer Management', desc: 'Manage customer relationships, history, and loyalty programs.' },
    { icon: '☁️', title: 'Cloud Based System', desc: 'Access your business data anytime, anywhere on any device.' },
    { icon: '🔒', title: 'Secure Data', desc: 'Enterprise-grade security with encrypted data and backups.' },
  ];

  const benefits = [
    { icon: '⏱️', title: 'Save Time', desc: 'Automate routine tasks and streamline operations.' },
    { icon: '📈', title: 'Increase Sales', desc: 'Boost revenue with smart tools and insights.' },
    { icon: '🏢', title: 'Manage Business Easily', desc: 'All-in-one platform for complete business control.' },
    { icon: '📊', title: 'Real Time Reports', desc: 'Make data-driven decisions with instant analytics.' },
  ];

  const shops = [
    { name: 'City Mart', status: 'Live', statusClass: 'live' },
    { name: 'Green Store', status: 'Live', statusClass: 'live' },
    { name: 'Metro Hub', status: 'Demo', statusClass: 'demo' },
  ];

  return (
    <div className="landing">
      {/* ===== NAVBAR ===== */}
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            MS <span>TECHNO</span>
          </Link>

          <button 
            className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
            <a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
            <Link className="btn btn-outline btn-nav" to="/login" onClick={() => setIsMenuOpen(false)}>
              Login
            </Link>
            <Link className="btn btn-primary btn-nav" to="/signup" onClick={() => setIsMenuOpen(false)}>
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Next-Generation ERP Platform
            </div>
            <h1 className="hero-title">
              Powerful SaaS Solutions <br />
              <span className="hero-highlight">For Your Business</span>
            </h1>
            <p className="hero-description">
              MS TECHNO provides professional software solutions to streamline your retail operations,
              boost sales, and grow your business with confidence.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-hero" to="/signup">
                Get Started
                <span className="btn-arrow">→</span>
              </Link>
              <a className="btn btn-outline btn-hero" href="#contact">
                Request Demo
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
            <div className="dashboard-card">
              <div className="dashboard-header">
                <div className="dashboard-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="dashboard-title">Dashboard</span>
              </div>
              <div className="dashboard-stats">
                <div className="dash-stat">
                  <span className="dash-stat-number">1,284</span>
                  <span className="dash-stat-label">Total Sales</span>
                </div>
                <div className="dash-stat">
                  <span className="dash-stat-number">₨ 45.2k</span>
                  <span className="dash-stat-label">Revenue</span>
                </div>
              </div>
              <div className="dashboard-shops">
                <span className="dash-shops-title">Live Tenants</span>
                {shops.map((s) => (
                  <div className="dash-shop-item" key={s.name}>
                    <span className="dash-shop-name">{s.name}</span>
                    <span className={`dash-shop-status ${s.statusClass}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="dashboard-footer">
                <span>+2 shops in queue</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="section features" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything You Need <span>To Succeed</span></h2>
            <p className="section-subtitle">
              Comprehensive tools designed to help you manage, grow, and scale your business efficiently.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                <div className="feature-tag">Learn More →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENEFITS SECTION ===== */}
      <section className="section benefits">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Why Choose Us</span>
            <h2 className="section-title">The <span>Smart Choice</span> For Your Business</h2>
            <p className="section-subtitle">
              Experience the difference with our cutting-edge software solutions designed for growth.
            </p>
          </div>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div className="benefit-card" key={index}>
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section className="section pricing" id="pricing">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">Choose Your <span>Perfect Plan</span></h2>
            <p className="section-subtitle">
              Flexible pricing options to suit businesses of all sizes. No hidden fees.
            </p>
          </div>
          <div className="pricing-grid">
            {plans.length > 0 ? (
              plans.map((p) => (
                <div 
                  className={`pricing-card ${p.key === 'Premium' ? 'pricing-featured' : ''}`} 
                  key={p.key}
                >
                  {p.key === 'Premium' && (
                    <div className="pricing-badge">Most Popular</div>
                  )}
                  <h3 className="pricing-name">{p.name}</h3>
                  <div className="pricing-price">
                    <span className="currency">₨</span>
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
              ))
            ) : (
              <>
                <div className="pricing-card">
                  <h3 className="pricing-name">Basic</h3>
                  <div className="pricing-price">
                    <span className="currency">₨</span>1,999<span className="period">/month</span>
                  </div>
                  <p className="pricing-detail">📦 Up to 500 products</p>
                  <ul className="pricing-features">
                    <li><span className="check">✓</span> Inventory Management</li>
                    <li><span className="check">✓</span> Basic POS</li>
                    <li><span className="check">✓</span> Sales Reports</li>
                    <li><span className="check">✓</span> Email Support</li>
                  </ul>
                  <Link className="btn btn-primary btn-pricing" to="/signup">
                    Choose Basic
                  </Link>
                </div>
                <div className="pricing-card pricing-featured">
                  <div className="pricing-badge">Most Popular</div>
                  <h3 className="pricing-name">Premium</h3>
                  <div className="pricing-price">
                    <span className="currency">₨</span>4,999<span className="period">/month</span>
                  </div>
                  <p className="pricing-detail">♾️ Unlimited products</p>
                  <ul className="pricing-features">
                    <li><span className="check">✓</span> All Basic Features</li>
                    <li><span className="check">✓</span> Advanced POS</li>
                    <li><span className="check">✓</span> Real-time Analytics</li>
                    <li><span className="check">✓</span> Priority Support</li>
                  </ul>
                  <Link className="btn btn-primary btn-pricing" to="/signup">
                    Choose Premium
                  </Link>
                </div>
                <div className="pricing-card">
                  <h3 className="pricing-name">Enterprise</h3>
                  <div className="pricing-price">
                    <span className="currency">₨</span>9,999<span className="period">/month</span>
                  </div>
                  <p className="pricing-detail">♾️ Custom solutions</p>
                  <ul className="pricing-features">
                    <li><span className="check">✓</span> All Premium Features</li>
                    <li><span className="check">✓</span> Custom Development</li>
                    <li><span className="check">✓</span> Dedicated Support</li>
                    <li><span className="check">✓</span> API Access</li>
                  </ul>
                  <Link className="btn btn-primary btn-pricing" to="/signup">
                    Contact Sales
                  </Link>
                </div>
              </>
            )}
          </div>
          <p className="section-footnote">
            Need a custom solution? <a href="#contact">Contact our sales team</a> for a personalized quote.
          </p>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="section about" id="about">
        <div className="section-container">
          <div className="about-content">
            <div className="about-text">
              <span className="section-tag">About Us</span>
              <h2 className="section-title">MS <span>TECHNO</span> — Your Trusted Software Partner</h2>
              <p className="about-description">
                MS TECHNO is a leading provider of professional software solutions for businesses. 
                We specialize in developing powerful, user-friendly ERP systems that help retail 
                businesses manage their operations efficiently.
              </p>
              <p className="about-description">
                Our mission is to empower businesses with cutting-edge technology that drives growth, 
                improves productivity, and delivers measurable results. With our cloud-based platform, 
                you can access your business data anytime, anywhere.
              </p>
              <div className="about-stats">
                <div className="about-stat">
                  <span className="about-stat-number">5+</span>
                  <span className="about-stat-label">Years Experience</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-number">100+</span>
                  <span className="about-stat-label">Businesses Served</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-number">99%</span>
                  <span className="about-stat-label">Satisfaction Rate</span>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="about-card">
                <div className="about-card-icon">🏢</div>
                <h3>MS TECHNO</h3>
                <p>Cloud Retail Management ERP</p>
                <div className="about-card-features">
                  <span>✓ Secure & Reliable</span>
                  <span>✓ 24/7 Support</span>
                  <span>✓ Scalable Solutions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT CTA SECTION ===== */}
      <section className="cta-section" id="contact">
        <div className="cta-container">
          <div className="cta-content">
            <span className="cta-badge">🚀 Get Started Today</span>
            <h2>Ready to Grow Your Business?</h2>
            <p>Join 100+ businesses already using MS TECHNO to streamline their operations.</p>
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

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              MS <span>TECHNO</span>
            </Link>
            <p className="footer-desc">
              Cloud Retail Management ERP — Professional software solutions for modern businesses.
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <a href="#home">Home</a>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#about">About</a>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <a href="#contact">Contact</a>
              <a href="#help">Help Center</a>
              <a href="#docs">Documentation</a>
              <a href="#status">System Status</a>
            </div>
            <div className="footer-column">
              <h4>Contact us</h4>
              <p>📞 0340-1227619</p>
              <p>📍 Pakistan</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 MS TECHNO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}