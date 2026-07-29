// landing.jsx
import React, { useEffect, useRef, useState } from 'react';
import './landing.css';
import { 
  TrendingUp, 
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
  ShoppingBag,
  Layers,
  CheckCircle,
  Sparkles,
  MoveRight,
  Building2,
  Store,
  Globe,
  Award,
  ChevronRight
} from 'lucide-react';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

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

    // Mouse tracking for parallax
    const handleMouseMove = (e) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Auto rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 4000);

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/923001234567?text=Hi!%20I%20want%20to%20book%20a%20demo%20for%20ProBilling', '_blank');
  };

  const stats = [
    { number: '500+', label: 'Active Businesses' },
    { number: '99.9%', label: 'Uptime' },
    { number: '4.9★', label: 'User Rating' },
  ];

  const rotatingFeatures = [
    'Smart Billing',
    'Real-time Inventory',
    'Analytics & Reports',
    'Customer Management',
    'Cloud Backup',
    'Multi-store Support'
  ];

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
              <MoveRight size={16} />
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

      {/* Hero Section with Dynamic Effects */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-bg">
          <div className="gradient-sphere" 
               style={{ 
                 transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * 40}px)`
               }}
          />
          <div className="gradient-sphere-2"
               style={{ 
                 transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`
               }}
          />
          <div className="grid-pattern" />
        </div>

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <div className="pulse-dot"></div>
              <span>Trusted by 500+ Businesses</span>
            </div>

            <h1 className="hero-title">
              The Future of
              <span className="hero-highlight">
                <span className="rotating-text">{rotatingFeatures[activeFeature]}</span>
              </span>
              <span className="hero-sub-text">for Your Business</span>
            </h1>

            <p className="hero-description">
              ProBilling is the modern POS solution that combines intelligent billing,
              real-time inventory, and powerful analytics in one seamless platform.
            </p>

            <div className="hero-actions">
              <div className="hero-buttons">
                <button className="btn-primary btn-large btn-glow">
                  Book Demo
                  <ArrowRight size={18} />
                </button>
                <button className="btn-secondary btn-large">Login</button>
              </div>
              
              <div className="hero-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="hero-stat">
                    <span className="stat-number">{stat.number}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-dashboard">
            <div className="dashboard-container">
              <div className="dashboard-glow" />
              <div className="dashboard-mockup">
                <div className="dashboard-header">
                  <div className="header-left">
                    <div className="dashboard-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="dashboard-title">ProBilling Dashboard</span>
                  </div>
                  <div className="header-right">
                    <span className="live-badge">● Live</span>
                  </div>
                </div>

                <div className="dashboard-main">
                  <div className="dashboard-widgets">
                    <div className="widget widget-revenue floating-card" style={{ animationDelay: '0s' }}>
                      <div className="widget-icon revenue">💰</div>
                      <div className="widget-content">
                        <span className="widget-label">Revenue</span>
                        <span className="widget-value">$48,295</span>
                        <div className="widget-change positive">
                          <TrendingUp size={12} />
                          +12.5%
                        </div>
                      </div>
                    </div>

                    <div className="widget widget-orders floating-card" style={{ animationDelay: '0.3s' }}>
                      <div className="widget-icon orders">📦</div>
                      <div className="widget-content">
                        <span className="widget-label">Orders</span>
                        <span className="widget-value">1,284</span>
                        <div className="widget-change positive">
                          <TrendingUp size={12} />
                          +8.3%
                        </div>
                      </div>
                    </div>

                    <div className="widget widget-sales floating-card" style={{ animationDelay: '0.6s' }}>
                      <div className="widget-icon sales">💳</div>
                      <div className="widget-content">
                        <span className="widget-label">Sales</span>
                        <span className="widget-value">$32,450</span>
                        <div className="widget-change positive">
                          <TrendingUp size={12} />
                          +15.7%
                        </div>
                      </div>
                    </div>

                    <div className="widget widget-inventory floating-card" style={{ animationDelay: '0.9s' }}>
                      <div className="widget-icon inventory">📋</div>
                      <div className="widget-content">
                        <span className="widget-label">Inventory</span>
                        <span className="widget-value">3,842</span>
                        <div className="widget-change neutral">In Stock</div>
                      </div>
                    </div>

                    <div className="widget widget-wide floating-card" style={{ animationDelay: '0.4s' }}>
                      <div className="widget-icon">📊</div>
                      <div className="widget-content">
                        <span className="widget-label">Today's Performance</span>
                        <div className="performance-bar">
                          <div className="bar-fill" style={{ width: '78%' }}></div>
                        </div>
                        <div className="performance-labels">
                          <span>$8,450</span>
                          <span>Target: $12,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Interactive Cards */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header animate-on-scroll" id="features-header">
            <div className="section-badge">
              <Sparkles size={14} />
              Features
            </div>
            <h2 className="section-title">Everything You Need to Scale</h2>
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
                <div className="feature-number">0{index + 1}</div>
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">{feature.icon}</div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-link">
                  <span>Learn more</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section with Dynamic Cards */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-container">
          <div className="section-header animate-on-scroll" id="pricing-header">
            <div className="section-badge">Pricing</div>
            <h2 className="section-title">Choose Your Plan</h2>
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
                  <div className="plan-icon">{plan.icon}</div>
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

          <div className="pricing-note animate-on-scroll" id="pricing-note">
            <p>All plans include a 14-day free trial. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* CTA Section with Dynamic Background */}
      <section className="cta-section">
        <div className="cta-container animate-on-scroll" id="cta">
          <div className="cta-content">
            <div className="cta-badge">
              <span>🚀 Get Started</span>
            </div>
            <h2 className="cta-title">Ready to Transform Your Business?</h2>
            <p className="cta-subtitle">
              Join 500+ businesses already using ProBilling to manage their operations efficiently.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary btn-large btn-glow">
                Book Demo
                <ArrowRight size={18} />
              </button>
              <button className="btn-secondary btn-large">Login</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Social Links */}
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
                <a href="#" className="social-link">
                  <span>FB</span>
                </a>
                <a href="#" className="social-link">
                  <span>IG</span>
                </a>
                <a href="#" className="social-link">
                  <span>LI</span>
                </a>
                <a href="#" className="social-link">
                  <span>YT</span>
                </a>
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
            <p>© 2024 ProBilling. All rights reserved. Made with ❤️ in Pakistan</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button with Hover Effects */}
      <button className="whatsapp-button" onClick={handleWhatsAppClick}>
        <div className="whatsapp-ring"></div>
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
    icon: <TrendingUp size={22} />, 
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
    icon: <Cloud size={22} />, 
    title: 'Cloud Backup', 
    description: 'Automatic backup ensures your business data is always safe.' 
  },
  { 
    icon: <CreditCard size={22} />, 
    title: 'Credit Management', 
    description: 'Handle credit sales and manage customer payments efficiently.' 
  },
  { 
    icon: <Store size={22} />, 
    title: 'Multi-store Support', 
    description: 'Manage multiple store locations from a single dashboard.' 
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '2,500',
    icon: <Building2 size={24} />,
    description: 'Perfect for small businesses just getting started',
    features: [
      '500 transactions/month',
      'Basic inventory',
      'Single user access',
      'Email support',
      '1 store location'
    ],
    popular: false,
  },
  {
    name: 'Business',
    price: '3,500',
    icon: <Store size={24} />,
    description: 'The most popular choice for growing businesses',
    features: [
      'Unlimited transactions',
      'Advanced inventory',
      'Multi-user access (5 users)',
      'Priority support',
      'Advanced reporting',
      '5 store locations'
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '4,500',
    icon: <Globe size={24} />,
    description: 'For large businesses with complex needs',
    features: [
      'Unlimited transactions',
      'Custom inventory solutions',
      'Unlimited users',
      '24/7 dedicated support',
      'API access',
      'Custom integrations',
      'Unlimited locations'
    ],
    popular: false,
  },
];

export default Landing;