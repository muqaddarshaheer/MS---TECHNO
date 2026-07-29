// landing.jsx
import React, { useEffect, useState } from 'react';
import './landing.css';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 3000);

    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const features = [
    { icon: '💳', title: 'POS Billing', desc: 'Fast and intuitive point-of-sale billing system' },
    { icon: '📦', title: 'Inventory', desc: 'Real-time inventory tracking and management' },
    { icon: '📊', title: 'Reports', desc: 'Comprehensive reports and analytics' },
    { icon: '📱', title: 'Barcode', desc: 'Integrated barcode scanning support' },
    { icon: '👥', title: 'Customers', desc: 'Complete customer management system' },
    { icon: '☁️', title: 'Cloud Backup', desc: 'Automatic cloud data backup' },
  ];

  const plans = [
    {
      name: 'Starter',
      price: '2,500',
      features: ['500 transactions', 'Basic inventory', 'Single user', 'Email support'],
      popular: false
    },
    {
      name: 'Business',
      price: '3,500',
      features: ['Unlimited transactions', 'Advanced inventory', '5 users', 'Priority support', 'Reports'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '4,500',
      features: ['Unlimited transactions', 'Custom inventory', 'Unlimited users', '24/7 support', 'API access'],
      popular: false
    }
  ];

  const rotatingTexts = ['Smart Billing', 'Inventory Management', 'Analytics', 'Customer Management', 'Cloud Backup', 'Multi-store'];

  return (
    <div className="app">
      {/* Navbar */}
      <nav className={`navbar ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="logo">
            <span className="logo-icon">P</span>
            <span className="logo-text">ProBilling</span>
          </div>
          
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#login">Login</a>
            <button className="btn-primary">Book Demo →</button>
          </div>

          <button className="menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {isMenuOpen && (
          <div className="mobile-menu">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#login">Login</a>
            <button className="btn-primary">Book Demo</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
        </div>

        <div className="hero-inner">
          <div className="hero-left">
            <div className="badge">
              <span className="dot"></span>
              Trusted by 500+ businesses
            </div>
            
            <h1>
              Modern Billing
              <br />
              <span className="highlight">{rotatingTexts[activeFeature]}</span>
              <br />
              for Your Business
            </h1>
            
            <p className="hero-desc">
              Streamline your billing, inventory, and customer management with our 
              all-in-one POS solution built for growing businesses.
            </p>
            
            <div className="hero-btns">
              <button className="btn-primary btn-large">Book Demo →</button>
              <button className="btn-secondary btn-large">Login</button>
            </div>

            <div className="stats">
              <div>
                <span className="num">500+</span>
                <span className="label">Businesses</span>
              </div>
              <div>
                <span className="num">99.9%</span>
                <span className="label">Uptime</span>
              </div>
              <div>
                <span className="num">4.9★</span>
                <span className="label">Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="dashboard">
              <div className="dash-header">
                <div className="dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="dash-title">Dashboard</span>
                <span className="live">● Live</span>
              </div>
              
              <div className="dash-grid">
                <div className="card card-1">
                  <span className="icon">💰</span>
                  <div>
                    <span className="label">Revenue</span>
                    <span className="value">$48,295</span>
                    <span className="change up">↑ 12.5%</span>
                  </div>
                </div>
                <div className="card card-2">
                  <span className="icon">📦</span>
                  <div>
                    <span className="label">Orders</span>
                    <span className="value">1,284</span>
                    <span className="change up">↑ 8.3%</span>
                  </div>
                </div>
                <div className="card card-3">
                  <span className="icon">💳</span>
                  <div>
                    <span className="label">Sales</span>
                    <span className="value">$32,450</span>
                    <span className="change up">↑ 15.7%</span>
                  </div>
                </div>
                <div className="card card-4">
                  <span className="icon">📋</span>
                  <div>
                    <span className="label">Inventory</span>
                    <span className="value">3,842</span>
                    <span className="change">In Stock</span>
                  </div>
                </div>
                <div className="card card-wide">
                  <span className="icon">📊</span>
                  <div>
                    <span className="label">Today's Performance</span>
                    <div className="bar">
                      <div className="bar-fill" style={{ width: '78%' }}></div>
                    </div>
                    <div className="bar-labels">
                      <span>$8,450</span>
                      <span>Target: $12,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="features-inner">
          <div className="section-header animate-on-scroll">
            <span className="tag">Features</span>
            <h2>Everything You Need to Scale</h2>
            <p>Powerful tools designed to streamline your business operations</p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card animate-on-scroll" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="f-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="f-link">Learn more →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing">
        <div className="pricing-inner">
          <div className="section-header animate-on-scroll">
            <span className="tag">Pricing</span>
            <h2>Choose Your Plan</h2>
            <p>Flexible pricing for businesses of every size</p>
          </div>

          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <div key={i} className={`pricing-card animate-on-scroll ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">★ Most Popular</div>}
                <h3>{plan.name}</h3>
                <div className="price">
                  <span className="currency">Rs.</span>
                  <span className="amount">{plan.price}</span>
                  <span className="period">/month</span>
                </div>
                <ul>
                  {plan.features.map((f, idx) => (
                    <li key={idx}>✓ {f}</li>
                  ))}
                </ul>
                <button className={`btn-${plan.popular ? 'primary' : 'secondary'} btn-full`}>
                  Get Started →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-inner animate-on-scroll">
          <h2>Ready to Grow Your Business?</h2>
          <p>Join 500+ businesses already using ProBilling to manage their operations.</p>
          <div className="cta-btns">
            <button className="btn-primary btn-large">Book Demo →</button>
            <button className="btn-secondary btn-large">Login</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="logo">
                <span className="logo-icon">P</span>
                <span className="logo-text">ProBilling</span>
              </div>
              <p>Modern billing software for growing businesses.</p>
              <div className="social">
                <a href="#">FB</a>
                <a href="#">IG</a>
                <a href="#">LI</a>
              </div>
            </div>
            <div className="footer-links">
              <div>
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#">Integrations</a>
              </div>
              <div>
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
              </div>
              <div>
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Documentation</a>
                <a href="#">Privacy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 ProBilling. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp */}
      <button className="whatsapp" onClick={() => window.open('https://wa.me/923001234567', '_blank')}>
        <span className="whatsapp-icon">💬</span>
        <span className="whatsapp-tooltip">Chat with us</span>
      </button>
    </div>
  );
};

export default Landing;