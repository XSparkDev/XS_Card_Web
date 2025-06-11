# XSCard Billing Tab Implementation Plan

## Overview
This document outlines the complete implementation plan for the billing functionality in the XSCard web application Settings page. The plan accounts for three different user types: Free, Premium, and Enterprise customers, with different billing approaches for each.

## Plan Structure Understanding

### User Types & Billing Models
- **Free Plan**: Basic features, no payment required
- **Premium Plan**: R159.99/month, automated subscription via Paystack (from fake backend)
- **Enterprise Plan**: Custom pricing, sales-led process (no self-service subscription)

### Current State
- Billing tab shows static/mock data
- Hardcoded "Enterprise Plan" with $499/month
- Mock payment method and invoice history
- No real functionality

---

## 1. API Endpoints to Add

### Standard Billing Endpoints (Premium/Free)
```typescript
// Add to ENDPOINTS in api.ts
BILLING_SUBSCRIPTION_STATUS: '/subscription/status',
BILLING_SUBSCRIPTION_PLANS: '/subscription/plans', 
BILLING_CANCEL_SUBSCRIPTION: '/subscription/cancel',
BILLING_SUBSCRIPTION_LOGS: '/subscription/logs',
BILLING_INITIALIZE_PAYMENT: '/payment/initialize',
```

### Enterprise-Specific Endpoints
```typescript
// Enterprise inquiry system
ENTERPRISE_INQUIRY_SUBMIT: '/enterprise/inquiry',
ENTERPRISE_DEMO_REQUEST: '/enterprise/demo',
ENTERPRISE_SALES_CONTACT: '/enterprise/contact-sales',
ENTERPRISE_GET_ACCOUNT_MANAGER: '/enterprise/:enterpriseId/account-manager',
ENTERPRISE_BILLING_OVERVIEW: '/enterprise/:enterpriseId/billing/overview',

// WaveApps integration for existing enterprise customers
ENTERPRISE_INVOICES: '/enterprise/:enterpriseId/billing/invoices',
ENTERPRISE_DOWNLOAD_INVOICE: '/enterprise/:enterpriseId/billing/invoices/:invoiceId/download',
```

---

## 2. TypeScript Interfaces

### Core Billing Types
```typescript
// Subscription Status (based on fake backend patterns)
interface SubscriptionStatus {
  subscriptionStatus: 'none' | 'trial' | 'active' | 'cancelled' | 'past_due';
  subscriptionPlan: string | null;
  subscriptionReference?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  customerCode?: string;
  subscriptionCode?: string;
  isActive: boolean;
  plan: 'free' | 'premium' | 'enterprise';
}

// Subscription Plans (from fake backend)
interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  interval: 'monthly' | 'annually';
  description: string;
  trialDays: number;
  planCode?: string; // Paystack plan code
}

// Billing Activity Logs
interface BillingLog {
  id: string;
  action: string;
  resource: string;
  userId: string;
  resourceId: string;
  timestamp: string;
  details: {
    type?: string;
    plan?: string;
    amount?: number;
    interval?: string;
    reason?: string;
  };
}

// Payment Methods (Paystack)
interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  customerCode?: string;
}
```

### Enterprise-Specific Types
```typescript
// Enterprise Inquiry System
interface EnterpriseInquiry {
  companyName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  estimatedUsers: number;
  specificRequirements: string;
  preferredContactTime: string;
  inquiryType: 'pricing' | 'demo' | 'consultation' | 'trial';
  currentSolution?: string;
  budget?: string;
  timeline?: string;
}

// Demo Request
interface DemoRequest {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  attendeeCount: number;
  specificInterests: string[];
  currentChallenges: string;
}

// Account Manager (for existing enterprise customers)
interface AccountManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  profileImage?: string;
}

// WaveApps Invoices (for existing enterprise customers)
interface Invoice {
  id: string;
  waveAppsInvoiceId: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  downloadUrl?: string;
  lineItems: InvoiceLineItem[];
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}
```

---

## 3. Implementation Phases

### Phase 1: Foundation & Free Plan (PRIORITY 1)
**Estimated Time: 2-3 days**

