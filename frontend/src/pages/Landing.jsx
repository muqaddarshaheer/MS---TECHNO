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
  Phone,
  Zap,
  TrendingUp,
  ShoppingBag,
  Layers,
  CheckCircle,
  Sparkles
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

  // WhatsApp floating button click handler
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/923001234567?text=Hi!%20I%20want%20to%20book%20a%20demo%20for%20ProBilling', '_blank');
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-icon">
              <Zap size={20} strokeWidth={2.5} />
            </div>
            <span className="logo-text">ProBilling</span>
          </div>
          
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#login">Login</a>
            <button className="btn-primary btn-demo">
              Book Demo
              <ArrowRight size={16} />
            </button>
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
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>Trusted by 500+ Businesses</span>
            </div>
            <h1 className="hero-title">
              Smart Billing
              <br />
              <span className="hero-highlight">Powered for Growth</span>
            </h1>
            <p className="hero-subtitle">
              The modern POS solution that combines intelligent billing, 
              real-time inventory, and powerful analytics in one seamless platform.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary btn-large">
                Book Demo
                <ArrowRight size={18} />
              </button>
              <button className="btn-secondary btn-large">Login</button>
            </div>
            
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Active Businesses</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">User Rating</span>
              </div>
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
                <div className="dashboard-header-text">Today's Overview</div>
                <div className="dashboard-header-badge">Live</div>
              </div>
              
              <div className="dashboard-grid">
                <div className="stat-card floating-card" style={{ animationDelay: '0s' }}>
                  <div className="stat-icon revenue">💰</div>
                  <div className="stat-content">
                    <span className="stat-label">Revenue</span>
                    <span className="stat-value">$48,295</span>
                    <div className="stat-change positive">
                      <TrendingUp size={12} />
                      +12.5%
                    </div>
                  </div>
                </div>

                <div className="stat-card floating-card" style={{ animationDelay: '0.4s' }}>
                  <div className="stat-icon orders">🛍️</div>
                  <div className="stat-content">
                    <span className="stat-label">Orders</span>
                    <span className="stat-value">1,284</span>
                    <div className="stat-change positive">
                      <TrendingUp size={12} />
                      +8.3%
                    </div>
                  </div>
                </div>

                <div className="stat-card floating-card" style={{ animationDelay: '0.8s' }}>
                  <div className="stat-icon sales">💳</div>
                  <div className="stat-content">
                    <span className="stat-label">Sales</span>
                    <span className="stat-value">$32,450</span>
                    <div className="stat-change positive">
                      <TrendingUp size={12} />
                      +15.7%
                    </div>
                  </div>
                </div>

                <div className="stat-card floating-card" style={{ animationDelay: '1.2s' }}>
                  <div className="stat-icon inventory">📦</div>
                  <div className="stat-content">
                    <span className="stat-label">Inventory</span>
                    <span className="stat-value">3,842</span>
                    <div className="stat-change neutral">In Stock</div>
                  </div>
                </div>

                <div className="stat-card stat-card-wide floating-card" style={{ animationDelay: '0.6s' }}>
                  <div className="stat-icon sales">📊</div>
                  <div className="stat-content">
                    <span className="stat-label">Today's Sales</span>
                    <div className="sales-bar">
                      <div className="sales-bar-fill" style={{ width: '78%' }}></div>
                    </div>
                    <div className="sales-bar-labels">
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

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header animate-on-scroll" id="features-header">
            <div className="section-badge">Features</div>
            <h2 className="section-title">Everything you need to scale</h2>
            <p className="section-subtitle">
              Powerful tools designed to streamline your business operations
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card animate-on-scroll" 
                id={`feature-${index}`}
                style={{ transitionDelay: `${index * 0.08}s` }}
              >
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">{feature.icon}</div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-link">
                  <span>Learn more</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-container">
          <div className="section-header animate-on-scroll" id="pricing-header">
            <div className="section-badge">Pricing</div>
            <h2 className="section-title">Choose your plan</h2>
            <p className="section-subtitle">
              Flexible pricing for businesses of every size
            </p>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`pricing-card animate-on-scroll ${plan.popular ? 'popular' : ''}`}
                id={`pricing-${index}`}
              >
                {plan.popular && (
                  <div className="popular-badge">
                    <Sparkles size={12} />
                    Most Popular
                  </div>
                )}
                <div className="pricing-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="currency">Rs.</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">/month</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <CheckCircle size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`btn-${plan.popular ? 'primary' : 'secondary'} btn-full`}>
                  Get Started
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="cta-container animate-on-scroll" id="cta">
          <div className="cta-content">
            <h2 className="cta-title">Ready to transform your business?</h2>
            <p className="cta-subtitle">
              Join 500+ businesses already using ProBilling to manage their operations efficiently.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary btn-large">
                Book Demo
                <ArrowRight size={18} />
              </button>
              <button className="btn-secondary btn-large">Login</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-icon">
                <Zap size={20} strokeWidth={2.5} />
              </div>
              <span className="logo-text">ProBilling</span>
              <p className="footer-description">
                Modern billing software built for growing businesses in Pakistan.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link">FB</a>
                <a href="#" className="social-link">IG</a>
                <a href="#" className="social-link">LI</a>
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#">Integrations</a>
                <a href="#">Changelog</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Careers</a>
                <a href="#">Blog</a>
                <a href="#">Contact</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Documentation</a>
                <a href="#">API Status</a>
                <a href="#">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ProBilling. All rights reserved. Made with ❤️ in Pakistan</p>
          </div>
        </div>
      </footer>

      {/* Official WhatsApp Button with Glass Effect */}
      <button className="whatsapp-button" onClick={handleWhatsAppClick}>
        <div className="whatsapp-pulse"></div>
        <Phone size={24} strokeWidth={2} />
        <span className="whatsapp-tooltip">Chat with us</span>
      </button>
    </div>
  );
};

