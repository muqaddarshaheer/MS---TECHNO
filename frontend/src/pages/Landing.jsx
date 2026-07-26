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
            <a href="#about" className="nav-link" onClick={(e) => smoothScroll(e, '#about')}>About</a>
            <a href="#contact" className="nav-link" onClick={(e) => smoothScroll(e, '#contact')}>Contact</a>
            <button className="nav-cta">Get Started</button>
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
            <div className="hero-badge">🚀 Next-Gen ERP Solution</div>
            <h1 className="hero-title">
              Transform Your<br />
              <span className="highlight">Business Operations</span>
            </h1>
            <p className="hero-description">
              Empower your enterprise with intelligent automation, real-time insights, 
              and seamless integration. The complete SaaS platform designed for growth.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">
                Start Free Trial
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn-secondary">
                <span className="btn-play">▶</span>
                Watch Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">4.8</span>
                <span className="stat-label">User Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="dashboard-mockup">
              <div className="mockup-header">
                <div className="mockup-controls">
                  <span className="control-dot red"></span>
                  <span className="control-dot yellow"></span>
                  <span className="control-dot green"></span>
                </div>
                <div className="mockup-title">Dashboard Overview</div>
                <div className="mockup-actions">
                  <span className="action-icon">⟳</span>
                  <span className="action-icon">⋯</span>
                </div>
              </div>
              <div className="mockup-content">
                <div className="mockup-stats">
                  <div className="mockup-stat">
                    <span className="stat-value">$124.5K</span>
                    <span className="stat-label">Revenue</span>
                    <div className="stat-bar">
                      <div className="stat-fill" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="mockup-stat">
                    <span className="stat-value">2,847</span>
                    <span className="stat-label">Orders</span>
                    <div className="stat-bar">
                      <div className="stat-fill" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  <div className="mockup-stat">
                    <span className="stat-value">94%</span>
                    <span className="stat-label">Satisfaction</span>
                    <div className="stat-bar">
                      <div className="stat-fill" style={{ width: '94%' }}></div>
                    </div>
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
          <h2>Everything You Need to Succeed</h2>
          <p>Powerful tools designed to streamline your business operations and drive growth</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">📊</span>
            </div>
            <h3>POS Management</h3>
            <p>Streamline point-of-sale operations with integrated payment processing and inventory sync.</p>
            <a href="#" className="feature-link">Learn More →</a>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">📦</span>
            </div>
            <h3>Inventory Management</h3>
            <p>Track stock levels, manage suppliers, and automate reordering with real-time updates.</p>
            <a href="#" className="feature-link">Learn More →</a>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">📈</span>
            </div>
            <h3>Sales & Analytics</h3>
            <p>Generate detailed analytics and reports to make data-driven business decisions.</p>
            <a href="#" className="feature-link">Learn More →</a>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">👥</span>
            </div>
            <h3>Customer Management</h3>
            <p>Build lasting relationships with comprehensive CRM tools and customer insights.</p>
            <a href="#" className="feature-link">Learn More →</a>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">☁️</span>
            </div>
            <h3>Cloud Based System</h3>
            <p>Access your business data anywhere, anytime with our secure cloud infrastructure.</p>
            <a href="#" className="feature-link">Learn More →</a>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🔒</span>
            </div>
            <h3>Enterprise Security</h3>
            <p>Enterprise-grade security with end-to-end encryption and regular data backups.</p>
            <a href="#" className="feature-link">Learn More →</a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="how-it-works">
        <div className="section-header">
          <span className="section-tag">Process</span>
          <h2>How It Works</h2>
          <p>Get started in four simple steps and transform your business</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">01</div>
            <div className="step-icon">📝</div>
            <h3>Sign Up</h3>
            <p>Create your account and choose the perfect plan for your needs</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">02</div>
            <div className="step-icon">⚙️</div>
            <h3>Configure</h3>
            <p>Set up your business profile, team, and operational preferences</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">03</div>
            <div className="step-icon">🔗</div>
            <h3>Integrate</h3>
            <p>Connect your existing tools, data, and payment systems seamlessly</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">04</div>
            <div className="step-icon">🚀</div>
            <h3>Launch</h3>
            <p>Go live and start managing your business with confidence</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="section-header">
          <span className="section-tag">Pricing</span>
          <h2>Choose Your Plan</h2>
          <p>Select the perfect plan for your business size and needs</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Basic</h3>
              <div className="price">$29<span>/month</span></div>
              <p>Perfect for small businesses</p>
            </div>
            <ul className="pricing-features">
              <li>✓ Up to 5 users</li>
              <li>✓ Basic reporting</li>
              <li>✓ Inventory management</li>
              <li>✓ Email support</li>
              <li>✓ 10GB storage</li>
            </ul>
            <button className="btn-pricing">Get Started</button>
          </div>
          <div className="pricing-card premium">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-header">
              <h3>Premium</h3>
              <div className="price">$79<span>/month</span></div>
              <p>Ideal for growing businesses</p>
            </div>
            <ul className="pricing-features">
              <li>✓ Up to 25 users</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Full inventory control</li>
              <li>✓ Priority support</li>
              <li>✓ Custom reports</li>
              <li>✓ 50GB storage</li>
            </ul>
            <button className="btn-pricing primary">Get Started</button>
          </div>
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Enterprise</h3>
              <div className="price">Custom</div>
              <p>For large organizations</p>
            </div>
            <ul className="pricing-features">
              <li>✓ Unlimited users</li>
              <li>✓ Enterprise analytics</li>
              <li>✓ Dedicated support</li>
              <li>✓ Custom integration</li>
              <li>✓ Advanced security</li>
              <li>✓ Unlimited storage</li>
            </ul>
            <button className="btn-pricing">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="section-header">
          <span className="section-tag">Benefits</span>
          <h2>Why Choose MS TECHNO</h2>
          <p>Discover the advantages that set us apart from the competition</p>
        </div>
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon-wrapper">
              <span className="benefit-icon">⚡</span>
            </div>
            <h3>Save Time</h3>
            <p>Automate repetitive tasks and focus on strategic initiatives that matter most</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon-wrapper">
              <span className="benefit-icon">🚀</span>
            </div>
            <h3>Boost Productivity</h3>
            <p>Streamlined workflows and intelligent tools that enhance team efficiency</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon-wrapper">
              <span className="benefit-icon">🎯</span>
            </div>
            <h3>Simplify Management</h3>
            <p>Intuitive tools and dashboards that make complex operations simple</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon-wrapper">
              <span className="benefit-icon">📊</span>
            </div>
            <h3>Real-Time Insights</h3>
            <p>Make informed decisions with live data and actionable analytics</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <span className="cta-tag">Get Started</span>
            <h2>Ready to Transform Your Business?</h2>
            <p>Join thousands of businesses already using MS TECHNO to grow and succeed</p>
            <div className="cta-buttons">
              <button className="btn-primary">
                Start Free Trial
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn-secondary">Contact Sales</button>
            </div>
          </div>
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
            <p className="footer-description">Empowering businesses with next-generation ERP solutions for the modern enterprise.</p>
            <div className="footer-social">
              <a href="#" className="social-link">📱</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">💼</a>
              <a href="#" className="social-link">📺</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
            <a href="#">Integrations</a>
            <a href="#">Changelog</a>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Documentation</a>
            <a href="#">API Reference</a>
            <a href="#">Community</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p className="contact-item">📞 03401227619</p>          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 MS TECHNO. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;