#### 3.1.1 Add New API Endpoints to api.ts
```typescript
// File: src/utils/api.ts
// Add these endpoints to the ENDPOINTS object

// Standard billing endpoints
BILLING_SUBSCRIPTION_STATUS: '/subscription/status',
BILLING_SUBSCRIPTION_PLANS: '/subscription/plans',
BILLING_SUBSCRIPTION_LOGS: '/subscription/logs',

// Enterprise inquiry endpoints
ENTERPRISE_INQUIRY_SUBMIT: '/enterprise/inquiry',
ENTERPRISE_DEMO_REQUEST: '/enterprise/demo',
```

#### 3.1.2 Create Billing Types File
```typescript
// File: src/types/billing.ts
// Add all the interfaces defined in section 2
```

#### 3.1.3 Update Settings Component State
```typescript
// File: src/components/Dashboard/Settings.tsx
// Add new state variables for billing functionality

const [subscriptionData, setSubscriptionData] = useState<SubscriptionStatus | null>(null);
const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
const [billingLogs, setBillingLogs] = useState<BillingLog[]>([]);
const [isBillingLoading, setIsBillingLoading] = useState(true);
const [billingError, setBillingError] = useState<string | null>(null);
const [showEnterpriseInquiry, setShowEnterpriseInquiry] = useState(false);
```

#### 3.1.4 Create Billing API Functions
```typescript
// File: src/utils/billingApi.ts
// Create dedicated billing API functions

export const fetchSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  const response = await authenticatedFetch(ENDPOINTS.BILLING_SUBSCRIPTION_STATUS);
  if (!response.ok) throw new Error('Failed to fetch subscription status');
  const data = await response.json();
  return data.data;
};

export const fetchAvailablePlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await authenticatedFetch(ENDPOINTS.BILLING_SUBSCRIPTION_PLANS);
  if (!response.ok) throw new Error('Failed to fetch plans');
  const data = await response.json();
  return data.data;
};
```

#### 3.1.5 Implement Free Plan Billing Display
```typescript
// In Settings.tsx - replace static billing content
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
            Up to 20 contacts
          </li>
        </ul>
      </div>
      <div className="upgrade-section">
        <h4>Ready to upgrade?</h4>
        <div className="upgrade-options">
          <Button onClick={() => navigateToUpgrade('premium')}>
            Upgrade to Premium - R159.99/month
          </Button>
          <Button variant="outline" onClick={() => setShowEnterpriseInquiry(true)}>
            Contact Sales for Enterprise
          </Button>
        </div>
      </div>
    </div>
  </div>
);
```

### Phase 2: Premium Plan Integration (PRIORITY 2)
**Estimated Time: 3-4 days**

#### 3.2.1 Integrate with Fake Backend Subscription System
```typescript
// Use existing fake backend patterns for subscription management
const fetchPremiumSubscriptionData = async () => {
  try {
    setIsBillingLoading(true);
    
    // Fetch subscription status (matches fake backend getSubscriptionStatus)
    const subscriptionStatus = await fetchSubscriptionStatus();
    setSubscriptionData(subscriptionStatus);
    
    // Fetch available plans (matches fake backend getSubscriptionPlans)
    const plans = await fetchAvailablePlans();
    setAvailablePlans(plans);
    
  } catch (error) {
    setBillingError('Failed to load subscription data');
  } finally {
    setIsBillingLoading(false);
  }
};
```

