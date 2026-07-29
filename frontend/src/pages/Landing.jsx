// landing.jsx
import React, { useEffect, useRef, useState } from 'react';
import './landing.css';
import { 
  BarChart3, 
  Package, 
  FileText, 
  Barcode, 
  Users, 
  Receipt, 
  Cloud, 
  CreditCard,
  ArrowRight,
  Menu,
  X,
  Phone
} from 'lucide-react';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-icon">P</div>
            <span className="logo-text">ProBilling</span>
          </div>
          
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#login">Login</a>
            <button className="btn-primary btn-demo">Book Demo</button>
          </div>

          <button className="nav-mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="nav-mobile">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#login">Login</a>
            <button className="btn-primary btn-demo">Book Demo</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🚀 Trusted by 500+ businesses</span>
            </div>
            <h1 className="hero-title">
              Modern Billing Software
              <br />
              <span className="hero-highlight">For Growing Businesses</span>
            </h1>
            <p className="hero-subtitle">
              Streamline your billing, inventory, and customer management with 
              our all-in-one POS solution. Built for efficiency, designed for growth.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary btn-large">Book Demo</button>
              <button className="btn-secondary btn-large">Login</button>
            </div>
          </div>

          <div className="hero-dashboard">
            <div className="dashboard-mockup">
              <div className="dashboard-header">
                <div className="dashboard-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="dashboard-header-text">Dashboard</div>
              </div>
              
              <div className="dashboard-grid">
                <div className="stat-card floating-card" style={{ animationDelay: '0s' }}>
                  <div className="stat-icon revenue">📊</div>
                  <div className="stat-content">
                    <span className="stat-label">Revenue</span>
                    <span className="stat-value">$48,295</span>
                    <span className="stat-change positive">↑ 12.5%</span>
                  </div>
                </div>

                <div className="stat-card floating-card" style={{ animationDelay: '0.5s' }}>
                  <div className="stat-icon orders">📦</div>
                  <div className="stat-content">
                    <span className="stat-label">Orders</span>
                    <span className="stat-value">1,284</span>
                    <span className="stat-change positive">↑ 8.3%</span>
                  </div>
                </div>

                <div className="stat-card floating-card" style={{ animationDelay: '1s' }}>
                  <div className="stat-icon sales">💳</div>
                  <div className="stat-content">
                    <span className="stat-label">Sales</span>
                    <span className="stat-value">$32,450</span>
                    <span className="stat-change positive">↑ 15.7%</span>
                  </div>
                </div>

                <div className="stat-card floating-card" style={{ animationDelay: '1.5s' }}>
                  <div className="stat-icon inventory">📋</div>
                  <div className="stat-content">
                    <span className="stat-label">Inventory</span>
                    <span className="stat-value">3,842</span>
                    <span className="stat-change neutral">In Stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header animate-on-scroll" id="features-header">
            <h2 className="section-title">Everything you need to grow</h2>
            <p className="section-subtitle">
              Powerful features designed to streamline your business operations
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card animate-on-scroll" 
                id={`feature-${index}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-container">
          <div className="section-header animate-on-scroll" id="pricing-header">
            <h2 className="section-title">Simple, transparent pricing</h2>
            <p className="section-subtitle">
              Choose the plan that fits your business needs
            </p>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`pricing-card animate-on-scroll ${plan.popular ? 'popular' : ''}`}
                id={`pricing-${index}`}
              >
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                <div className="pricing-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="currency">Rs.</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">/month</span>
                  </div>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <button className={`btn-${plan.popular ? 'primary' : 'secondary'} btn-full`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="cta-container animate-on-scroll" id="cta">
          <h2 className="cta-title">Ready to Grow Your Business?</h2>
          <p className="cta-subtitle">
            Join thousands of businesses already using ProBilling to manage their operations.
          </p>
          <div className="cta-buttons">
            <button className="btn-primary btn-large">Book Demo</button>
            <button className="btn-secondary btn-large">Login</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-icon">P</div>
              <span className="logo-text">ProBilling</span>
              <p className="footer-description">
                Modern billing software for growing businesses.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#">Integrations</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Documentation</a>
                <a href="#">API Status</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ProBilling. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <button className="whatsapp-button">
        <Phone size={24} />
      </button>
    </div>
  );
};

const features = [
  { icon: <Receipt size={24} />, title: 'POS Billing', description: 'Fast and intuitive point-of-sale billing with barcode support.' },
  { icon: <Package size={24} />, title: 'Inventory Management', description: 'Real-time inventory tracking with low stock alerts.' },
  { icon: <BarChart3 size={24} />, title: 'Reports & Analytics', description: 'Comprehensive reports to track your business performance.' },
  { icon: <Barcode size={24} />, title: 'Barcode Scanning', description: 'Quick product lookup with integrated barcode scanner support.' },
  { icon: <Users size={24} />, title: 'Customer Management', description: 'Build customer profiles and track purchase history.' },
  { icon: <Receipt size={24} />, title: 'Expense Tracking', description: 'Monitor expenses and maintain accurate financial records.' },
  { icon: <Cloud size={24} />, title: 'Cloud Backup', description: 'Automatic cloud backup to keep your data safe.' },
  { icon: <CreditCard size={24} />, title: 'Credit Customers', description: 'Manage credit sales and customer payments.' },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '2,500',
    features: ['Up to 500 transactions/month', 'Basic inventory', 'Single user', 'Email support'],
    popular: false,
  },
  {
    name: 'Business',
    price: '3,500',
    features: ['Unlimited transactions', 'Advanced inventory', 'Multi-user access', 'Priority support', 'Advanced reporting'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '4,500',
    features: ['Unlimited transactions', 'Custom inventory', 'Unlimited users', '24/7 dedicated support', 'API access', 'Custom integrations'],
    popular: false,
  },
];

export default Landing;