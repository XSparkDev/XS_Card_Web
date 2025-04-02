import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription, 
  CardFooter,
  CardHeader,
  CardTitle,
} from "../UI/card";
import { Button } from "../UI/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";
import { 
  FaCheck, FaCreditCard, FaCalendar, FaGlobe,
  FaShieldAlt, FaCog, FaStar, FaChevronRight
} from "react-icons/fa";
import "../../styles/Pricing.css";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <div className="pricing-container">
      <Card>
        <CardHeader className="pricing-header">
          <CardTitle>Pricing Plans</CardTitle>
          <CardDescription>
            Choose the right plan for your organization's needs with flexible options
          </CardDescription>
        </CardHeader>
        <CardContent className="pricing-content">
          <div className="pricing-wrapper">
            <Tabs defaultValue="monthly" className="pricing-tabs">
              <div className="tabs-container">
                <TabsList className="pricing-tabs-list">
                  <TabsTrigger value="monthly" onClick={() => setBillingCycle("monthly")}>
                    Monthly Billing
                  </TabsTrigger>
                  <TabsTrigger value="annual" onClick={() => setBillingCycle("annual")}>
                    Annual Billing (Save R120)
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="plans-grid">
                {/* Free Plan */}
                <Card className="plan-card">
                  <CardHeader className="plan-header free-header">
                    <CardTitle className="plan-title">Free</CardTitle>
                    <div className="plan-price">
                      <span className="price-amount">R0.00</span>
                      <span className="price-period">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="plan-content">
                    <ul className="features-list">
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Create one basic digital business card</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Standard QR code sharing</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Email support within 48 hours</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Basic card customisation options</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Share via link or QR code</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Maximum 20 contacts</span>
                      </li>
                    </ul>
                    <Button className="plan-button" variant="outline">
                      Current Plan
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className="plan-card premium-card">
                  <div className="popular-badge">
                    POPULAR
                  </div>
                  <CardHeader className="plan-header premium-header">
                    <CardTitle className="plan-title">Premium</CardTitle>
                    <div className="plan-price-container">
                      <div className="price-amount">R159.99</div>
                      <div className="price-details">
                        <span className="price-period">/user/month</span>
                        <div className="price-savings">
                          R1,800/year (Save R120 with annual billing)
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="plan-content">
                    <ul className="features-list">
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Create unlimited digital business cards</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Advanced customisation with custom branding</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Premium QR code designs with brand colours</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Basic analytics (scans, contacts)</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Priority email support within 12 hours</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Social media integration</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Multi-card web address link</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Direct calendar booking integration</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Team sharing (up to 5 team members)</span>
                      </li>
                    </ul>
                    <Button className="plan-button">
                      Upgrade to Premium
                    </Button>
                    <p className="trial-note">
                      Start with a 7-day free trial - no credit card required
                    </p>
                  </CardContent>
                </Card>

                {/* Enterprise Plan */}
                <Card className="plan-card enterprise-card">
                  <CardHeader className="plan-header enterprise-header">
                    <CardTitle className="plan-title">Enterprise</CardTitle>
                    <div className="plan-price-container">
                      <div className="custom-price">Custom Pricing</div>
                      <div className="price-details">
                        <div className="price-description">
                          Tailored for your organization's needs
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="plan-content">
                    <ul className="features-list">
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>All Premium features included</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Dedicated account manager</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Custom API integration</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Advanced security features</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Custom branding and white-label options</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Unlimited team members</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>SSO integration</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>Custom analytics dashboard</span>
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-icon" />
                        <span>24/7 priority support</span>
                      </li>
                    </ul>
                    <Button variant="outline" className="plan-button">
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </Tabs>

            <div className="additional-info">
              <h3 className="info-title">Additional Information</h3>
              <div className="info-grid">
                <div className="info-section">
                  <div className="info-item">
                    <FaCreditCard className="info-icon" />
                    <div className="info-content">
                      <h4 className="info-item-title">Billing</h4>
                      <p className="info-description">
                        All prices are exclusive of VAT with secure payment processing through major South African banks.
                      </p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <FaCalendar className="info-icon" />
                    <div className="info-content">
                      <h4 className="info-item-title">Subscription Terms</h4>
                      <p className="info-description">
                        Monthly plans can be cancelled at any time. Annual plans offer significant savings.
                      </p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <FaStar className="info-icon" />
                    <div className="info-content">
                      <h4 className="info-item-title">Free Trial</h4>
                      <p className="info-description">
                        All paid plans come with a 7-day free trial with full access to features.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="info-section">
                  <div className="info-item">
                    <FaGlobe className="info-icon" />
                    <div className="info-content">
                      <h4 className="info-item-title">Local Billing</h4>
                      <p className="info-description">
                        All transactions are processed in ZAR (South African Rand).
                      </p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <FaShieldAlt className="info-icon" />
                    <div className="info-content">
                      <h4 className="info-item-title">Compliance</h4>
                      <p className="info-description">
                        XS Card is fully compliant with POPIA regulations for data protection.
                      </p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <FaCog className="info-icon" />
                    <div className="info-content">
                      <h4 className="info-item-title">Enterprise Options</h4>
                      <p className="info-description">
                        Enterprise plans are fully customizable based on specific business needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pricing-footer">
          <div className="footer-buttons">
            <Button size="lg" className="upgrade-button">
              Upgrade Now
            </Button>
            <Button variant="outline" size="lg" className="demo-button">
              Schedule a Demo
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Pricing;
