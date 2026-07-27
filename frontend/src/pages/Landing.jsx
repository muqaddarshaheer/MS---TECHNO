// Landing.jsx
import React, { useState, useEffect } from 'react';
import './Landing.css';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openDemoModal = () => {
    setIsDemoModalOpen(true);
    setIsMenuOpen(false);
    document.body.style.overflow = 'hidden';
  };

  const closeDemoModal = () => {
    setIsDemoModalOpen(false);
    document.body.style.overflow = 'auto';
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: ''
    });
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleGetStarted = (plan) => {
    window.location.href = `/signup?plan=${plan.toLowerCase()}`;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitDemo = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        closeDemoModal();
      } else {
        alert('Error: ' + (data.message || 'Something went wrong'));
      }
    } catch (error) {
      alert('Network error. Please check your connection.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp button handler
  const handleWhatsApp = () => {
    window.open('https://wa.me/923401227619', '_blank');
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
            <button className="nav-demo" onClick={openDemoModal}>Request Demo</button>
          </div>
          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </nav>

      {/* WhatsApp Floating Button */}
      <button className="whatsapp-float" onClick={handleWhatsApp}>
        <span className="whatsapp-icon">💬</span>
        <span className="whatsapp-text">Chat on WhatsApp</span>
      </button>

      {/* Demo Modal */}
      {isDemoModalOpen && (
        <div className="modal-overlay" onClick={closeDemoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDemoModal}>×</button>
            <div className="modal-header">
              <span className="modal-icon">✦</span>
              <h2>Request a Demo</h2>
              <p>Fill in your details and we'll get back to you within 24 hours</p>
            </div>
            <form className="modal-form" onSubmit={handleSubmitDemo}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Enter your company name"
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about your business needs"
                  rows="3"
                ></textarea>
              </div>
              <button type="submit" className="modal-submit" disabled={isSubmitting}>
                <span className="btn-icon">✦</span>
                {isSubmitting ? 'Submitting...' : 'Submit Demo Request'}
              </button>
            </form>
            <div className="modal-whatsapp">
              <span>Or contact us directly on</span>
              <button className="modal-whatsapp-btn" onClick={handleWhatsApp}>
                <span>💬</span> WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

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
              <button className="btn-primary" onClick={openDemoModal}>
                Request Free Demo
              </button>
              <button className="btn-secondary" onClick={handleLogin}>
                Login
              </button>
              <button className="btn-whatsapp" onClick={handleWhatsApp}>
                <span>💬</span> WhatsApp
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

      {/* How It Works */}
      <section id="about" className="how-it-works">
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2>Get Started in 3 Simple Steps</h2>
          <p>Start using MS TECHNO software quickly</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon">📝</div>
            <h3>Create Account</h3>
            <p>Sign up and choose your plan</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-icon">⚙️</div>
            <h3>Setup Your Shop</h3>
            <p>Configure your business settings</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon">🚀</div>
            <h3>Start Managing</h3>
            <p>Begin using the software</p>
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
            <button className="cta-primary" onClick={openDemoModal}>Request Demo</button>
            <button className="cta-secondary" onClick={handleLogin}>Login</button>
            <button className="cta-whatsapp" onClick={handleWhatsApp}>
              <span>💬</span> WhatsApp
            </button>
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
            <a href="#features" onClick={(e) => smoothScroll(e, '#features')}>Features</a>
            <a href="#pricing" onClick={(e) => smoothScroll(e, '#pricing')}>Pricing</a>
            <a href="#contact" onClick={(e) => smoothScroll(e, '#contact')}>Demo</a>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <a href="#" onClick={handleLogin}>Login</a>
            <a href="#" onClick={openDemoModal}>Request Demo</a>
            <a href="#" onClick={handleWhatsApp}>WhatsApp</a>
            <a href="#contact" onClick={(e) => smoothScroll(e, '#contact')}>Contact</a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📞 0340-1227619</p>
            <p>📍 Karachi, Pakistan</p>
            <button className="footer-whatsapp" onClick={handleWhatsApp}>
              💬 Chat on WhatsApp
            </button>
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