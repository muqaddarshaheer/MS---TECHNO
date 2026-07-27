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
    alert('Login page will open here');
  };

  const handleDemo = () => {
    alert('Demo request form will open here');
  };

  const handleGetStarted = (plan) => {
    alert(`You selected ${plan} plan. Signup form will open.`);
  };

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a href="/" className="nav-logo">
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
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Smart Software For<br />
              <span>Your Business Growth</span>
            </h1>
            <p className="hero-description">
              Complete POS, inventory, sales and customer management solution.
            </p>
            <div className="hero-buttons">
              <button className="btn-login" onClick={handleLogin}>Login</button>
              <button className="btn-demo" onClick={handleDemo}>Request Demo</button>
            </div>
            <div className="hero-stats">
              <div>
                <span className="stat-number">10K+</span>
                <span className="stat-label">Users</span>
              </div>
              <div>
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div>
                <span className="stat-number">4.8</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="dashboard-card">
              <div className="dashboard-header">
                <span>Dashboard</span>
              </div>
              <div className="dashboard-grid">
                <div className="dash-item">
                  <span className="dash-value">$124K</span>
                  <span className="dash-label">Sales</span>
                </div>
                <div className="dash-item">
                  <span className="dash-value">2,847</span>
                  <span className="dash-label">Orders</span>
                </div>
                <div className="dash-item">
                  <span className="dash-value">1,234</span>
                  <span className="dash-label">Customers</span>
                </div>
                <div className="dash-item">
                  <span className="dash-value">94%</span>
                  <span className="dash-label">Growth</span>
                </div>
              </div>
              <div className="dashboard-chart">
                <div className="bar" style={{ height: '60%' }}></div>
                <div className="bar" style={{ height: '40%' }}></div>
                <div className="bar" style={{ height: '80%' }}></div>
                <div className="bar" style={{ height: '55%' }}></div>
                <div className="bar" style={{ height: '90%' }}></div>
                <div className="bar" style={{ height: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>Features</h2>
          <p>Everything you need to manage your business</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🛒</span>
            <h3>POS Billing</h3>
            <p>Fast and simple billing</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📦</span>
            <h3>Inventory</h3>
            <p>Track your stock easily</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Sales Reports</h3>
            <p>Understand your growth</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">👤</span>
            <h3>Customers</h3>
            <p>Manage relationships</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💰</span>
            <h3>Expenses</h3>
            <p>Control your spending</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">☁️</span>
            <h3>Cloud Based</h3>
            <p>Access anywhere</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get started in 3 simple steps</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up for free</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Setup Shop</h3>
            <p>Configure your business</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Start Managing</h3>
            <p>Begin using the software</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing">
        <div className="section-header">
          <h2>Pricing Plans</h2>
          <p>Choose the best plan for your business</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Basic</h3>
            <div className="price">Rs. 2,500<span>/mo</span></div>
            <ul>
              <li>✓ POS Billing</li>
              <li>✓ Inventory</li>
              <li>✓ Sales Reports</li>
              <li>✓ Email Support</li>
            </ul>
            <button onClick={() => handleGetStarted('Basic')}>Get Started</button>
          </div>
          <div className="pricing-card premium">
            <div className="badge">Popular</div>
            <h3>Premium</h3>
            <div className="price">Rs. 3,500<span>/mo</span></div>
            <ul>
              <li>✓ All Basic Features</li>
              <li>✓ Advanced Analytics</li>
              <li>✓ Expense Tracking</li>
              <li>✓ Priority Support</li>
            </ul>
            <button onClick={() => handleGetStarted('Premium')}>Get Started</button>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Rs. 4,500<span>/mo</span></div>
            <ul>
              <li>✓ All Premium Features</li>
              <li>✓ Custom Reports</li>
              <li>✓ Multi-User Access</li>
              <li>✓ Dedicated Support</li>
            </ul>
            <button onClick={() => handleGetStarted('Enterprise')}>Get Started</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="cta">
        <div className="cta-container">
          <h2>Ready to grow your business?</h2>
          <p>Start your free demo today</p>
          <button className="cta-button" onClick={handleDemo}>Request Demo</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-col">
            <h3>MS TECHNO</h3>
            <p>Smart business management</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#" onClick={handleLogin}>Login</a>
            <a href="#" onClick={handleDemo}>Demo</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <p>03401227619</p>
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