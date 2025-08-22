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
  fetchPremiumInvoices,
  exportInvoicePDF,
  exportInvoiceCSV,
  formatCurrency,
  formatDate,
  // Commenting out unused imports
  // setMockUserScenario,
  getCurrentUserScenario
} from "../../services/billingService";

// Import useNavigate from react-router-dom if you're using React Router
import { useNavigate } from "react-router-dom";

// Import modal components
import { PaymentMethodModal } from "../Billing/PaymentMethodModal";
import { CancelSubscriptionModal } from "../Billing/CancelSubscriptionModal";
import { EnterpriseInquiryModal } from "../Billing/EnterpriseInquiryModal";
import { InvoiceViewModal } from "../Billing/InvoiceViewModal";

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
    province?: string;
    postal_code?: string;
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

  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData>({
    id: DEFAULT_ENTERPRISE_ID,
    name: "",
    description: "",
    industry: "Tech",
    website: "",
    logoUrl: "",
    colorScheme: "#1B2B5B",
    companySize: "unknown",
    address: {
      street: "",
      city: "",
      province: "",
      postal_code: "",
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


  // Color selector state (same as BusinessCards)
  const [selectedTheme, setSelectedTheme] = useState(enterpriseData.colorScheme || '#1B2B5B');
  const [customColor, setCustomColor] = useState(enterpriseData.colorScheme || '#1B2B5B');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Color themes (same as BusinessCards)
  const themes = [
    '#1B2B5B', // Navy Blue
    '#E63946', // Red
    '#2A9D8F', // Teal
    '#E9C46A', // Yellow
    '#F4A261', // Orange
    '#6D597A', // Purple
    '#355070', // Dark Blue
    '#B56576', // Pink
    '#4DAA57', // Green
    '#264653', // Dark Teal
    '#FF4B6E'  // Pinkish red
  ];

  // Update enterprise data when theme changes
  useEffect(() => {
    setEnterpriseData(prev => ({ ...prev, colorScheme: selectedTheme }));
  }, [selectedTheme]);

  // Billing-related state variables
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionStatus | null>(null);
  const [billingLogs, setBillingLogs] = useState<BillingLog[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [enterpriseInvoices, setEnterpriseInvoices] = useState<Invoice[]>([]);
  const [premiumInvoices, setPremiumInvoices] = useState<Invoice[]>([]);
  const [isBillingLoading, setIsBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);
  // Phase 2: Enhanced state for testing different user scenarios
  // currentUserScenario is used by development/testing code that's commented out
  const [, setCurrentUserScenario] = useState<string>('premium');

  // Modal state management
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] = useState(false);
  const [isEnterpriseInquiryModalOpen, setIsEnterpriseInquiryModalOpen] = useState(false);
  const [isDemoRequestModalOpen, setIsDemoRequestModalOpen] = useState(false);
  const [isInvoiceViewModalOpen, setIsInvoiceViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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
        console.log('Enterprise API Response:', data);
        
        // Handle the API response format: { status: true, data: { enterprise: {...} } }
        if (data.status && data.data && data.data.enterprise) {
          const enterprise = data.data.enterprise;
          setEnterpriseData({
            id: enterprise.id,
            name: enterprise.name || "",
            description: enterprise.description || "",
            industry: enterprise.industry || "Tech",
            website: enterprise.website || "",
            logoUrl: enterprise.logoUrl || "",
            colorScheme: enterprise.colorScheme || "#1B2B5B",
            companySize: enterprise.companySize || "unknown",
            address: {
              street: enterprise.address?.street || "",
              city: enterprise.address?.city || "",
              province: enterprise.address?.province || "",
              postal_code: enterprise.address?.postal_code || "",
              country: enterprise.address?.country || ""
            }
          });
        } else {
          // Fallback for different response format or missing data
          console.warn('Unexpected API response format:', data);
          throw new Error('Invalid response format from enterprise API');
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
      
      // Fetch subscription status (always needed)
      const subscriptionStatus = await fetchSubscriptionStatus();
      setSubscriptionData(subscriptionStatus);

      // Fetch additional data based on plan type (use the fetched data, not the state)
      if (subscriptionStatus && subscriptionStatus.plan === 'premium') {
        // Premium users need payment methods, billing logs, and invoices
        const paymentMethodsData = await fetchPaymentMethods();
        setPaymentMethods(paymentMethodsData);
        
        const billingLogsData = await fetchBillingLogs();
        setBillingLogs(billingLogsData);
        
        const premiumInvoicesData = await fetchPremiumInvoices();
        console.log('🔍 Premium invoices fetched:', premiumInvoicesData);
        setPremiumInvoices(premiumInvoicesData);
      } else if (subscriptionStatus && subscriptionStatus.plan === 'enterprise') {
        // Enterprise users need invoices
        const enterpriseInvoicesData = await fetchEnterpriseInvoices();
        setEnterpriseInvoices(enterpriseInvoicesData);
      }
      
    } catch (error) {
      console.error('Error fetching billing data:', error);
      setBillingError('Failed to load billing information');
    } finally {
      setIsBillingLoading(false);
    }
  };
  useEffect(() => {
    fetchBillingData();
    // Initialize current scenario from the billing API
    setCurrentUserScenario(getCurrentUserScenario());
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

  // Handle logo upload (using same pattern as BusinessCards)
  const handleLogoUpload = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG)');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // For preview, convert to Data URL (same as BusinessCards)
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setEnterpriseData(prev => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  // Handle logo removal (using same pattern as BusinessCards)
  const handleLogoRemove = () => {
    if (!enterpriseData.logoUrl) return;
    
    if (!window.confirm('Are you sure you want to remove the logo?')) {
      return;
    }

    // Update local state immediately for UI responsiveness (same as BusinessCards)
    setEnterpriseData(prev => ({ ...prev, logoUrl: '' }));
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const handleSaveEnterprise = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const enterpriseId = enterpriseData.id || DEFAULT_ENTERPRISE_ID;
      const url = buildEnterpriseUrl(ENDPOINTS.UPDATE_ENTERPRISE.replace(':enterpriseId', enterpriseId));
      const headers = getEnterpriseHeaders();
      
      // Check if logoUrl is a data URL (newly uploaded image)
      const isDataUrl = enterpriseData.logoUrl?.startsWith('data:image/');
      
      let requestBody;
      
      if (isDataUrl) {
        // If it's a data URL, we need to convert it back to a file and use FormData
        // For now, we'll save it as a data URL (same as BusinessCards approach)
        requestBody = JSON.stringify({
          name: enterpriseData.name,
          description: enterpriseData.description,
          industry: enterpriseData.industry,
          website: enterpriseData.website,
          logoUrl: enterpriseData.logoUrl,
          colorScheme: enterpriseData.colorScheme,
          companySize: enterpriseData.companySize,
          address: enterpriseData.address
        });
      } else {
        // Regular JSON data
        requestBody = JSON.stringify({
          name: enterpriseData.name,
          description: enterpriseData.description,
          industry: enterpriseData.industry,
          website: enterpriseData.website,
          logoUrl: enterpriseData.logoUrl,
          colorScheme: enterpriseData.colorScheme,
          companySize: enterpriseData.companySize,
          address: enterpriseData.address
        });
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: requestBody
      });
      
      if (!response.ok) {
        throw new Error('Failed to update enterprise data');
      }
      
      const data = await response.json();
      console.log('Enterprise Save Response:', data);
      
      // Handle the API response format: { status: true, data: { enterprise: {...} } }
      if (data.status && data.data && data.data.enterprise) {
        const enterprise = data.data.enterprise;
        setEnterpriseData({
          id: enterprise.id,
          name: enterprise.name || "",
          description: enterprise.description || "",
          industry: enterprise.industry || "Tech",
          website: enterprise.website || "",
          logoUrl: enterprise.logoUrl || "",
          colorScheme: enterprise.colorScheme || "#1B2B5B",
          companySize: enterprise.companySize || "unknown",
          address: {
            street: enterprise.address?.street || "",
            city: enterprise.address?.city || "",
            province: enterprise.address?.province || "",
            postal_code: enterprise.address?.postal_code || "",
            country: enterprise.address?.country || ""
          }
        });
      } else {
        console.warn('Unexpected save response format:', data);
        // Still show success message even if response format is unexpected
        // as long as the request was successful (200 status)
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
              Upgrade to Premium - Starting at R159.99/month
            </Button>
            <Button variant="outline" onClick={() => alert('Premium Trial: Start your 14-day free trial with full premium features!')}>
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
            <p className="plan-price">
              {formatCurrency(subscriptionData?.amount || 159.99)}
              {/* Use the subscriptionPlan to determine billing period */}
              {(subscriptionData?.subscriptionPlan?.includes('annual') || 
                subscriptionData?.subscriptionPlan?.includes('yearly')) 
                ? '/year' : '/month'}
            </p>
          </div>
          <Badge variant="default">
            {subscriptionData?.subscriptionStatus === 'trial' ? 'Trial' : 'Active'}
          </Badge>
        </div>
          <div className="subscription-details">
          <p>Next billing: {subscriptionData?.subscriptionEnd ? formatDate(subscriptionData.subscriptionEnd) : 'N/A'}</p>
          <p>Status: {subscriptionData?.subscriptionStatus}</p>
          {subscriptionData?.subscriptionStatus === 'trial' && subscriptionData?.trialEndDate && (
            <p className="trial-info">
              Trial ends: {formatDate(subscriptionData.trialEndDate)}
            </p>
          )}
        </div>
        
        {/* Payment Method Section */}
        <div className="payment-section">
          <h3 className="section-title">Payment Method</h3>
          {paymentMethods.length > 0 ? (
            <div className="payment-methods-list">
              {paymentMethods.map((method) => (
                <div key={method.id} className="payment-method">
                  <div className="payment-info">
                    <FaCreditCard className="payment-icon" />
                    <div className="card-details">
                      <p className="card-number">•••• •••• •••• {method.last4}</p>
                      <p className="card-expiry">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                      <p className="card-brand">{method.brand?.toUpperCase() || 'CARD'}</p>
                      {method.isDefault && (
                        <Badge variant="default" className="default-badge">Default</Badge>
                      )}
                    </div>
                  </div>
                  <div className="payment-actions">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleUpdatePaymentMethod(method)}
                    >
                      Update
                    </Button>
                    {!method.isDefault && paymentMethods.length > 1 && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleSetDefaultPaymentMethod(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div className="add-payment-method">
                <Button size="sm" variant="outline" onClick={() => handleAddPaymentMethod()}>
                  Add New Payment Method
                </Button>
              </div>
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
              {billingLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="billing-log-item">
                  <div className="log-info">
                    <p className="log-action">{log.action.replace('_', ' ').toUpperCase()}</p>
                    <p className="log-date">{formatDate(log.timestamp)}</p>
                  </div>
                  {log.details.amount && (
                    <p className="log-amount">{formatCurrency(log.details.amount)}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-billing-history">No billing activity yet</p>
          )}
        </div>
        
        {/* Invoices Section */}
        <div className="invoices-section">
          <div className="section-header-with-test">
            <h3 className="section-title">Invoices</h3>
            {/* Debug button for testing */}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                console.log('🧪 Test button clicked!');
                const testInvoice: Invoice = {
                  id: 'demo-inv-001',
                  waveAppsInvoiceId: 'WA_DEMO_001',
                  number: 'XSC-2025-001',
                  date: '2025-07-12',
                  dueDate: '2025-08-11',
                  amount: 159.99,
                  currency: 'ZAR',
                  status: 'paid',
                  customerName: 'Acme Business Solutions (Pty) Ltd',
                  customerEmail: 'billing@acmebusiness.co.za',
                  lineItems: [
                    {
                      description: 'XSCard Premium Subscription - Monthly Plan',
                      quantity: 1,
                      rate: 139.12, // Subtotal without VAT (159.99 ÷ 1.15)
                      amount: 139.12
                    }
                  ],
                  subtotal: 139.12, // Total excluding VAT
                  tax: 20.87, // VAT 15% (159.99 - 139.12)
                  total: 159.99 // Final total including VAT
                };
                console.log('🧪 Test invoice created:', testInvoice);
                handleViewInvoice(testInvoice);
              }}
              style={{ marginLeft: 'auto' }}
            >
              📄 Preview Invoice
            </Button>
          </div>
          {premiumInvoices.length > 0 ? (
            <div className="invoices-list">
              {premiumInvoices.map((invoice) => (
                <div key={invoice.id} className="invoice-item" data-invoice-id={invoice.id}>
                  <div className="invoice-info">
                    <div className="invoice-header">
                      <p className="invoice-number">{invoice.number}</p>
                      <p className="invoice-date">{formatDate(invoice.date)}</p>
                    </div>
                    <p className="invoice-description">
                      {invoice.lineItems?.[0]?.description || 'Premium Subscription'}
                    </p>
                    <div className="invoice-meta">
                      <span className="invoice-amount">{formatCurrency(invoice.amount)}</span>
                      <span className={`invoice-status status-${invoice.status}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="invoice-actions">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        console.log('🖱️ View button clicked for invoice:', invoice.id);
                        handleViewInvoice(invoice);
                      }}
                      className="view-invoice-button"
                    >
                      View
                    </Button>
                    <div className="export-dropdown">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleExportInvoice(invoice.id, 'pdf')}
                        className="export-button"
                        title="Export as PDF"
                      >
                        📄 PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleExportInvoice(invoice.id, 'csv')}
                        className="export-button"
                        title="Export as CSV"
                      >
                        📊 CSV
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
                Invoices will appear here after your first payment
              </p>
            </div>
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
                    <p className="invoice-date">{formatDate(invoice.date)}</p>
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
      return (
        <Card className="billing-loading">
          <CardContent className="p-8">
            <div className="text-center">Loading billing information...</div>
          </CardContent>
        </Card>
      );
    }

    if (billingError) {
      return (
        <Card className="billing-error">
          <CardContent className="p-8">
            <div className="error-message">
              <FaExclamationTriangle className="error-icon" />
              <p>{billingError}</p>
              <Button onClick={() => {
                setIsBillingLoading(true);
                setBillingError(null);
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
    
    switch (userPlan) {
      case 'free':
        return renderFreePlanBilling();
      case 'premium':
        return renderPremiumPlanBilling();
      case 'enterprise':
        return renderEnterprisePlanBilling();
      default:
        return renderFreePlanBilling();
    }
  };    // Phase 2: Enhanced billing action handlers
  const handleUpdatePaymentMethod = async (method?: PaymentMethod) => {
    if (method) {
      setPaymentMethodToEdit(method);
    } else if (paymentMethods.length > 0) {
      // If no method specified, edit the first one (backward compatibility)
      setPaymentMethodToEdit(paymentMethods[0]);
    } else {
      setPaymentMethodToEdit(null);
    }
    setIsPaymentMethodModalOpen(true);
  };
  
  const handleAddPaymentMethod = () => {
    setPaymentMethodToEdit(null);
    setIsPaymentMethodModalOpen(true);
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setBillingError(null);
      
      // Call API to set default payment method
      const response = await fetch(`/billing/payment-methods/${paymentMethodId}/set-default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }
      
      // Refresh payment methods list
      const updatedMethods = await fetchPaymentMethods();
      setPaymentMethods(updatedMethods);
      
    } catch (error) {
      console.error('Error setting default payment method:', error);
      setBillingError('Failed to set default payment method');
    }
  };
    const handleCancelSubscription = async () => {
    if (!subscriptionData?.subscriptionCode) {
      setBillingError('No active subscription found to cancel.');
      return;
    }
    setIsCancelSubscriptionModalOpen(true);
  };
  const handleContactAccountManager = () => {
    const confirmed = window.confirm(
      '📧 Contact Account Manager\n\nThis will open your email client with a pre-filled message to your account manager.\n\nAccount Manager: John Smith\nEmail: john.smith@xscard.com\n\nClick OK to open email client.'
    );
    
    if (confirmed) {
      const subject = encodeURIComponent('Enterprise Support Request');
      const body = encodeURIComponent('Hello John,\n\nI need assistance with my XSCard Enterprise account.\n\n[Please describe your request here]\n\nBest regards');
      window.open(`mailto:john.smith@xscard.com?subject=${subject}&body=${body}`, '_blank');
    }
  };
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      setBillingError(null);
      
      // Show visual feedback
      const downloadBtn = document.querySelector(`[data-invoice-id="${invoiceId}"] .download-button`) as HTMLButtonElement;
      if (downloadBtn) {
        downloadBtn.innerHTML = '⏳';
        downloadBtn.disabled = true;
      }
      
      // Use the new export function for PDF download
      await handleExportInvoice(invoiceId, 'pdf');
      
      // Reset button state
      if (downloadBtn) {
        downloadBtn.innerHTML = '<svg class="download-icon">📄</svg>';
        downloadBtn.disabled = false;
      }
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setBillingError('Failed to download invoice');
      
      // Reset button state on error
      const downloadBtn = document.querySelector(`[data-invoice-id="${invoiceId}"] .download-button`) as HTMLButtonElement;
      if (downloadBtn) {
        downloadBtn.innerHTML = '<svg class="download-icon">📄</svg>';
        downloadBtn.disabled = false;
      }
    }
  };

  // Invoice handlers
  const handleViewInvoice = (invoice: Invoice) => {
    console.log('🔍 handleViewInvoice called with:', invoice);
    console.log('📋 Current modal state - isInvoiceViewModalOpen:', isInvoiceViewModalOpen);
    
    setSelectedInvoice(invoice);
    setIsInvoiceViewModalOpen(true);
    
    console.log('✅ Modal state updated - should open now');
    console.log('📋 Selected invoice:', invoice);
  };

  const handleExportInvoice = async (invoiceId: string, format: 'pdf' | 'csv') => {
    try {
      setBillingError(null);
      
      let blob: Blob;
      let filename: string;
      
      if (format === 'pdf') {
        blob = await exportInvoicePDF(invoiceId);
        
        // Check if we're in development and the blob is HTML (not a real PDF)
        const isDevelopment = 
          window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.startsWith('192.168.');
        
        if (isDevelopment && blob.type === 'text/html') {
          // In development, save as HTML since it's actually HTML content
          filename = `invoice-${invoiceId}-preview.html`;
          console.log('📄 Development mode: Saving invoice as HTML preview');
        } else {
          // Production: Real PDF blob
          filename = `invoice-${invoiceId}.pdf`;
        }
      } else {
        blob = await exportInvoiceCSV(invoiceId);
        filename = `invoice-${invoiceId}.csv`;
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show appropriate success message based on file type
      const fileType = filename.endsWith('.html') ? 'HTML Preview' : format.toUpperCase();
      const message = filename.endsWith('.html') 
        ? `✅ Invoice Preview Exported!\n\nYour invoice preview has been saved as an HTML file.\nOpen it in your browser to view the styled invoice.\n\nFile: ${filename}`
        : `✅ Invoice Exported!\n\nYour invoice has been exported as ${fileType}.\nCheck your Downloads folder for the file.`;
      
      alert(message);
      
    } catch (error) {
      console.error('Error exporting invoice:', error);
      setBillingError(`Failed to export invoice as ${format.toUpperCase()}`);
      alert(`❌ Export Failed\n\nWe encountered an error while exporting your invoice as ${format.toUpperCase()}.\nPlease try again.`);
    }
  };

  // Phase 2: User scenario testing (for development)
  // This function is used in development/testing but not currently called in the UI
  /* 
  const handleSwitchUserScenario = (scenario: string) => {
    console.log('🔄 Switching user scenario to:', scenario);
    setCurrentUserScenario(scenario);
    setMockUserScenario(scenario as 'free' | 'premium' | 'enterprise');
    
    // Show loading state briefly
    setIsBillingLoading(true);
    
    // Refresh billing data with new scenario
    setTimeout(() => {
      fetchBillingData();
    }, 200); // Small delay to show loading state
  };
  */
  // Modal success handlers
  const handlePaymentMethodSuccess = async () => {
    try {
      setBillingError(null);
      setIsPaymentMethodModalOpen(false);
      setPaymentMethodToEdit(null);
      
      // Refresh payment methods
      const updatedMethods = await fetchPaymentMethods();
      setPaymentMethods(updatedMethods);
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
    } catch (error) {
      console.error('Error refreshing billing data:', error);
      setBillingError('Subscription was cancelled but failed to refresh billing information');
    }
  };

  const handleEnterpriseInquirySuccess = () => {
    setIsEnterpriseInquiryModalOpen(false);
  };

  const handleDemoRequestSuccess = () => {
    setIsDemoRequestModalOpen(false);
    alert('🎉 Demo Request Submitted!\n\nThank you for your interest in XSCard Enterprise.\n\nOur team will contact you within 24 hours to schedule your personalized demo.');
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
                        { value: "Tech", label: "Technology" },
                        { value: "Finance", label: "Finance" },
                        { value: "Healthcare", label: "Healthcare" },
                        { value: "Education", label: "Education" },
                        { value: "Retail", label: "Retail" },
                        { value: "Manufacturing", label: "Manufacturing" },
                        { value: "Consulting", label: "Consulting" },
                        { value: "Other", label: "Other" }
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
                      <Label htmlFor="province">Province</Label>
                      <Input 
                        id="province" 
                        name="address.province" 
                        value={enterpriseData.address?.province || ''} 
                        onChange={handleEnterpriseChange} 
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input 
                        id="postal_code" 
                        name="address.postal_code" 
                        value={enterpriseData.address?.postal_code || ''} 
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
                
                <div className="branding-section">
                  <h3 className="section-title">Organization Branding</h3>
                  <div className="branding-container">
                    <div className="logo-section">
                      <div className="image-upload-item">
                        <div 
                          className="image-upload-preview clickable"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          {enterpriseData.logoUrl ? (
                            <img src={enterpriseData.logoUrl} alt="Organization logo" />
                          ) : (
                            <div className="image-placeholder">
                              <span>📁</span>
                              <span>Upload Logo</span>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          id="logo-upload"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          style={{ display: 'none' }}
                        />
                        {enterpriseData.logoUrl && (
                          <button 
                            className="remove-image-btn"
                            onClick={handleLogoRemove}
                            title="Remove logo"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <div className="logo-actions">
                        <p className="logo-hint">
                          <strong>Recommended:</strong> 512x512px PNG or JPG<br />
                          Maximum file size: 2MB
                        </p>
                      </div>
                      
                      {/* Brand Color Selection */}
                      <div className="theme-selection">
                        <h3 className="section-title">Brand Color</h3>
                        <div className="theme-colors">
                          {themes.map(color => (
                            <button
                              key={color}
                              className={`theme-color ${selectedTheme === color ? 'selected' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setSelectedTheme(color)}
                            />
                          ))}
                        </div>
                        <div className="color-picker-section">
                          <button
                            className="color-picker-btn"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                          >
                            <FaPalette />
                            Custom Color
                          </button>
                          {showColorPicker && (
                            <div className="color-picker-container">
                              <input
                                type="color"
                                value={customColor}
                                onChange={(e) => {
                                  setCustomColor(e.target.value);
                                  setSelectedTheme(e.target.value);
                                }}
                                className="color-picker-input"
                              />
                              <input
                                type="text"
                                value={customColor}
                                onChange={(e) => {
                                  setCustomColor(e.target.value);
                                  setSelectedTheme(e.target.value);
                                }}
                                placeholder="#FFFFFF"
                                className="hex-input"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="branding-details">
                      <div className="branding-preview">
                        <h4 className="preview-title">Business Card Preview</h4>
                        <div 
                          className="preview-card"
                          style={{
                            '--brand-color': enterpriseData.colorScheme,
                            '--brand-color-secondary': enterpriseData.colorScheme
                          } as React.CSSProperties}
                        >
                          <div 
                            className="preview-card-header"
                            style={{
                              backgroundImage: enterpriseData.logoUrl ? `url(${enterpriseData.logoUrl})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                          >
                            <div className="preview-company-info">
                              {enterpriseData.name || 'Your Company'}
                            </div>
                          </div>
                          
                          <div className="preview-card-body">
                            <div className="preview-contact-info">
                              <div className="preview-contact-name">John Doe</div>
                              <div className="preview-contact-title">Senior Manager</div>
                              {enterpriseData.name && (
                                <div className="preview-company-name">{enterpriseData.name}</div>
                              )}
                            </div>
                            
                            <div className="preview-contact-details">
                              <div className="preview-contact-item">
                                <div className="preview-contact-icon">📧</div>
                                <span className="preview-contact-text">john.doe@company.com</span>
                              </div>
                              <div className="preview-contact-item">
                                <div className="preview-contact-icon">📱</div>
                                <span className="preview-contact-text">+27 82 123 4567</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="preview-qr-section">
                            <div className="preview-qr-code">Send link</div>
                          </div>
                        </div>
                                             </div>
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

      </Tabs>
      
      {/* Modal Components */}
      <PaymentMethodModal
        isOpen={isPaymentMethodModalOpen}
        onClose={() => {
          setIsPaymentMethodModalOpen(false);
          setPaymentMethodToEdit(null);
        }}
        onSuccess={handlePaymentMethodSuccess}
        mode={paymentMethodToEdit ? 'update' : 'add'}
        existingPaymentMethod={paymentMethodToEdit ? {
          id: paymentMethodToEdit.id,
          last4: paymentMethodToEdit.last4,
          brand: paymentMethodToEdit.brand || 'card',
          expiryMonth: paymentMethodToEdit.expiryMonth || 12,
          expiryYear: paymentMethodToEdit.expiryYear || 2025
        } : undefined}
      />      {subscriptionData && subscriptionData.subscriptionCode && (
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

      <InvoiceViewModal
        isOpen={isInvoiceViewModalOpen}
        onClose={() => {
          setIsInvoiceViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onExport={handleExportInvoice}
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
