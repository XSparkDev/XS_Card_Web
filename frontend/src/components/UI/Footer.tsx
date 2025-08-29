import { Link } from "react-router-dom";
import "../../styles/Footer.css";

// Use react-icons instead of lucide-react
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import { FaEnvelope, FaLocationDot, FaPhone } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "Products",
      links: [
        { name: "Business Cards", href: "#" },
        { name: "Team Management", href: "#" },
        { name: "Enterprise", href: "#" },
        { name: "Pricing", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "API", href: "#" },
        { name: "Guides", href: "#" },
        { name: "Blog", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
      ],
    },
    {
      title: "Contact",
      links: [
        { name: "Support", href: "#" },
        { name: "Sales", href: "#" },
        { name: "Partners", href: "#" },
        { name: "Media", href: "#" },
      ],
    },
  ];
  
  const socialLinks = [
    { icon: FaFacebook, href: "#", label: "Facebook" },
    { icon: FaTwitter, href: "#", label: "Twitter" },
    { icon: FaLinkedin, href: "#", label: "LinkedIn" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company info column */}
          <div className="company-info">
            <Link to="/" className="footer-logo-link">
              <div className="footer-logo">
                <div className="footer-logo-text">X</div>
              </div>
              <span className="footer-brand">XSCard Enterprise</span>
            </Link>
            
            <p className="company-description">
              Modernize and streamline professional networking for teams and organizations 
              with our comprehensive digital business card solution.
            </p>
            
            <div className="contact-info">
              <div className="contact-item">
                <FaLocationDot className="contact-icon" />
                <span className="contact-text">
                  123 Business Park, Cape Town, 8001, South Africa
                </span>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <span className="contact-text">+27 12 345 6789</span>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <span className="contact-text">enterprise@xscard.com</span>
              </div>
            </div>
          </div>
          
          {/* Links columns */}
          {footerLinks.map((column) => (
            <div key={column.title} className="footer-links-column">
              <h3 className="footer-column-title">{column.title}</h3>
              <ul className="footer-links-list">
                {column.links.map((link) => (
                  <li key={link.name} className="footer-link-item">
                    <Link to={link.href} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright-text">
              © {currentYear} XSCard Enterprise. All rights reserved. POPIA Compliant.
            </p>
            
            <div className="social-links">
              {socialLinks.map((social, i) => (
                <Link 
                  key={i} 
                  to={social.href}
                  className="social-link"
                  aria-label={`${social.label} link`}
                >
                  <social.icon className="social-icon" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
