import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../UI/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Switch } from "../UI/switch";
import { Label } from "../UI/label";
import { Badge } from "../UI/badge";
import { Select } from "../UI/select";
import "../../styles/Settings.css";

// Import icons from react-icons
import { 
  FaBuilding, FaCreditCard, FaPalette, FaBell, 
  FaCheck, FaDownload, FaExclamationTriangle
} from "react-icons/fa";

// Import API utilities
import { 
  ENDPOINTS, 
  buildEnterpriseUrl, 
  getEnterpriseHeaders, 
  DEFAULT_ENTERPRISE_ID 
} from "../../utils/api";

// Import billing types
import { 
  SubscriptionStatus,
  BillingLog
} from "../../utils/api";

import {
  PaymentMethod,
  Invoice
} from "../../types/billing";

// Import billing API functions
import {
  fetchSubscriptionStatus,
  fetchBillingLogs,
  fetchPaymentMethods,
  fetchEnterpriseInvoices,
  downloadInvoice,
  formatCurrency,
  initializeTrialPayment
} from "../../services/billingService";

// Import safe date formatting
import { safeFormatDate } from "../../utils/api";

// Import useNavigate from react-router-dom if you're using React Router
import { useNavigate } from "react-router-dom";

// Import modal components
import { PaymentMethodModal } from "../Billing/PaymentMethodModal";
import { CancelSubscriptionModal } from "../Billing/CancelSubscriptionModal";
import { EnterpriseInquiryModal } from "../Billing/EnterpriseInquiryModal";

