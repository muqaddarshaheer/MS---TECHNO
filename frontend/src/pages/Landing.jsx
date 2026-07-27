// Landing.jsx
import React, { useState, useEffect } from 'react';
import './Landing.css';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const smoothScroll = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleDemo = () => {
    window.location.href = '/request-demo';
  };

  const handleGetStarted = (plan) => {
    window.location.href = `/signup?plan=${plan.toLowerCase()}`;
  };

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a href="/" className="nav-logo">
            <div className="logo-icon-wrapper">
              <span className="logo-icon">◆</span>
            </div>
            <span className="logo-text">MS TECHNO</span>
          </a>
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="/" className="nav-link">Home</a>
            <a href="#features" className="nav-link" onClick={(e) => smoothScroll(e, '#features')}>Features</a>
            <a href="#pricing" className="nav-link" onClick={(e) => smoothScroll(e, '#pricing')}>Pricing</a>
            <a href="#contact" className="nav-link" onClick={(e) => smoothScroll(e, '#contact')}>Contact</a>
            <button className="nav-login" onClick={handleLogin}>
              <span className="btn-icon">→</span>
              Login
            </button>
            <button className="nav-demo" onClick={handleDemo}>
              <span className="btn-icon">✦</span>
              Request Demo
            </button>
          </div>
          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-bg-pattern"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Next-Gen ERP Solution
            </div>
            <h1 className="hero-title">
              Manage Your<br />
              <span className="highlight">Business With</span><br />
              <span className="highlight-text">Smart Software</span>
            </h1>
            <p className="hero-description">
              Complete POS, inventory and business management solution for shops and businesses.
            </p>
            <div className="hero-buttons">
              <button className="btn-login" onClick={handleLogin}>
                <span className="btn-circle">→</span>
                Login
              </button>
              <button className="btn-demo" onClick={handleDemo}>
                <span className="btn-circle">✦</span>
                Request Free Demo
                <span className="btn-shine"></span>
              </button>
            </div>
            <div className="hero-trust">
              <span className="trust-text">Trusted by 10,000+ businesses</span>
              <div className="trust-avatars">
                <div className="avatar">🏢</div>
                <div className="avatar">🏪</div>
                <div className="avatar">🏬</div>
                <div className="avatar">🏭</div>
                <div className="avatar-count">+5K</div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="dashboard-mockup">
              <div className="mockup-glow"></div>
              <div className="mockup-header">
                <div className="mockup-controls">
                  <span className="control-dot"></span>
                  <span className="control-dot"></span>
                  <span className="control-dot"></span>
                </div>
                <div className="mockup-title">Dashboard Overview</div>
                <div className="mockup-actions">
                  <span className="action-dot"></span>
                  <span className="action-dot"></span>
                </div>
              </div>
              <div className="mockup-content">
                <div className="mockup-stats">
                  <div className="mockup-stat">
                    <span className="stat-value">$124.5K</span>
                    <span className="stat-label">Revenue</span>
                    <div className="stat-trend up">↑ 12.5%</div>
                  </div>
                  <div className="mockup-stat">
                    <span className="stat-value">2,847</span>
                    <span className="stat-label">Orders</span>
                    <div className="stat-trend up">↑ 8.3%</div>
                  </div>
                  <div className="mockup-stat">
                    <span className="stat-value">94%</span>
                    <span className="stat-label">Satisfaction</span>
                    <div className="stat-trend up">↑ 4.2%</div>
                  </div>
                </div>
                <div className="mockup-chart">
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: '60%' }}></div>
                    <span className="chart-label">Mon</span>
                  </div>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: '40%' }}></div>
                    <span className="chart-label">Tue</span>
                  </div>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: '80%' }}></div>
                    <span className="chart-label">Wed</span>
                  </div>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: '55%' }}></div>
                    <span className="chart-label">Thu</span>
                  </div>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: '90%' }}></div>
                    <span className="chart-label">Fri</span>
                  </div>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: '65%' }}></div>
                    <span className="chart-label">Sat</span>
                  </div>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: '75%' }}></div>
                    <span className="chart-label">Sun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <span className="section-tag">✦ Features</span>
          <h2>Everything You <span className="highlight">Need</span></h2>
          <p>Powerful tools designed to streamline your business operations</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🛒</span>
            </div>
            <h3>POS Billing</h3>
            <p>Fast and accurate point of sale system</p>
            <div className="feature-hover-line"></div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">📦</span>
            </div>
            <h3>Inventory</h3>
            <p>Real-time stock management</p>
            <div className="feature-hover-line"></div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">📊</span>
            </div>
            <h3>Sales Reports</h3>
            <p>Detailed business analytics</p>
            <div className="feature-hover-line"></div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">👤</span>
            </div>
            <h3>Customers</h3>
            <p>Manage customer relationships</p>
            <div className="feature-hover-line"></div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">💰</span>
            </div>
            <h3>Expenses</h3>
            <p>Track and manage expenses</p>
            <div className="feature-hover-line"></div>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">☁️</span>
            </div>
            <h3>Cloud Backup</h3>
            <p>Secure data backup and sync</p>
            <div className="feature-hover-line"></div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="section-header">
          <span className="section-tag">✦ Pricing</span>
          <h2>Choose Your <span className="highlight">Plan</span></h2>
          <p>Select the perfect plan for your business needs</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-card-top">
              <h3>Basic</h3>
              <div className="price">Rs. 2,500<span>/month</span></div>
            </div>
            <ul className="pricing-features">
              <li>✓ POS Billing</li>
              <li>✓ Inventory Management</li>
              <li>✓ Sales Reports</li>
              <li>✓ Customer Management</li>
              <li>✓ Email Support</li>
            </ul>
            <button className="btn-pricing" onClick={() => handleGetStarted('Basic')}>
              Get Started
              <span className="btn-arrow">→</span>
            </button>
          </div>
          <div className="pricing-card premium">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-card-top">
              <h3>Premium</h3>
              <div className="price">Rs. 3,500<span>/month</span></div>
            </div>
            <ul className="pricing-features">
              <li>✓ All Basic Features</li>
              <li>✓ Advanced Analytics</li>
              <li>✓ Expense Tracking</li>
              <li>✓ Priority Support</li>
              <li>✓ Cloud Backup</li>
            </ul>
            <button className="btn-pricing primary" onClick={() => handleGetStarted('Premium')}>
              Get Started
              <span className="btn-arrow">→</span>
            </button>
          </div>
          <div className="pricing-card">
            <div className="pricing-card-top">
              <h3>Enterprise</h3>
              <div className="price">Rs. 4,500<span>/month</span></div>
            </div>
            <ul className="pricing-features">
              <li>✓ All Premium Features</li>
              <li>✓ Custom Reports</li>
              <li>✓ Multi-User Access</li>
              <li>✓ Dedicated Support</li>
              <li>✓ Advanced Security</li>
            </ul>
            <button className="btn-pricing" onClick={() => handleGetStarted('Enterprise')}>
              Get Started
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section id="contact" className="cta-section">
        <div className="cta-pattern"></div>
        <div className="cta-container">
          <span className="cta-tag">✦ Start Free Trial</span>
          <h2>Ready to Transform<br />Your Business?</h2>
          <p>Experience the power of MS TECHNO software</p>
          <button className="btn-demo-large" onClick={handleDemo}>
            <span className="btn-icon">✦</span>
            Request Demo
            <span className="btn-shine"></span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">◆</span>
              <span>MS TECHNO</span>
            </div>
            <p className="footer-description">Smart business management solution for modern enterprises.</p>
            <div className="footer-social">
              <a href="#" className="social-link">📱</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">💼</a>
              <a href="#" className="social-link">📺</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features" onClick={(e) => smoothScroll(e, '#features')}>Features</a>
            <a href="#pricing" onClick={(e) => smoothScroll(e, '#pricing')}>Pricing</a>
            <a href="#contact" onClick={(e) => smoothScroll(e, '#contact')}>Demo</a>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <a href="/login" onClick={handleLogin}>Login</a>
            <a href="#">Help Center</a>
            <a href="#contact" onClick={(e) => smoothScroll(e, '#contact')}>Contact</a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p className="contact-item">📞 03401227619</p>
            <p className="contact-item">📍 Karachi, Pakistan</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 MS TECHNO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;