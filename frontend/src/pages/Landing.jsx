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
            <span className="logo-icon">◈</span>
            <span className="logo-text">MS TECHNO</span>
          </a>
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#home" className="nav-link" onClick={(e) => smoothScroll(e, '#home')}>Home</a>
            <a href="#features" className="nav-link" onClick={(e) => smoothScroll(e, '#features')}>Features</a>
            <a href="#pricing" className="nav-link" onClick={(e) => smoothScroll(e, '#pricing')}>Pricing</a>
            <a href="#about" className="nav-link" onClick={(e) => smoothScroll(e, '#about')}>About</a>
            <a href="#contact" className="nav-link" onClick={(e) => smoothScroll(e, '#contact')}>Contact</a>
            <button className="nav-login" onClick={handleLogin}>Login</button>
            <button className="nav-demo" onClick={handleDemo}>Request Demo</button>
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
        <div className="hero-pattern"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              Next-Gen ERP Solution
            </div>
            <h1 className="hero-title">
              Smart Software To<br />
              <span className="highlight">Grow Your Business</span>
            </h1>
            <p className="hero-description">
              Manage billing, inventory, sales and customers with one powerful platform.
            </p>
            <div className="hero-buttons">
              <button className="btn-login" onClick={handleLogin}>
                <span className="btn-icon">→</span>
                Login Now
              </button>
              <button className="btn-demo" onClick={handleDemo}>
                <span className="btn-icon">✦</span>
                Request Free Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Businesses</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">4.8</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="dashboard-card">
              <div className="dashboard-header">
                <div className="dashboard-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="dashboard-title">Business Dashboard</span>
              </div>
              <div className="dashboard-grid">
                <div className="dashboard-item">
                  <span className="dash-value">$124.5K</span>
                  <span className="dash-label">Sales</span>
                </div>
                <div className="dashboard-item">
                  <span className="dash-value">2,847</span>
                  <span className="dash-label">Products</span>
                </div>
                <div className="dashboard-item">
                  <span className="dash-value">1,234</span>
                  <span className="dash-label">Customers</span>
                </div>
                <div className="dashboard-item">
                  <span className="dash-value">94%</span>
                  <span className="dash-label">Growth</span>
                </div>
              </div>
              <div className="dashboard-chart">
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
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <span className="section-tag">✦ Features</span>
          <h2>Everything You Need</h2>
          <p>Powerful tools to manage your business efficiently</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🛒</span>
            </div>
            <h3>POS Billing</h3>
            <p>Fast and simple billing system</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">📦</span>
            </div>
            <h3>Inventory Management</h3>
            <p>Track your stock easily</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">📊</span>
            </div>
            <h3>Sales Reports</h3>
            <p>Understand your business growth</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">👤</span>
            </div>
            <h3>Customer Management</h3>
            <p>Manage customers and credit records</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">💰</span>
            </div>
            <h3>Expense Tracking</h3>
            <p>Control your expenses</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">☁️</span>
            </div>
            <h3>Cloud Based Software</h3>
            <p>Access your business anywhere</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="how-it-works">
        <div className="section-header">
          <span className="section-tag">✦ How It Works</span>
          <h2>Get Started in 3 Simple Steps</h2>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">01</div>
            <div className="step-icon">📝</div>
            <h3>Create Account</h3>
            <p>Sign up and choose your plan</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">02</div>
            <div className="step-icon">⚙️</div>
            <h3>Setup Your Shop</h3>
            <p>Configure your business settings</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">03</div>
            <div className="step-icon">🚀</div>
            <h3>Start Managing Business</h3>
            <p>Begin using the software</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="section-header">
          <span className="section-tag">✦ Pricing</span>
          <h2>Choose Your Plan</h2>
          <p>Select the best plan for your business needs</p>
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
            <button className="btn-pricing" onClick={() => handleGetStarted('Basic')}>
              Get Started
            </button>
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
            <button className="btn-pricing primary" onClick={() => handleGetStarted('Premium')}>
              Get Started
            </button>
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
            <button className="btn-pricing" onClick={() => handleGetStarted('Enterprise')}>
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section id="contact" className="cta-section">
        <div className="cta-pattern"></div>
        <div className="cta-container">
          <h2>Ready To Manage Your Business Smarter?</h2>
          <p>Start your free demo today and see the difference</p>
          <button className="btn-demo-large" onClick={handleDemo}>
            <span className="btn-icon">✦</span>
            Request Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">◈</span>
              <span>MS TECHNO</span>
            </div>
            <p className="footer-description">Smart business management solution for modern enterprises.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="#home" onClick={(e) => smoothScroll(e, '#home')}>Home</a>
            <a href="#features" onClick={(e) => smoothScroll(e, '#features')}>Features</a>
            <a href="#pricing" onClick={(e) => smoothScroll(e, '#pricing')}>Pricing</a>
            <a href="#about" onClick={(e) => smoothScroll(e, '#about')}>About</a>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <a href="#" onClick={handleLogin}>Login</a>
            <a href="#" onClick={handleDemo}>Request Demo</a>
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