import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription, 
  CardFooter,
  CardHeader,
  CardTitle,
} from "../UI/card";
import { Button } from "../UI/button";
import { Tabs, TabsList, TabsTrigger } from "../UI/tabs";
import { Badge } from "../UI/badge";
import { 
  FaCheck, FaCreditCard, FaCalendar, FaGlobe,
  FaShieldAlt, FaCog, FaStar
} from "react-icons/fa";
import "../../styles/Pricing.css";

// Import billing system integration
import { 
  fetchSubscriptionStatus,
  initializePayment
} from "../../services/billingService";
import { SubscriptionStatus } from "../../utils/api";
import { EnterpriseInquiryModal } from "../Billing/EnterpriseInquiryModal";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
    // Billing system integration
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  // Fetch user's current subscription and available plans
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setIsLoading(true);
        const subscription = await fetchSubscriptionStatus();
        setSubscriptionData(subscription);
        // We don't need to store plans in state since we're using static pricing
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // Handle Premium upgrade
  const handleUpgradeToPremium = async () => {
    if (subscriptionData?.plan === 'premium') {
      return; // Already on premium
    }    try {
      setIsUpgrading(true);
      const planId = billingCycle === 'monthly' ? 'MONTHLY_PLAN' : 'ANNUAL_PLAN';
      console.log('🎯 Attempting to upgrade to plan:', planId);
      
      const paymentData = await initializePayment(planId);
      console.log('💳 Payment data received:', paymentData);
      
      // Check different possible property names for the authorization URL
      const authUrl = paymentData.authorizationUrl || 
                     paymentData.authorization_url || 
                     paymentData.data?.authorizationUrl ||
                     paymentData.data?.authorization_url;
      
      console.log('🔗 Authorization URL:', authUrl);
      
      // Redirect to payment page
      if (authUrl) {
        console.log('🚀 Redirecting to:', authUrl);
        window.location.href = authUrl;
      } else {
        console.error('❌ No authorization URL found in response');
        alert('Payment initialization succeeded but no redirect URL was provided.');
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  // Handle Enterprise inquiry
  const handleEnterpriseInquiry = () => {
    setIsEnterpriseModalOpen(true);
  };

  // Handle Enterprise inquiry success
  const handleEnterpriseInquirySuccess = () => {
    setIsEnterpriseModalOpen(false);
    alert('Thank you! Our enterprise team will contact you within 24 hours.');
  };

  // Get button text based on current plan
  const getPremiumButtonText = () => {
    if (isUpgrading) return "Processing...";
    if (!subscriptionData) return "Upgrade to Premium";
    
    switch (subscriptionData.plan) {
      case 'premium':
        return "Current Plan";
      case 'enterprise':
        return "Downgrade to Premium";
      default:
        return "Upgrade to Premium";
    }
  };

  // Check if user can upgrade to premium
  const canUpgradeToPremium = () => {
    return subscriptionData?.plan !== 'premium' && !isUpgrading;
  };

  // Get plan pricing based on billing cycle
  const getPremiumPrice = () => {
    if (billingCycle === 'annual') {
      return { amount: "R1,800", period: "/year", savings: "Save R120" };
    }
    return { amount: "R159.99", period: "/month", savings: null };
  };

  if (isLoading) {
    return (
      <div className="pricing-container">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">Loading pricing information...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const premiumPrice = getPremiumPrice();

  return (
    <div className="pricing-container">
      <Card>
        <CardHeader className="pricing-header">
          <CardTitle>Pricing Plans</CardTitle>
          <CardDescription>
            Choose the right plan for your organization's needs with flexible options
          </CardDescription>
          {subscriptionData && (
            <div className="current-plan-indicator">
              <Badge variant="default">
                Current Plan: {subscriptionData.plan.charAt(0).toUpperCase() + subscriptionData.plan.slice(1)}
              </Badge>
            </div>
          )}
        </CardHeader>        <CardContent className="pricing-content">
          <div className="pricing-wrapper">
            <Tabs 
              value={billingCycle} 
              defaultValue="monthly"
              onValueChange={setBillingCycle}
              className="pricing-tabs"
            >
              <div className="tabs-container">
                <TabsList className="pricing-tabs-list">
                  <TabsTrigger value="monthly" onClick={() => setBillingCycle("monthly")}>
                    Monthly Billing
                  </TabsTrigger>
                  <TabsTrigger value="annual" onClick={() => setBillingCycle("annual")}>
                    Annual Billing {premiumPrice.savings && `(${premiumPrice.savings})`}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="plans-grid">
                {/* Free Plan */}
                <Card className={`plan-card ${subscriptionData?.plan === 'free' ? 'current-plan-card' : ''}`}>
                  {subscriptionData?.plan === 'free' && (
                    <div className="current-plan-badge">CURRENT PLAN</div>
                  )}
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
                    <Button 
                      className="plan-button" 
                      variant={subscriptionData?.plan === 'free' ? 'default' : 'outline'}
                      disabled={subscriptionData?.plan === 'free'}
                    >
                      {subscriptionData?.plan === 'free' ? 'Current Plan' : 'Downgrade'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className={`plan-card premium-card ${subscriptionData?.plan === 'premium' ? 'current-plan-card' : ''}`}>
                  {!subscriptionData?.plan || subscriptionData?.plan === 'free' ? (
                    <div className="popular-badge">POPULAR</div>
                  ) : subscriptionData?.plan === 'premium' ? (
                    <div className="current-plan-badge">CURRENT PLAN</div>
                  ) : null}
                  <CardHeader className="plan-header premium-header">
                    <CardTitle className="plan-title">Premium</CardTitle>
                    <div className="plan-price-container">
                      <div className="price-amount">{premiumPrice.amount}</div>
                      <div className="price-details">
                        <span className="price-period">{premiumPrice.period}</span>
                        {premiumPrice.savings && (
                          <div className="price-savings">{premiumPrice.savings} with annual billing</div>
                        )}
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
                    <Button 
                      className="plan-button"
                      onClick={handleUpgradeToPremium}
                      disabled={!canUpgradeToPremium()}
                    >
                      {getPremiumButtonText()}
                    </Button>
                    {subscriptionData?.plan !== 'premium' && (
                      <p className="trial-note">
                        Start with a 7-day free trial - no credit card required
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Enterprise Plan */}
                <Card className={`plan-card enterprise-card ${subscriptionData?.plan === 'enterprise' ? 'current-plan-card' : ''}`}>
                  {subscriptionData?.plan === 'enterprise' && (
                    <div className="current-plan-badge">CURRENT PLAN</div>
                  )}
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
                    <Button 
                      variant="outline" 
                      className="plan-button"
                      onClick={handleEnterpriseInquiry}
                      disabled={subscriptionData?.plan === 'enterprise'}
                    >
                      {subscriptionData?.plan === 'enterprise' ? 'Current Plan' : 'Contact Sales'}
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
            <Button 
              size="lg" 
              className="upgrade-button"
              onClick={handleUpgradeToPremium}
              disabled={!canUpgradeToPremium()}
            >
              {subscriptionData?.plan === 'premium' ? 'Manage Subscription' : 'Upgrade Now'}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="demo-button"
              onClick={handleEnterpriseInquiry}
            >
              Schedule a Demo
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Enterprise Inquiry Modal */}
      <EnterpriseInquiryModal
        isOpen={isEnterpriseModalOpen}
        onClose={() => setIsEnterpriseModalOpen(false)}
        onSuccess={handleEnterpriseInquirySuccess}
        inquiryType="pricing"
      />
    </div>
  );
};

export default Pricing;
