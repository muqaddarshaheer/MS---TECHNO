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
            <span className="logo-icon">◈</span>
            <span className="logo-text">MS TECHNO</span>
          </a>
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#home" className="nav-link" onClick={(e) => smoothScroll(e, '#home')}>Home</a>
            <a href="#features" className="nav-link" onClick={(e) => smoothScroll(e, '#features')}>Features</a>
            <a href="#pricing" className="nav-link" onClick={(e) => smoothScroll(e, '#pricing')}>Pricing</a>
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
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Software for Modern Business
            </div>
            <h1 className="hero-title">
              Manage Your Business<br />
              <span>Smarter With MS TECHNO</span>
            </h1>
            <p className="hero-description">
              Powerful POS, inventory and business management software to simplify your daily operations.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={handleDemo}>
                Request Free Demo
              </button>
              <button className="btn-secondary" onClick={handleLogin}>
                Login
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Businesses</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">4.8</span>
                <span className="stat-label">User Rating</span>
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
                <span className="dashboard-title">Dashboard Overview</span>
              </div>
              <div className="dashboard-grid">
                <div className="dash-item">
                  <span className="dash-value">$124.5K</span>
                  <span className="dash-label">Revenue</span>
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
          <span className="section-tag">Features</span>
          <h2>Everything You Need</h2>
          <p>Powerful tools to manage your business efficiently</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>POS Billing</h3>
            <p>Fast and accurate billing system</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Inventory Management</h3>
            <p>Track stock in real-time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Customer Management</h3>
            <p>Build strong relationships</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Sales Reports</h3>
            <p>Data-driven insights</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Expense Tracking</h3>
            <p>Control your spending</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>Cloud Based</h3>
            <p>Access from anywhere</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="section-header">
          <span className="section-tag">Pricing</span>
          <h2>Choose Your Plan</h2>
          <p>Select the perfect plan for your business</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Basic</h3>
            <div className="price">Rs. 2,500<span>/month</span></div>
            <ul>
              <li>✓ POS Billing</li>
              <li>✓ Inventory Management</li>
              <li>✓ Sales Reports</li>
              <li>✓ Email Support</li>
            </ul>
            <button onClick={() => handleGetStarted('Basic')}>Get Started</button>
          </div>
          <div className="pricing-card premium">
            <div className="badge">Popular</div>
            <h3>Premium</h3>
            <div className="price">Rs. 3,500<span>/month</span></div>
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
            <div className="price">Rs. 4,500<span>/month</span></div>
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

      {/* Demo CTA Section */}
      <section id="contact" className="cta">
        <div className="cta-container">
          <h2>Start Your Free Demo Today</h2>
          <p>Experience the power of MS TECHNO software</p>
          <div className="cta-buttons">
            <button className="cta-primary" onClick={handleDemo}>Request Demo</button>
            <button className="cta-secondary" onClick={handleLogin}>Login</button>
          </div>
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
            <p>Smart business management software</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Demo</a>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <a href="#" onClick={handleLogin}>Login</a>
            <a href="#" onClick={handleDemo}>Request Demo</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>info@mstechno.com</p>
            <p>0340127619</p>
            <p>Karachi, Pakistan</p>
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