#### 3.2.2 Premium Plan Billing Display
```typescript
const renderPremiumPlanBilling = () => (
  <div className="billing-content">
    <div className="current-plan">
      <div className="plan-header">
        <div>
          <h3 className="plan-title">Premium Plan</h3>
          <p className="plan-price">R{subscriptionData?.amount || 159.99}/month</p>
        </div>
        <Badge variant={subscriptionData?.isActive ? 'default' : 'secondary'}>
          {subscriptionData?.subscriptionStatus === 'trial' ? 'Trial' : 'Active'}
        </Badge>
      </div>
      
      {/* Subscription details */}
      <div className="subscription-details">
        <p>Next billing: {formatDate(subscriptionData?.subscriptionEnd)}</p>
        <p>Status: {subscriptionData?.subscriptionStatus}</p>
      </div>
      
      {/* Payment method section */}
      <div className="payment-section">
        <h3 className="section-title">Payment Method</h3>
        {/* Connect to Paystack customer data */}
      </div>
      
      {/* Billing history from logs */}
      <div className="billing-history">
        <h3 className="section-title">Billing History</h3>
        {billingLogs.map(log => (
          <div key={log.id} className="log-item">
            <p>{formatDate(log.timestamp)}: {log.action}</p>
            <p>Amount: R{log.details.amount}</p>
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="plan-actions">
        <Button size="sm" onClick={() => handleCancelSubscription()}>
          Cancel Subscription
        </Button>
        <Button variant="outline" onClick={() => setShowEnterpriseInquiry(true)}>
          Upgrade to Enterprise
        </Button>
      </div>
    </div>
  </div>
);
```

#### 3.2.3 Subscription Management Functions
```typescript
// Cancellation (using fake backend pattern)
const handleCancelSubscription = async () => {
  try {
    const response = await authenticatedFetch(ENDPOINTS.BILLING_CANCEL_SUBSCRIPTION, {
      method: 'POST',
      body: JSON.stringify({
        code: subscriptionData?.subscriptionCode,
        reason: 'User requested cancellation'
      })
    });
    
    if (response.ok) {
      // Refresh subscription data
      await fetchPremiumSubscriptionData();
      setSuccessMessage('Subscription cancelled successfully');
    }
  } catch (error) {
    setError('Failed to cancel subscription');
  }
};
```

### Phase 3: Enterprise Sales System (PRIORITY 3)
**Estimated Time: 4-5 days**

#### 3.3.1 Create Enterprise Inquiry Modal Component
```typescript
// File: src/components/Dashboard/EnterpriseInquiryModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../UI/dialog';
import { Button } from '../UI/button';
import { Input } from '../UI/input';
import { Textarea } from '../UI/textarea';
import { Select } from '../UI/select';

interface EnterpriseInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EnterpriseInquiryModal: React.FC<EnterpriseInquiryModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [inquiryData, setInquiryData] = useState<EnterpriseInquiry>({
    companyName: '',
    contactPersonName: '',
    email: '',
    phone: '',
    companySize: 'medium',
    industry: '',
    estimatedUsers: 0,
    specificRequirements: '',
    preferredContactTime: '',
    inquiryType: 'pricing'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitInquiry = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await authenticatedFetch(ENDPOINTS.ENTERPRISE_INQUIRY_SUBMIT, {
        method: 'POST',
        body: JSON.stringify(inquiryData)
      });
      
      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to submit inquiry');
      }
    } catch (error) {
      setError('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="enterprise-inquiry-modal max-w-2xl">
        <DialogHeader>
          <DialogTitle>Get in Touch - Enterprise Solutions</DialogTitle>
          <p className="text-sm text-gray-600">
            Tell us about your needs and we'll create a custom solution for your organization
          </p>
        </DialogHeader>
        
        <div className="inquiry-form space-y-6">
          {/* Company Information */}
          <div className="form-section">
            <h4 className="font-medium mb-3">Company Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Company Name" 
                value={inquiryData.companyName}
                onChange={(e) => setInquiryData({...inquiryData, companyName: e.target.value})}
                required
              />
              <Select 
                value={inquiryData.companySize}
                onValueChange={(value) => setInquiryData({...inquiryData, companySize: value as any})}
              >
                <option value="small">1-50 employees</option>
                <option value="medium">51-200 employees</option>
                <option value="large">201-500 employees</option>
                <option value="enterprise">500+ employees</option>
              </Select>
              <Input 
                placeholder="Industry" 
                value={inquiryData.industry}
                onChange={(e) => setInquiryData({...inquiryData, industry: e.target.value})}
              />
              <Input 
                type="number" 
                placeholder="Estimated number of users" 
                value={inquiryData.estimatedUsers || ''}
                onChange={(e) => setInquiryData({...inquiryData, estimatedUsers: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="form-section">
            <h4 className="font-medium mb-3">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Your Name" 
                value={inquiryData.contactPersonName}
                onChange={(e) => setInquiryData({...inquiryData, contactPersonName: e.target.value})}
                required
              />
              <Input 
                type="email" 
                placeholder="Email Address" 
                value={inquiryData.email}
                onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})}
                required
              />
              <Input 
                type="tel" 
                placeholder="Phone Number" 
                value={inquiryData.phone}
                onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})}
                required
              />
              <Select 
                value={inquiryData.inquiryType}
                onValueChange={(value) => setInquiryData({...inquiryData, inquiryType: value as any})}
              >
                <option value="pricing">Pricing Information</option>
                <option value="demo">Schedule a Demo</option>
                <option value="consultation">Technical Consultation</option>
                <option value="trial">Enterprise Trial</option>
              </Select>
            </div>
          </div>
          
          {/* Requirements */}
          <div className="form-section">
            <h4 className="font-medium mb-3">Your Requirements</h4>
            <Textarea 
              placeholder="Tell us about your specific requirements, current challenges, or questions"
              value={inquiryData.specificRequirements}
              onChange={(e) => setInquiryData({...inquiryData, specificRequirements: e.target.value})}
              rows={4}
            />
            <Input 
              placeholder="Preferred contact time (e.g., 'Weekdays 9-5 SAST')" 
              value={inquiryData.preferredContactTime}
              onChange={(e) => setInquiryData({...inquiryData, preferredContactTime: e.target.value})}
            />
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={submitInquiry} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnterpriseInquiryModal;
```

