// Remove React Native imports
// import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
// Import DashboardLayout (make sure this is a web component)
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import '../../../styles/WebPage.css';

const WebPage = () => {
  return (
    <DashboardLayout>
      <div className="scroll-container">
        <div className="hero">
          <h1 className="hero-title">The Future of Digital Payments</h1>
          <p className="hero-subtitle">
            Secure, fast, and convenient payment solutions for everyone
          </p>
          <button className="hero-button">
            <span className="hero-button-text">Get Started</span>
          </button>
        </div>
        
        <div className="features-container">
          <h2 className="section-title">Key Features</h2>
          <div className="features">
            <div className="feature-card">
              <div className="feature-icon-container">
                <span className="feature-icon">🔒</span>
              </div>
              <h3 className="feature-title">Enhanced Security</h3>
              <p className="feature-description">
                State-of-the-art encryption and authentication protocols
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-container">
                <span className="feature-icon">⚡</span>
              </div>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-description">
                Complete transactions in seconds, not minutes
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-container">
                <span className="feature-icon">🌐</span>
              </div>
              <h3 className="feature-title">Global Access</h3>
              <p className="feature-description">
                Use your XS Card anywhere in the world
              </p>
            </div>
          </div>
        </div>
        
        <footer className="footer">
          <p className="footer-text">© 2023 XS Card. All rights reserved.</p>
          <p className="footer-text">Privacy Policy | Terms of Service</p>
        </footer>
      </div>
    </DashboardLayout>
  );
};

// Add a CSS file import for styles
// Create this file with the styles converted from React Native
import '../styles/WebPage.css';

export default WebPage;
