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

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">MS TECHNO</span>
          </div>
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#home" className="nav-link">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
            <button className="nav-cta">Get Started</button>
          </div>
          <div className="hamburger" onClick={toggleMenu}>
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
              Transform Your Business<br />
              <span className="highlight">With Smart ERP Solutions</span>
            </h1>
            <p className="hero-description">
              Streamline operations, boost productivity, and drive growth with our 
              comprehensive SaaS platform designed for modern enterprises.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">Start Free Trial</button>
              <button className="btn-secondary">View Demo</button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.8</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="dashboard-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="mockup-title">Dashboard</div>
              </div>
              <div className="mockup-content">
                <div className="mockup-card">
                  <div className="card-bar green"></div>
                  <div className="card-bar light"></div>
                  <div className="card-bar light"></div>
                </div>
                <div className="mockup-card">
                  <div className="card-bar green"></div>
                  <div className="card-bar light"></div>
                  <div className="card-bar light"></div>
                </div>
                <div className="mockup-card">
                  <div className="card-bar green"></div>
                  <div className="card-bar light"></div>
                  <div className="card-bar light"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>Powerful Features</h2>
          <p>Everything you need to manage your business efficiently</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>POS Management</h3>
            <p>Streamline point-of-sale operations with integrated payment processing and inventory sync.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Inventory Management</h3>
            <p>Track stock levels, manage suppliers, and automate reordering with real-time updates.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Sales & Reports</h3>
            <p>Generate detailed analytics and reports to make data-driven business decisions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Customer Management</h3>
            <p>Build lasting relationships with comprehensive CRM tools and customer insights.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>Cloud Based System</h3>
            <p>Access your business data anywhere, anytime with our secure cloud infrastructure.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Data</h3>
            <p>Enterprise-grade security with end-to-end encryption and regular backups.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get started in 4 simple steps</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Sign Up</h3>
            <p>Create your account and choose your plan</p>
          </div>
          <div className="step">
            <div className="step-number">02</div>
            <h3>Setup</h3>
            <p>Configure your business settings and preferences</p>
          </div>
          <div className="step">
            <div className="step-number">03</div>
            <h3>Integrate</h3>
            <p>Connect your existing systems and data</p>
          </div>
          <div className="step">
            <div className="step-number">04</div>
            <h3>Launch</h3>
            <p>Start managing your business with confidence</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="section-header">
          <h2>Choose Your Plan</h2>
          <p>Select the perfect plan for your business needs</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Basic</h3>
            <div className="price">$29<span>/mo</span></div>
            <ul className="pricing-features">
              <li>Up to 5 users</li>
              <li>Basic reporting</li>
              <li>Inventory management</li>
              <li>Email support</li>
            </ul>
            <button className="btn-pricing">Get Started</button>
          </div>
          <div className="pricing-card premium">
            <div className="badge">Popular</div>
            <h3>Premium</h3>
            <div className="price">$79<span>/mo</span></div>
            <ul className="pricing-features">
              <li>Up to 25 users</li>
              <li>Advanced analytics</li>
              <li>Full inventory control</li>
              <li>Priority support</li>
              <li>Custom reports</li>
            </ul>
            <button className="btn-pricing primary">Get Started</button>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Custom</div>
            <ul className="pricing-features">
              <li>Unlimited users</li>
              <li>Enterprise analytics</li>
              <li>Dedicated support</li>
              <li>Custom integration</li>
              <li>Advanced security</li>
            </ul>
            <button className="btn-pricing">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="section-header">
          <h2>Why Choose MS TECHNO</h2>
          <p>Benefits that set us apart</p>
        </div>
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">⚡</div>
            <h3>Save Time</h3>
            <p>Automate repetitive tasks and focus on what matters most</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🚀</div>
            <h3>Increase Productivity</h3>
            <p>Streamlined workflows that boost team efficiency</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🎯</div>
            <h3>Manage Business Easily</h3>
            <p>Intuitive tools that simplify complex operations</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">📊</div>
            <h3>Real Time Analytics</h3>
            <p>Instant insights to make informed decisions</p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="cta-section">
        <div className="cta-container">
          <h2>Ready to Transform Your Business?</h2>
          <p>Join thousands of businesses already using MS TECHNO</p>
          <div className="cta-buttons">
            <button className="btn-primary">Start Free Trial</button>
            <button className="btn-secondary">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>MS TECHNO</h3>
            <p>Empowering businesses with next-generation ERP solutions.</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Documentation</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📞 03401227619</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 MS TECHNO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;