#### 3.3.2 Enterprise Plan Billing Display (for existing customers)
```typescript
// For enterprises that are already customers
const renderEnterprisePlanBilling = () => (
  <div className="billing-content">
    <div className="current-plan enterprise-plan">
      <div className="plan-header">
        <div>
          <h3 className="plan-title">Enterprise Plan</h3>
          <p className="plan-price">Custom Pricing</p>
        </div>
        <Badge variant="premium">Enterprise</Badge>
      </div>
      
      {/* Account manager contact */}
      <div className="account-manager-section">
        <h4 className="section-title">Your Account Manager</h4>
        <div className="contact-card">
          <div className="manager-info">
            <p className="manager-name">{accountManager?.name || 'John Smith'}</p>
            <p className="manager-email">{accountManager?.email || 'john.smith@xscard.com'}</p>
            <p className="manager-phone">{accountManager?.phone || '+27 11 123 4567'}</p>
          </div>
          <Button size="sm" onClick={() => contactAccountManager()}>
            Contact Manager
          </Button>
        </div>
      </div>
      
      {/* Custom invoicing from WaveApps */}
      <div className="enterprise-billing">
        <h4 className="section-title">Billing & Invoices</h4>
        <p className="text-sm text-gray-600 mb-4">
          Your custom invoices are managed by your account manager
        </p>
        {invoices.length > 0 ? (
          <div className="invoice-list">
            {invoices.map(invoice => (
              <div key={invoice.id} className="invoice-item">
                <div className="invoice-info">
                  <p className="invoice-date">{formatDate(invoice.date)}</p>
                  <p className="invoice-number">{invoice.number}</p>
                </div>
                <div className="invoice-details">
                  <p className="invoice-amount">R{invoice.amount.toLocaleString()}</p>
                  <div className="invoice-actions">
                    <Badge variant="outline" className={`invoice-status status-${invoice.status}`}>
                      {invoice.status}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => downloadInvoice(invoice.id)}>
                      <FaDownload />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No invoices available</p>
        )}
      </div>
      
      {/* Enterprise features */}
      <div className="enterprise-features">
        <h4 className="section-title">Enterprise Features</h4>
        <ul className="features-list">
          <li className="feature-item">
            <FaCheck className="feature-check" />
            Unlimited business cards
          </li>
          <li className="feature-item">
            <FaCheck className="feature-check" />
            Custom branding & white-labeling
          </li>
          <li className="feature-item">
            <FaCheck className="feature-check" />
            Advanced analytics & reporting
          </li>
          <li className="feature-item">
            <FaCheck className="feature-check" />
            Dedicated account manager
          </li>
          <li className="feature-item">
            <FaCheck className="feature-check" />
            SSO integration
          </li>
          <li className="feature-item">
            <FaCheck className="feature-check" />
            24/7 priority support
          </li>
        </ul>
      </div>
    </div>
  </div>
);
```

