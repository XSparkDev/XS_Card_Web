import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/Navbar.css";

const NavBar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Navigation items
  const navItems = ["Home", "Features", "Pricing", "Contact"];

  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigate to a screen
  const navigateTo = (screen: string) => {
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    
    // Navigate to the selected screen
    switch(screen.toLowerCase()) {
      case 'home':
        navigate('/');
        break;
      case 'features':
        navigate('/features');
        break;
      case 'pricing':
        navigate('/pricing');
        break;
      case 'contact':
        navigate('/contact');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div 
          className="logo-container"
          onClick={() => navigateTo('Home')}
        >
          <div className="logo-icon">
            <span className="logo-text">X</span>
          </div>
          <span className="brand-name">XS Card</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <button
              key={item}
              className="nav-item"
              onClick={() => navigateTo(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="button-outline">
            Sign In
          </button>
          <button className="button-primary">
            <span>Get Started</span>
            <span className="icon-chevron-right">➔</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        ref={mobileMenuRef}
        className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}
      >
        <div className="mobile-menu-container">
          {/* Mobile Navigation */}
          <nav className="mobile-nav">
            {navItems.map((item) => (
              <button
                key={item}
                className="mobile-nav-item"
                onClick={() => navigateTo(item)}
              >
                {item}
              </button>
            ))}
          </nav>
          
          {/* Mobile Action Buttons */}
          <div className="mobile-action-buttons">
            <button className="mobile-button-outline">
              Sign In
            </button>
            <button className="mobile-button-primary">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