// Define interface for enterprise data
interface EnterpriseData {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logoUrl?: string;
  colorScheme?: string;
  companySize?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

const Settings = () => {
  // Add navigate function if using React Router
  const navigate = useNavigate();
  
  // Add a function to handle navigation to pricing page
  const goToPricing = () => {
    navigate("/pricing");
  };

  // Handle trial initialization
  const handleStartTrial = async () => {
    try {
      console.log('🔄 Starting premium trial...');
      const result = await initializeTrialPayment('MONTHLY_PLAN');
      
      if (result && result.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = result.authorization_url;
      } else {
        console.error('❌ No authorization URL received');
        alert('Error: Could not initialize trial payment. Please try again.');
      }
    } catch (error) {
      console.error('❌ Trial initialization failed:', error);
      alert('Error starting trial. Please try again or contact support.');
    }
  };

  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData>({
    id: DEFAULT_ENTERPRISE_ID,
    name: "",
    description: "",
    industry: "Technology",
    website: "",
    logoUrl: "",
    colorScheme: "#1B2B5B",
    companySize: "unknown",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: ""
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    mentions: true,
    teamUpdates: true
  });
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system",
    fontSize: "medium",
    compactView: false
  });  // Billing-related state variables
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionStatus | null>(null);
  const [billingLogs, setBillingLogs] = useState<BillingLog[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [enterpriseInvoices, setEnterpriseInvoices] = useState<Invoice[]>([]);
  const [isBillingLoading, setIsBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);  // Modal state management
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] = useState(false);
  const [isEnterpriseInquiryModalOpen, setIsEnterpriseInquiryModalOpen] = useState(false);
  const [isDemoRequestModalOpen, setIsDemoRequestModalOpen] = useState(false);
  const [paymentMethodToEdit, setPaymentMethodToEdit] = useState<PaymentMethod | null>(null);

  // Add this type to specify valid notification setting keys
  type NotificationSettingKey = keyof typeof notificationSettings;

  // Fetch enterprise data on component mount
  useEffect(() => {
    const fetchEnterpriseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const enterpriseId = localStorage.getItem('enterpriseId') || DEFAULT_ENTERPRISE_ID;
        const url = buildEnterpriseUrl(ENDPOINTS.GET_ENTERPRISE.replace(':enterpriseId', enterpriseId));
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, {
          method: 'GET',
          headers
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch enterprise data');
        }
        
        const data = await response.json();
        
        if (data.enterprise) {
          setEnterpriseData({
            id: data.enterprise.id,
            name: data.enterprise.name || "",
            description: data.enterprise.description || "",
            industry: data.enterprise.industry || "Technology",
            website: data.enterprise.website || "",
            logoUrl: data.enterprise.logoUrl || "",
            colorScheme: data.enterprise.colorScheme || "#1B2B5B",
            companySize: data.enterprise.companySize || "unknown",
            address: data.enterprise.address || {
              street: "",
              city: "",
              state: "",
              postalCode: "",
              country: ""
            }
          });
        }
      } catch (err) {
        console.error('Error fetching enterprise data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load enterprise data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnterpriseData();
  }, []);  // Fetch billing data on component mount
  const fetchBillingData = async () => {
    try {
      setIsBillingLoading(true);
      setBillingError(null);
      
      console.log('🔍 Fetching billing data...');
      
      // TEMPORARY: Uncomment the line below to test error handling
      // throw new Error('Test error - API unavailable');
      
      // Fetch subscription status (always needed)
      const subscriptionStatus = await fetchSubscriptionStatus();
      console.log('📊 Subscription status received:', subscriptionStatus);
      setSubscriptionData(subscriptionStatus);

      // Fetch additional data based on plan type (use the fetched data, not the state)
      if (subscriptionStatus && subscriptionStatus.plan === 'premium') {
        console.log('💎 Fetching premium plan data...');
        // Premium users need payment methods and billing logs
        const promises = [
          fetchPaymentMethods().then(setPaymentMethods),
          fetchBillingLogs().then(setBillingLogs)
        ];
        await Promise.allSettled(promises);
        console.log('✅ Premium plan data fetched');
      } else if (subscriptionStatus && subscriptionStatus.plan === 'enterprise') {
        console.log('🏢 Fetching enterprise plan data...');
        // Enterprise users need invoices
        const enterpriseInvoicesData = await fetchEnterpriseInvoices();
        setEnterpriseInvoices(enterpriseInvoicesData);
        console.log('✅ Enterprise plan data fetched');
      } else {
        console.log('🆓 Using free plan data');
      }
      
    } catch (error) {
      console.error('❌ Error fetching billing data:', error);
      setBillingError('Failed to load billing information');
    } finally {
      setIsBillingLoading(false);
      console.log('🏁 Billing data fetch completed');
    }
  };  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleEnterpriseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEnterpriseData({
        ...enterpriseData,
        address: {
          ...enterpriseData.address,
          [addressField]: value
        }
      });
    } else {
      setEnterpriseData({
        ...enterpriseData,
        [name]: value
      });
    }
  };

  const handleSaveEnterprise = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const enterpriseId = enterpriseData.id || DEFAULT_ENTERPRISE_ID;
      const url = buildEnterpriseUrl(ENDPOINTS.UPDATE_ENTERPRISE.replace(':enterpriseId', enterpriseId));
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: enterpriseData.name,
          description: enterpriseData.description,
          industry: enterpriseData.industry,
          website: enterpriseData.website,
          logoUrl: enterpriseData.logoUrl,
          colorScheme: enterpriseData.colorScheme,
          companySize: enterpriseData.companySize,
          address: enterpriseData.address
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update enterprise data');
      }
      
      const data = await response.json();
      
      if (data.enterprise) {
        setEnterpriseData({
          id: data.enterprise.id,
          name: data.enterprise.name || "",
          description: data.enterprise.description || "",
          industry: data.enterprise.industry || "Technology",
          website: data.enterprise.website || "",
          logoUrl: data.enterprise.logoUrl || "",
          colorScheme: data.enterprise.colorScheme || "#1B2B5B",
          companySize: data.enterprise.companySize || "unknown",
          address: data.enterprise.address || enterpriseData.address
        });
      }
      
      setSuccessMessage('Enterprise settings updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error saving enterprise data:', err);
      setError(err instanceof Error ? err.message : 'Failed to save enterprise data');
    } finally {
      setIsSaving(false);
    }
  };
  const handleToggleNotification = (setting: NotificationSettingKey) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };
    // Handle enterprise inquiry
  const handleEnterpriseInquiry = () => {
    setIsEnterpriseInquiryModalOpen(true);
  };

  // Handle demo request
  const handleDemoRequest = () => {
    setIsDemoRequestModalOpen(true);
  };

  // Render Free Plan Billing Content
  const renderFreePlanBilling = () => (
    <div className="billing-content">
      <div className="current-plan">
        <div className="plan-header">
          <div>
            <h3 className="plan-title">Free Plan</h3>
            <p className="plan-price">R0/month</p>
          </div>
          <Badge>Current Plan</Badge>
        </div>
        <div className="plan-features">
          <h4 className="features-title">What's included:</h4>
          <ul className="features-list">
            <li className="feature-item">
              <FaCheck className="feature-check" />
              1 basic digital business card
            </li>
            <li className="feature-item">
              <FaCheck className="feature-check" />
              Standard QR code sharing
            </li>
            <li className="feature-item">
              <FaCheck className="feature-check" />
              Email support within 48 hours
            </li>
            <li className="feature-item">
              <FaCheck className="feature-check" />
              Basic card customization options
            </li>
            <li className="feature-item">
              <FaCheck className="feature-check" />
              Up to 20 contacts
            </li>
          </ul>
        </div>
        <div className="upgrade-section">
          <h4>Ready to upgrade?</h4>
          <div className="upgrade-options">
            <Button onClick={goToPricing}>
              Upgrade to Premium - R159.99/month
            </Button>            <Button variant="outline" onClick={handleStartTrial}>
              Start Premium Trial (14 days free)
            </Button>
            <Button variant="outline" onClick={handleEnterpriseInquiry}>
              Contact Sales for Enterprise
            </Button>
          </div>
          <div className="demo-section">
            <h4>Want to see XSCard in action?</h4>
            <p>
              Schedule a personalized demo to see how XSCard can transform your business networking
            </p>
            <Button variant="outline" onClick={handleDemoRequest} className="demo-button">
              📅 Request Free Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
  // Render Premium Plan Billing Content (Enhanced for Phase 2)
  const renderPremiumPlanBilling = () => (
    <div className="billing-content">
      <div className="current-plan">
        <div className="plan-header">
          <div>
            <h3 className="plan-title">Premium Plan</h3>
            <p className="plan-price">{formatCurrency(subscriptionData?.amount || 159.99)}/month</p>
          </div>
          <Badge variant="default">
            {subscriptionData?.subscriptionStatus === 'trial' ? 'Trial' : 'Active'}
          </Badge>
        </div>
          <div className="subscription-details">
          <p>Next billing: {subscriptionData?.subscriptionEnd ? safeFormatDate(subscriptionData.subscriptionEnd) : 'N/A'}</p>
          <p>Status: {subscriptionData?.subscriptionStatus}</p>
          {subscriptionData?.subscriptionStatus === 'trial' && subscriptionData?.trialEndDate && (
            <p className="trial-info">
              Trial ends: {safeFormatDate(subscriptionData.trialEndDate)}
            </p>
          )}
        </div>
        
        {/* Payment Method Section */}
        <div className="payment-section">
          <h3 className="section-title">Payment Method</h3>
          {paymentMethods.length > 0 ? (
            <div className="payment-method">
              <div className="payment-info">
                <FaCreditCard className="payment-icon" />
                <div className="card-details">
                  <p className="card-number">•••• •••• •••• {paymentMethods[0].last4}</p>
                  <p className="card-expiry">
                    Expires {paymentMethods[0].expiryMonth}/{paymentMethods[0].expiryYear}
                  </p>
                  <p className="card-brand">{paymentMethods[0].brand?.toUpperCase() || 'CARD'}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleUpdatePaymentMethod()}>
                Update
              </Button>
            </div>
          ) : (
            <div className="no-payment-method">
              <p>No payment method on file</p>
              <Button size="sm" onClick={() => handleAddPaymentMethod()}>
                Add Payment Method
              </Button>
            </div>
          )}
        </div>
          {/* Billing History Section */}
        <div className="billing-history-section">
          <h3 className="section-title">Recent Billing Activity</h3>
          {billingLogs.length > 0 ? (
            <div className="billing-logs">
              {billingLogs
                .filter((log) => log && log.id && log.action) // Filter out invalid logs
                .slice(0, 5)
                .map((log) => (
                <div key={log.id} className="billing-log-item">
                  <div className="log-info">
                    <p className="log-action">{log.action.replace('_', ' ').toUpperCase()}</p>
                    <p className="log-date">{safeFormatDate(log.timestamp)}</p>
                  </div>
                  {log.details?.amount && (
                    <p className="log-amount">{formatCurrency(log.details.amount)}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-billing-history">No billing activity yet</p>
          )}
        </div>
        
        {/* Plan Actions */}
        <div className="plan-actions">
          <Button size="sm" variant="outline" onClick={() => handleCancelSubscription()}>
            Cancel Subscription
          </Button>
          <Button size="sm" variant="outline" onClick={handleEnterpriseInquiry}>
            Upgrade to Enterprise
          </Button>
          <Button size="sm" variant="outline" onClick={handleDemoRequest}>
            📅 Request Enterprise Demo
          </Button>
        </div>
      </div>
    </div>
  );
  // Render Enterprise Plan Billing Content (Enhanced for Phase 2)
  const renderEnterprisePlanBilling = () => (
    <div className="billing-content">
      <div className="current-plan enterprise-plan">
        <div className="plan-header">
          <div>
            <h3 className="plan-title">Enterprise Plan</h3>
            <p className="plan-price">Custom Pricing</p>
          </div>
          <Badge variant="default">Enterprise</Badge>
        </div>
        
        {/* Account Manager Section */}
        <div className="account-manager-section">
          <h4 className="section-title">Your Account Manager</h4>
          <div className="contact-card">
            <div className="manager-info">
              <p className="manager-name">John Smith</p>
              <p className="manager-email">john.smith@xscard.com</p>
              <p className="manager-phone">+27 11 123 4567</p>
            </div>
            <Button size="sm" onClick={() => handleContactAccountManager()}>
              Contact Manager
            </Button>
          </div>
        </div>
        
        {/* Billing & Invoices Section */}
        <div className="enterprise-billing">
          <h4 className="section-title">Billing & Invoices</h4>
          <p className="text-sm text-gray-600 mb-4">
            Your custom invoices are managed by your account manager
          </p>
            {enterpriseInvoices.length > 0 ? (
            <div className="invoice-list">
              {enterpriseInvoices.map((invoice) => (
                <div key={invoice.id} className="invoice-item" data-invoice-id={invoice.id}>
                  <div className="invoice-info">
                    <p className="invoice-date">{safeFormatDate(invoice.date)}</p>
                    <p className="invoice-number">{invoice.number}</p>                    <p className="invoice-description">
                      {invoice.lineItems?.[0]?.description || 'Enterprise Services'}
                    </p>
                  </div>
                  <div className="invoice-details">
                    <p className="invoice-amount">{formatCurrency(invoice.amount)}</p>
                    <div className="invoice-actions">
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : 'outline'} 
                        className={`invoice-status ${invoice.status}`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="download-button"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        title={`Download ${invoice.number}`}
                      >
                        <FaDownload className="download-icon" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-invoices">
              <p>No invoices available</p>
              <p className="text-sm text-gray-500">
                Contact your account manager for billing history
              </p>
            </div>
          )}
        </div>
        
        {/* Enterprise Features */}
        <div className="enterprise-features-section">
          <h4 className="section-title">Enterprise Features</h4>
          <ul className="features-list">
            <li className="feature-item">
              <FaCheck className="feature-check" />
              Unlimited users and business cards
            </li>
            <li className="feature-item">
              <FaCheck className="feature-check" />
              Advanced analytics and reporting
            </li>
            <li className="feature-item">
              <FaCheck className="feature-check" />
              Custom integrations and API access
            </li>
            <li className="feature-item">
              <FaCheck className="feature-check" />
              Dedicated account manager
            </li>
            <li className="feature-item">
              <FaCheck className="feature-check" />
              Priority support and SLA
            </li>
            <li className="feature-item">
              <FaCheck className="feature-check" />
              Custom invoicing and billing
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Dynamic billing content renderer
  const renderBillingContent = () => {
    if (isBillingLoading) {
      console.log('⏳ Billing loading...');
      return (
        <Card className="billing-loading">
          <CardContent className="p-8">
            <div className="text-center">Loading billing information...</div>
          </CardContent>
        </Card>
      );
    }

    if (billingError) {
      console.log('❌ Billing error:', billingError);
      return (
        <Card className="billing-error">
          <CardContent className="p-8">
            <div className="error-message">
              <FaExclamationTriangle className="error-icon" />
              <p>{billingError}</p>
              <Button onClick={() => {
                setIsBillingLoading(true);
                setBillingError(null);
                // Retry billing data fetch by refetching
                fetchBillingData();
              }} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Determine which billing view to show based on user's plan
    const userPlan = subscriptionData?.plan || 'free';
    console.log('🎯 Rendering billing content for plan:', userPlan, 'subscriptionData:', subscriptionData);
    
    switch (userPlan) {
      case 'free':
        console.log('🆓 Rendering free plan billing');
        return renderFreePlanBilling();
      case 'premium':
        console.log('💎 Rendering premium plan billing');
        return renderPremiumPlanBilling();
      case 'enterprise':
        console.log('🏢 Rendering enterprise plan billing');
        return renderEnterprisePlanBilling();
      default:
        console.log('❓ Unknown plan, defaulting to free plan billing');
        return renderFreePlanBilling();
    }
  };  // Phase 2: Enhanced billing action handlers
  const handleUpdatePaymentMethod = async () => {
    const mostRecentMethod = getMostRecentPaymentMethod();
    setPaymentMethodToEdit(mostRecentMethod);
    setIsPaymentMethodModalOpen(true);
  };
  
  const handleAddPaymentMethod = () => {
    setPaymentMethodToEdit(null);
    setIsPaymentMethodModalOpen(true);
  };
    const handleCancelSubscription = async () => {
    if (!subscriptionData?.subscriptionCode) {
      setBillingError('No active subscription found to cancel.');
      return;
    }
    setIsCancelSubscriptionModalOpen(true);
  };
  const handleContactAccountManager = () => {
    console.log('📧 Opening contact form for account manager...');
    
    const confirmed = window.confirm(
      '📧 Contact Account Manager\n\nThis will open your email client with a pre-filled message to your account manager.\n\nAccount Manager: John Smith\nEmail: john.smith@xscard.com\n\nClick OK to open email client.'
    );
    
    if (confirmed) {
      // In a real implementation, this could:
      // 1. Open an email client with pre-filled message
      // 2. Open a contact modal
      // 3. Navigate to a dedicated contact page
      const subject = encodeURIComponent('Enterprise Support Request');
      const body = encodeURIComponent('Hello John,\n\nI need assistance with my XSCard Enterprise account.\n\n[Please describe your request here]\n\nBest regards');
      window.open(`mailto:john.smith@xscard.com?subject=${subject}&body=${body}`, '_blank');
    }
  };
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      setBillingError(null);
      console.log('📄 Initiating invoice download:', invoiceId);
        // Show visual feedback
      const downloadBtn = document.querySelector(`[data-invoice-id="${invoiceId}"] .download-button`) as HTMLButtonElement;
      if (downloadBtn) {
        downloadBtn.innerHTML = '⏳';
        downloadBtn.disabled = true;
      }
      
      const downloadUrl = await downloadInvoice(invoiceId);
      
      console.log('✅ Invoice download completed:', downloadUrl);
      
      // Reset button state
      if (downloadBtn) {
        downloadBtn.innerHTML = '<svg class="download-icon">📄</svg>';
        downloadBtn.disabled = false;
      }
      
      // Show success message
      alert('✅ Invoice Downloaded!\n\nYour invoice has been downloaded successfully.\nCheck your Downloads folder for the PDF file.');
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setBillingError('Failed to download invoice');
      alert('❌ Download Failed\n\nWe encountered an error while downloading your invoice.\nPlease try again or contact your account manager.');
      
      // Reset button state on error
      const downloadBtn = document.querySelector(`[data-invoice-id="${invoiceId}"] .download-button`) as HTMLButtonElement;
      if (downloadBtn) {        downloadBtn.innerHTML = '<svg class="download-icon">📄</svg>';
        downloadBtn.disabled = false;
      }
    }
  };
  // Phase 2: User scenario testing (for development) - Currently unused but kept for future testing
  // const handleSwitchUserScenario = (scenario: string) => {
  //   console.log('🔄 Switching user scenario to:', scenario);
  //   setCurrentUserScenario(scenario);
  //   setMockUserScenario(scenario as 'free' | 'premium' | 'enterprise');
  //   
  //   // Show loading state briefly
  //   setIsBillingLoading(true);
  //   
  //   // Refresh billing data with new scenario
  //   setTimeout(() => {
  //     fetchBillingData();
  //   }, 200); // Small delay to show loading state
  // };
  // Modal success handlers
  const handlePaymentMethodSuccess = async () => {
    try {
      setBillingError(null);
      setIsPaymentMethodModalOpen(false);
      setPaymentMethodToEdit(null);
      
      // Refresh payment methods
      const updatedMethods = await fetchPaymentMethods();
      setPaymentMethods(updatedMethods);
      
      console.log('Payment method updated successfully');
    } catch (error) {
      console.error('Error refreshing payment methods:', error);
      setBillingError('Payment method was updated but failed to refresh the list');
    }
  };

  const handleCancelSubscriptionSuccess = async () => {
    try {
      setBillingError(null);
      setIsCancelSubscriptionModalOpen(false);
      
      // Refresh billing data to show updated status
      await fetchBillingData();
      
      console.log('Subscription cancelled successfully');
    } catch (error) {
      console.error('Error refreshing billing data:', error);
      setBillingError('Subscription was cancelled but failed to refresh billing information');
    }
  };

  const handleEnterpriseInquirySuccess = () => {
    setIsEnterpriseInquiryModalOpen(false);
    console.log('Enterprise inquiry submitted successfully');
  };

  const handleDemoRequestSuccess = () => {
    setIsDemoRequestModalOpen(false);
    console.log('Demo request submitted successfully');
    
    // Show a success message to the user
    alert('🎉 Demo Request Submitted!\n\nThank you for your interest in XSCard Enterprise.\n\nOur team will contact you within 24 hours to schedule your personalized demo.');
  };

  // Helper function to get the most recently used payment method
  const getMostRecentPaymentMethod = (): PaymentMethod | null => {
    if (!paymentMethods || paymentMethods.length === 0) {
      return null;
    }

    // First, try to find the default payment method
    const defaultMethod = paymentMethods.find(method => method.isDefault);
    if (defaultMethod) {
      return defaultMethod;
    }

    // If no default, find the most recently used one
    const methodsWithLastUsed = paymentMethods.filter(method => method.lastUsed);
    if (methodsWithLastUsed.length > 0) {
      return methodsWithLastUsed.reduce((mostRecent, current) => {
        const currentDate = new Date(current.lastUsed!);
        const mostRecentDate = new Date(mostRecent.lastUsed!);
        return currentDate > mostRecentDate ? current : mostRecent;
      });
    }

    // If no lastUsed dates, find the most recently created one
    const methodsWithCreatedAt = paymentMethods.filter(method => method.createdAt);
    if (methodsWithCreatedAt.length > 0) {
      return methodsWithCreatedAt.reduce((mostRecent, current) => {
        const currentDate = new Date(current.createdAt!);
        const mostRecentDate = new Date(mostRecent.createdAt!);
        return currentDate > mostRecentDate ? current : mostRecent;
      });
    }

    // Fallback to the first method
    return paymentMethods[0];
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-description">Manage your organization settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="settings-tabs">
        <TabsList className="settings-tabs-list">
          <TabsTrigger value="profile" className="settings-tab">
            <FaBuilding className="tab-icon" />
            <span className="tab-text">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="settings-tab">
            <FaCreditCard className="tab-icon" />
            <span className="tab-text">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="settings-tab">
            <FaBell className="tab-icon" />
            <span className="tab-text">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="settings-tab">
            <FaPalette className="tab-icon" />
            <span className="tab-text">Appearance</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="settings-tab-content">
          {isLoading ? (
            <Card className="profile-card">
              <CardContent className="p-8">
                <div className="text-center">Loading organization data...</div>
              </CardContent>
            </Card>
          ) : (
            <Card className="profile-card">
              <CardHeader>
                <CardTitle>Organization Profile</CardTitle>
                <CardDescription>
                  Manage your organization information and branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="error-message mb-4">
                    <FaExclamationTriangle className="mr-2" />
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="success-message mb-4">
                    <FaCheck className="mr-2" />
                    {successMessage}
                  </div>
                )}
                
                <div className="form-grid">
                  <div className="form-group">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={enterpriseData.name} 
                      onChange={handleEnterpriseChange} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="industry">Industry</Label>
                    <Select 
                      options={[
                        { value: "Technology", label: "Technology" },
                        { value: "Finance", label: "Finance" },
                        { value: "Healthcare", label: "Healthcare" },
                        { value: "Education", label: "Education" },
                        { value: "Retail", label: "Retail" }
                      ]}
                      value={enterpriseData.industry}
                      onChange={(e) => setEnterpriseData({...enterpriseData, industry: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select 
                      options={[
                        { value: "1-10", label: "1-10 employees" },
                        { value: "11-50", label: "11-50 employees" },
                        { value: "50-100", label: "50-100 employees" },
                        { value: "101-500", label: "101-500 employees" },
                        { value: "501+", label: "501+ employees" },
                        { value: "unknown", label: "Not specified" }
                      ]}
                      value={enterpriseData.companySize}
                      onChange={(e) => setEnterpriseData({...enterpriseData, companySize: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      name="website" 
                      value={enterpriseData.website} 
                      onChange={handleEnterpriseChange} 
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <Label htmlFor="description">Description</Label>
                  <textarea 
                    id="description" 
                    name="description" 
                    value={enterpriseData.description} 
                    onChange={handleEnterpriseChange} 
                    rows={4}
                    className="bio-input" 
                    placeholder="Brief description of your organization"
                  />
                </div>
                
                <div className="address-section mt-6">
                  <h3 className="section-title">Organization Address</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <Label htmlFor="street">Street Address</Label>
                      <Input 
                        id="street" 
                        name="address.street" 
                        value={enterpriseData.address?.street || ''} 
                        onChange={handleEnterpriseChange} 
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="address.city" 
                        value={enterpriseData.address?.city || ''} 
                        onChange={handleEnterpriseChange} 
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="state">State/Province</Label>
                      <Input 
                        id="state" 
                        name="address.state" 
                        value={enterpriseData.address?.state || ''} 
                        onChange={handleEnterpriseChange} 
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input 
                        id="postalCode" 
                        name="address.postalCode" 
                        value={enterpriseData.address?.postalCode || ''} 
                        onChange={handleEnterpriseChange} 
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" 
                        name="address.country" 
                        value={enterpriseData.address?.country || ''} 
                        onChange={handleEnterpriseChange} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="branding-section mt-6">
                  <h3 className="section-title">Organization Branding</h3>
                  <div className="branding-container">
                    <div className="logo-placeholder">
                      {enterpriseData.logoUrl ? (
                        <img src={enterpriseData.logoUrl} alt="Organization logo" className="logo-image" />
                      ) : (
                        <span>{enterpriseData.name ? enterpriseData.name.substring(0, 2).toUpperCase() : 'XS'}</span>
                      )}
                    </div>
                    <div className="logo-actions">
                      <Button size="sm" variant="outline" className="upload-button">Upload Logo</Button>
                      <p className="logo-hint">Recommended size: 512x512px</p>
                    </div>
                  </div>
                  
                  <div className="form-group mt-4">
                    <Label htmlFor="colorScheme">Brand Color</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        id="colorScheme" 
                        name="colorScheme" 
                        type="color" 
                        value={enterpriseData.colorScheme} 
                        onChange={handleEnterpriseChange} 
                        className="w-20 h-10"
                      />
                      <Input 
                        value={enterpriseData.colorScheme} 
                        onChange={handleEnterpriseChange}
                        name="colorScheme"
                        placeholder="#1B2B5B"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="form-actions">
                <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                <Button onClick={handleSaveEnterprise} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
          <TabsContent value="billing" className="settings-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>Manage your billing information and subscription plan</CardDescription>
            </CardHeader>
            <CardContent>              {/* Phase 2: Developer Testing Section (Remove in production) */}
              <div className="developer-testing-section mb-6 p-4 bg-gray-100 rounded-lg">
                <h5 className="text-xs font-semibold mb-2">🧪 Test Modal Functions:</h5>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleDemoRequest}
                  >
                    📅 Test Demo Request
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleEnterpriseInquiry}
                  >
                    🏢 Test Enterprise Inquiry
                  </Button>
                </div>
              </div>

              {renderBillingContent()}
              
              {/* Add Pricing section */}
              <div className="pricing-section">
                <h3 className="section-title">Plans & Pricing</h3>
                <div className="pricing-link-container">
                  <div className="pricing-link-info">
                    <h4 className="pricing-link-title">View Available Plans</h4>
                    <p className="pricing-link-description">
                      Compare plans and pricing to find the right fit for your business
                    </p>
                  </div>
                  <Button 
                    variant="link" 
                    className="pricing-link"
                    onClick={goToPricing}
                  >
                    Pricing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="settings-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="notification-settings">
                <div className="notification-channel">
                  <div className="channel-info">
                    <h3 className="channel-title">Email Notifications</h3>
                    <p className="channel-description">Receive updates via email</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications} 
                    onChange={() => handleToggleNotification('emailNotifications')}
                  />
                </div>
                
                <div className="notification-channel">
                  <div className="channel-info">
                    <h3 className="channel-title">Push Notifications</h3>
                    <p className="channel-description">Receive updates via push notifications</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.pushNotifications} 
                    onChange={() => handleToggleNotification('pushNotifications')}
                  />
                </div>
                
                <div className="notification-types">
                  <h3 className="section-title">Notification Types</h3>
                  
                  <div className="notification-list">
                    <div className="notification-type">
                      <div className="type-info">
                        <p className="type-title">Weekly Digest</p>
                        <p className="type-description">Receive a summary of activities each week</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.weeklyDigest} 
                        onChange={() => handleToggleNotification('weeklyDigest')}
                      />
                    </div>
                    
                    <div className="notification-type">
                      <div className="type-info">
                        <p className="type-title">Mentions & Comments</p>
                        <p className="type-description">When someone mentions you or comments on your cards</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.mentions} 
                        onChange={() => handleToggleNotification('mentions')}
                      />
                    </div>
                    
                    <div className="notification-type">
                      <div className="type-info">
                        <p className="type-title">Team Updates</p>
                        <p className="type-description">When changes are made to your team or department</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.teamUpdates} 
                        onChange={() => handleToggleNotification('teamUpdates')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="settings-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="appearance-settings">
                <div className="theme-section">
                  <h3 className="section-title">Theme</h3>
                  <div className="theme-options">
                    <div className={`theme-option ${appearanceSettings.theme === 'light' ? 'selected' : ''}`}
                         onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'light'})}>
                      <div className="theme-preview light-theme"></div>
                      <p className="theme-label">Light</p>
                    </div>
                    <div className={`theme-option ${appearanceSettings.theme === 'dark' ? 'selected' : ''}`}
                         onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'dark'})}>
                      <div className="theme-preview dark-theme"></div>
                      <p className="theme-label">Dark</p>
                    </div>
                    <div className={`theme-option ${appearanceSettings.theme === 'system' ? 'selected' : ''}`}
                         onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'system'})}>
                      <div className="theme-preview system-theme"></div>
                      <p className="theme-label">System</p>
                    </div>
                  </div>
                </div>
                
                <div className="font-size-section">
                  <h3 className="section-title">Font Size</h3>
                  <Select 
                    options={[
                      { value: "small", label: "Small" },
                      { value: "medium", label: "Medium" },
                      { value: "large", label: "Large" }
                    ]}
                    value={appearanceSettings.fontSize}
                    onChange={(e) => setAppearanceSettings({...appearanceSettings, fontSize: e.target.value})}
                    className="font-size-select"
                  />
                </div>
                
                <div className="compact-view-section">
                  <div className="view-info">
                    <h3 className="section-title">Compact View</h3>
                    <p className="view-description">Display more content with less spacing</p>
                  </div>
                  <Switch 
                    checked={appearanceSettings.compactView} 
                    onChange={() => setAppearanceSettings(
                      {...appearanceSettings, compactView: !appearanceSettings.compactView}
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>          </Card>
        </TabsContent>
      </Tabs>      {/* Modal Components */}
      <PaymentMethodModal
        isOpen={isPaymentMethodModalOpen}
        onClose={() => {
          setIsPaymentMethodModalOpen(false);
          setPaymentMethodToEdit(null);
        }}
        onSuccess={handlePaymentMethodSuccess}
        mode={paymentMethodToEdit ? 'update' : 'add'}        existingPaymentMethod={paymentMethodToEdit ? {
          id: paymentMethodToEdit.id,
          last4: paymentMethodToEdit.last4,
          brand: paymentMethodToEdit.brand || 'card',
          expiryMonth: paymentMethodToEdit.expiryMonth || 12,
          expiryYear: paymentMethodToEdit.expiryYear || 2025,
          cardholderName: paymentMethodToEdit.cardholderName,
          billingAddress: paymentMethodToEdit.billingAddress
        } : undefined}/>      {subscriptionData && subscriptionData.subscriptionCode && (
        <CancelSubscriptionModal
          isOpen={isCancelSubscriptionModalOpen}
          onClose={() => setIsCancelSubscriptionModalOpen(false)}
          onSuccess={handleCancelSubscriptionSuccess}
          subscriptionData={{
            code: subscriptionData.subscriptionCode, // Changed from subscriptionData.code to subscriptionData.subscriptionCode
            plan: subscriptionData.plan,
            amount: subscriptionData.amount || 0,
            subscriptionEnd: subscriptionData.subscriptionEnd
          }}
        />
      )}

      <EnterpriseInquiryModal
        isOpen={isEnterpriseInquiryModalOpen}
        onClose={() => setIsEnterpriseInquiryModalOpen(false)}
        onSuccess={handleEnterpriseInquirySuccess}
        inquiryType="upgrade"
      />

      <EnterpriseInquiryModal
        isOpen={isDemoRequestModalOpen}
        onClose={() => setIsDemoRequestModalOpen(false)}
        onSuccess={handleDemoRequestSuccess}
        inquiryType="demo"
      />
    </div>
  );
};

export default Settings;