const features = [
  { 
    icon: <Receipt size={22} />, 
    title: 'Smart POS Billing', 
    description: 'Intuitive point-of-sale with barcode scanning and quick checkout.' 
  },
  { 
    icon: <Package size={22} />, 
    title: 'Real-time Inventory', 
    description: 'Track stock levels, set low stock alerts, and manage suppliers.' 
  },
  { 
    icon: <BarChart3 size={22} />, 
    title: 'Advanced Analytics', 
    description: 'Comprehensive reports with visual insights for better decisions.' 
  },
  { 
    icon: <Barcode size={22} />, 
    title: 'Barcode Integration', 
    description: 'Seamless barcode scanning for fast and accurate product lookup.' 
  },
  { 
    icon: <Users size={22} />, 
    title: 'Customer Management', 
    description: 'Build detailed customer profiles and track purchase history.' 
  },
  { 
    icon: <Receipt size={22} />, 
    title: 'Expense Tracking', 
    description: 'Monitor business expenses and maintain accurate financial records.' 
  },
  { 
    icon: <Cloud size={22} />, 
    title: 'Cloud Backup', 
    description: 'Automatic backup ensures your business data is always safe.' 
  },
  { 
    icon: <CreditCard size={22} />, 
    title: 'Credit Management', 
    description: 'Handle credit sales and manage customer payments efficiently.' 
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '2,500',
    description: 'Perfect for small businesses just getting started',
    features: ['500 transactions/month', 'Basic inventory', 'Single user access', 'Email support', '1 store location'],
    popular: false,
  },
  {
    name: 'Business',
    price: '3,500',
    description: 'The most popular choice for growing businesses',
    features: ['Unlimited transactions', 'Advanced inventory', 'Multi-user access (5 users)', 'Priority support', 'Advanced reporting', '5 store locations'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '4,500',
    description: 'For large businesses with complex needs',
    features: ['Unlimited transactions', 'Custom inventory solutions', 'Unlimited users', '24/7 dedicated support', 'API access', 'Custom integrations', 'Unlimited locations'],
    popular: false,
  },
];

export default Landing;