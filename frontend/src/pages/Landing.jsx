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

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a href="#home" className="nav-logo" onClick={(e) => smoothScroll(e, '#home')}>
            <span className="logo-icon">◆</span>
            <span className="logo-text">MS TECHNO</span>
          </a>
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#home" className="nav-link" onClick={(e) => smoothScroll(e, '#home')}>Home</a>
            <a href="#features" className="nav-link" onClick={(e) => smoothScroll(e, '#features')}>Features</a>
            <a href="#pricing" className="nav-link" onClick={(e) => smoothScroll(e, '#pricing')}>Pricing</a>
            <a href="#contact" className="nav-link" onClick={(e) => smoothScroll(e, '#contact')}>Contact</a>
            <button className="nav-login">Login</button>
            <button className="nav-demo">Request Demo</button>
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
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">🚀 ERP Solution</div>
            <h1 className="hero-title">
              Manage Your Business<br />
              <span className="highlight">With Smart Software</span>
            </h1>
            <p className="hero-description">
              Complete POS, inventory and business management solution for shops and businesses.
            </p>
            <div className="hero-buttons">
              <button className="btn-login">Login</button>
              <button className="btn-demo">Request Free Demo</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="dashboard-mockup">
              <div className="mockup-header">
                <div className="mockup-controls">
                  <span className="control-dot"></span>
                  <span className="control-dot"></span>
                  <span className="control-dot"></span>
                </div>
                <div className="mockup-title">Dashboard</div>
              </div>
              <div className="mockup-content">
                <div className="mockup-stats">
                  <div className="mockup-stat">
                    <span className="stat-value">$124.5K</span>
                    <span className="stat-label">Revenue</span>
                  </div>
                  <div className="mockup-stat">
                    <span className="stat-value">2,847</span>
                    <span className="stat-label">Orders</span>
                  </div>
                  <div className="mockup-stat">
                    <span className="stat-value">94%</span>
                    <span className="stat-label">Satisfaction</span>
                  </div>
                </div>
                <div className="mockup-chart">
                  <div className="chart-bar" style={{ height: '60%' }}></div>
                  <div className="chart-bar" style={{ height: '40%' }}></div>
                  <div className="chart-bar" style={{ height: '80%' }}></div>
                  <div className="chart-bar" style={{ height: '55%' }}></div>
                  <div className="chart-bar" style={{ height: '90%' }}></div>
                  <div className="chart-bar" style={{ height: '65%' }}></div>
                  <div className="chart-bar" style={{ height: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2>Everything You Need</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>POS Billing</h3>
            <p>Fast and accurate point of sale system</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Inventory</h3>
            <p>Real-time stock management</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Sales Reports</h3>
            <p>Detailed business analytics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Customers</h3>
            <p>Manage customer relationships</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Expenses</h3>
            <p>Track and manage expenses</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>Cloud Backup</h3>
            <p>Secure data backup and sync</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="section-header">
          <span className="section-tag">Pricing</span>
          <h2>Choose Your Plan</h2>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Basic</h3>
            <div className="price">Rs. 2,500<span>/month</span></div>
            <ul className="pricing-features">
              <li>✓ POS Billing</li>
              <li>✓ Inventory Management</li>
              <li>✓ Sales Reports</li>
              <li>✓ Customer Management</li>
              <li>✓ Email Support</li>
            </ul>
            <button className="btn-pricing">Get Started</button>
          </div>
          <div className="pricing-card premium">
            <div className="pricing-badge">Popular</div>
            <h3>Premium</h3>
            <div className="price">Rs. 3,500<span>/month</span></div>
            <ul className="pricing-features">
              <li>✓ All Basic Features</li>
              <li>✓ Advanced Analytics</li>
              <li>✓ Expense Tracking</li>
              <li>✓ Priority Support</li>
              <li>✓ Cloud Backup</li>
            </ul>
            <button className="btn-pricing primary">Get Started</button>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Rs. 4,500<span>/month</span></div>
            <ul className="pricing-features">
              <li>✓ All Premium Features</li>
              <li>✓ Custom Reports</li>
              <li>✓ Multi-User Access</li>
              <li>✓ Dedicated Support</li>
              <li>✓ Advanced Security</li>
            </ul>
            <button className="btn-pricing">Get Started</button>
          </div>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section id="contact" className="cta-section">
        <div className="cta-container">
          <h2>Start Your Free Demo Today</h2>
          <p>Experience the power of MS TECHNO software</p>
          <button className="btn-demo-large">Request Demo</button>
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
            <p className="footer-description">Smart business management solution</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Demo</a>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <a href="#">Login</a>
            <a href="#">Help Center</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p className="contact-item">📞 03401227619</p>
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