#### 3.3.3 Backend Enterprise Inquiry Handler
```javascript
// File: backend/controllers/enterpriseInquiryController.js
const { db } = require('../firebase');
const { sendEmail } = require('../services/emailService');

const handleEnterpriseInquiry = async (req, res) => {
  try {
    const inquiryData = req.body;
    const userId = req.user?.uid;
    
    // Validate required fields
    const requiredFields = ['companyName', 'contactPersonName', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!inquiryData[field]) {
        return res.status(400).json({
          status: false,
          message: `${field} is required`
        });
      }
    }
    
    // Store inquiry in database
    const inquiryDoc = await db.collection('enterpriseInquiries').add({
      ...inquiryData,
      userId: userId || null,
      submittedAt: new Date().toISOString(),
      status: 'new',
      source: 'billing_settings',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Send notification to sales team
    await sendSalesNotification(inquiryData, inquiryDoc.id);
    
    // Send confirmation email to prospect
    await sendConfirmationEmail(inquiryData.email, inquiryData.contactPersonName, inquiryData.inquiryType);
    
    // Log activity
    if (userId) {
      await logActivity({
        action: 'CREATE',
        resource: 'ENTERPRISE_INQUIRY',
        userId: userId,
        resourceId: inquiryDoc.id,
        details: {
          companyName: inquiryData.companyName,
          inquiryType: inquiryData.inquiryType,
          estimatedUsers: inquiryData.estimatedUsers
        }
      });
    }
    
    res.status(200).json({
      status: true,
      message: 'Inquiry submitted successfully',
      data: {
        inquiryId: inquiryDoc.id,
        expectedResponse: '24 hours'
      }
    });
  } catch (error) {
    console.error('Enterprise inquiry error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to submit inquiry',
      error: error.message
    });
  }
};

const sendSalesNotification = async (inquiryData, inquiryId) => {
  const salesEmail = {
    to: ['sales@xscard.com', 'enterprise@xscard.com'],
    subject: `🚀 New Enterprise Inquiry - ${inquiryData.companyName}`,
    template: 'enterprise-inquiry-notification',
    data: {
      ...inquiryData,
      inquiryId,
      dashboardUrl: `${process.env.ADMIN_URL}/inquiries/${inquiryId}`
    }
  };
  
  await sendEmail(salesEmail);
  
  // Also send to Slack if configured
  if (process.env.SLACK_WEBHOOK_URL) {
    await sendSlackNotification(inquiryData, inquiryId);
  }
};

const sendConfirmationEmail = async (email, name, inquiryType) => {
  const confirmationEmail = {
    to: email,
    subject: 'Thank you for your interest in XSCard Enterprise',
    template: 'enterprise-inquiry-confirmation',
    data: {
      name,
      inquiryType,
      expectedResponse: '24 hours',
      contactEmail: 'enterprise@xscard.com',
      contactPhone: '+27 11 123 4567'
    }
  };
  
  await sendEmail(confirmationEmail);
};

module.exports = {
  handleEnterpriseInquiry
};
```

### Phase 4: WaveApps Invoice Integration (PRIORITY 4)
**Estimated Time: 5-6 days**

#### 3.4.1 WaveApps API Integration
```javascript
// File: backend/services/waveAppsService.js
const axios = require('axios');

class WaveAppsService {
  constructor() {
    this.baseURL = 'https://gql.waveapps.com/graphql/public';
    this.apiToken = process.env.WAVEAPPS_API_TOKEN;
    this.businessId = process.env.WAVEAPPS_BUSINESS_ID;
  }

  async getInvoices(enterpriseId) {
    const query = `
      query GetInvoices($businessId: ID!) {
        business(id: $businessId) {
          invoices(first: 50) {
            edges {
              node {
                id
                invoiceNumber
                invoiceDate
                dueDate
                total
                status
                customer {
                  name
                  email
                }
                items {
                  product {
                    name
                  }
                  quantity
                  price
                  total
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(this.baseURL, {
        query,
        variables: { businessId: this.businessId }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.data.business.invoices.edges.map(edge => ({
        id: edge.node.id,
        number: edge.node.invoiceNumber,
        date: edge.node.invoiceDate,
        dueDate: edge.node.dueDate,
        amount: edge.node.total,
        status: edge.node.status.toLowerCase(),
        customer: edge.node.customer,
        lineItems: edge.node.items.map(item => ({
          description: item.product.name,
          quantity: item.quantity,
          rate: item.price,
          amount: item.total
        }))
      }));
    } catch (error) {
      console.error('WaveApps API error:', error);
      throw new Error('Failed to fetch invoices from WaveApps');
    }
  }

  async downloadInvoicePDF(invoiceId) {
    // Implementation for downloading invoice PDF
    // This would require additional WaveApps API calls
  }

  async createInvoice(enterpriseData, lineItems) {
    // Implementation for creating new invoices
    // Used when enterprise subscription renews
  }
}

module.exports = new WaveAppsService();
```

#### 3.4.2 Enterprise Invoice API Endpoints
```javascript
// File: backend/controllers/enterpriseBillingController.js
const waveAppsService = require('../services/waveAppsService');

const getEnterpriseInvoices = async (req, res) => {
  try {
    const { enterpriseId } = req.params;
    const userId = req.user.uid;
    
    // Verify user has access to this enterprise
    const enterpriseDoc = await db.collection('enterprises').doc(enterpriseId).get();
    if (!enterpriseDoc.exists) {
      return res.status(404).json({
        status: false,
        message: 'Enterprise not found'
      });
    }
    
    // Check if user belongs to this enterprise
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists || userDoc.data().enterpriseId !== enterpriseId) {
      return res.status(403).json({
        status: false,
        message: 'Access denied'
      });
    }
    
    // Fetch invoices from WaveApps
    const invoices = await waveAppsService.getInvoices(enterpriseId);
    
    res.status(200).json({
      status: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get enterprise invoices error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

const downloadEnterpriseInvoice = async (req, res) => {
  try {
    const { enterpriseId, invoiceId } = req.params;
    
    // Verify access permissions
    // ... similar verification as above
    
    // Get invoice PDF from WaveApps
    const pdfBuffer = await waveAppsService.downloadInvoicePDF(invoiceId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to download invoice'
    });
  }
};

module.exports = {
  getEnterpriseInvoices,
  downloadEnterpriseInvoice
};
```

### Phase 5: Final Integration & Polish (PRIORITY 5)
**Estimated Time: 2-3 days**

#### 3.5.1 Update Main Settings Component
```typescript
// File: src/components/Dashboard/Settings.tsx
// Update the billing tab content to use dynamic rendering

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
            <Button onClick={() => fetchBillingData()} className="mt-4">
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
};

// In the TabsContent for billing
<TabsContent value="billing" className="settings-tab-content">
  {renderBillingContent()}
  
  {/* Enterprise Inquiry Modal */}
  <EnterpriseInquiryModal
    isOpen={showEnterpriseInquiry}
    onClose={() => setShowEnterpriseInquiry(false)}
    onSuccess={() => {
      setSuccessMessage('Thank you! Our sales team will contact you within 24 hours.');
      setTimeout(() => setSuccessMessage(null), 5000);
    }}
  />
</TabsContent>
```

#### 3.5.2 Add CSS Styles
```css
/* File: src/styles/Settings.css */
/* Add these new styles for the billing functionality */

/* Enterprise Plan Styling */
.enterprise-plan {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.enterprise-plan .plan-title,
.enterprise-plan .plan-price {
  color: white;
}

/* Account Manager Section */
.account-manager-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
}

.contact-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.manager-info p {
  margin: 0.25rem 0;
}

.manager-name {
  font-weight: 600;
  color: #1f2937;
}

.manager-email,
.manager-phone {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Enterprise Inquiry Modal */
.enterprise-inquiry-modal {
  max-width: 42rem;
}

.form-section {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section h4 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #374151;
}

/* Upgrade Section */
.upgrade-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: #f0f9ff;
  border-radius: 0.5rem;
  border: 1px solid #bae6fd;
}

.upgrade-section h4 {
  margin-bottom: 1rem;
  color: #0369a1;
}

.upgrade-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .upgrade-options {
    flex-direction: row;
  }
}

/* Loading and Error States */
.billing-loading,
.billing-error {
  min-height: 200px;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.error-icon {
  font-size: 2rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

/* Invoice Status Colors */
.invoice-status.status-paid {
  background-color: #dcfce7;
  color: #166534;
}

.invoice-status.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.invoice-status.status-overdue {
  background-color: #fee2e2;
  color: #dc2626;
}

.invoice-status.status-draft {
  background-color: #f3f4f6;
  color: #374151;
}
```

---

## 4. Implementation Checklist

### Phase 1 Checklist ✅
- [ ] Add billing endpoints to `api.ts`
- [ ] Create `billing.ts` types file
- [ ] Add billing state to Settings component
- [ ] Create `billingApi.ts` utility functions
- [ ] Implement free plan billing display
- [ ] Test free plan display with mock data

### Phase 2 Checklist ✅
- [ ] Integrate with fake backend subscription endpoints
- [ ] Implement premium plan billing display
- [ ] Add subscription management functions
- [ ] Add payment method display
- [ ] Add billing history from logs
- [ ] Test with fake backend data

### Phase 3 Checklist ✅
- [ ] Create EnterpriseInquiryModal component
- [ ] Implement enterprise plan billing display
- [ ] Add backend enterprise inquiry handler
- [ ] Set up sales team notifications
- [ ] Add confirmation emails
- [ ] Test enterprise inquiry flow

### Phase 4 Checklist ✅
- [ ] Set up WaveApps API integration
- [ ] Create enterprise billing controller
- [ ] Add invoice fetching functionality
- [ ] Implement invoice download
- [ ] Add account manager display
- [ ] Test with WaveApps sandbox

### Phase 5 Checklist ✅
- [ ] Update main Settings component
- [ ] Add dynamic billing content rendering
- [ ] Add CSS styles for all billing states
- [ ] Add loading and error states
- [ ] Test complete flow end-to-end
- [ ] Performance optimization

---

## 5. Testing Strategy

### 5.1 Unit Tests
- Test billing API functions
- Test component rendering for each plan type
- Test form validation in enterprise inquiry modal

### 5.2 Integration Tests
- Test billing data fetching and display
- Test enterprise inquiry submission flow
- Test invoice downloading functionality

### 5.3 User Acceptance Testing
- Test complete user journey for each plan type
- Test enterprise inquiry form submission
- Test error handling and edge cases

---

## 6. Notes for Implementation

### 6.1 Important References
- Fake backend patterns in `/fake_backend/controllers/subscriptionController.js`
- Existing API structure in `/src/utils/api.ts`
- Current Settings component in `/src/components/Dashboard/Settings.tsx`
- Existing styling patterns in `/src/styles/Settings.css`

### 6.2 Key Dependencies
- React hooks for state management
- Existing UI components (Button, Card, Dialog, etc.)
- Fake backend for Premium plan functionality
- WaveApps API for Enterprise invoicing
- Email service for notifications

### 6.3 Security Considerations
- Validate all user inputs
- Sanitize enterprise inquiry data
- Verify user permissions for enterprise data access
- Secure handling of payment information
- Rate limiting for inquiry submissions

### 6.4 Performance Considerations
- Cache billing data where appropriate
- Lazy load enterprise inquiry modal
- Optimize WaveApps API calls
- Add loading states for better UX

---

## 7. Future Enhancements

### 7.1 Advanced Billing Features
- Usage-based billing for enterprise customers
- Custom billing cycles
- Multi-currency support
- Advanced reporting and analytics

### 7.2 Integration Improvements
- CRM integration for enterprise inquiries
- Advanced WaveApps features
- Payment processing improvements
- Automated subscription management

### 7.3 User Experience Enhancements
- Better mobile responsiveness
- Progressive web app features
- Real-time billing updates
- Advanced filtering and search

---

**Last Updated:** June 11, 2025  
**Version:** 1.0  
**Status:** Ready for Implementation
