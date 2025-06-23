import { 
  authenticatedFetch, 
  ENDPOINTS, 
  BillingAPIResponse,
  SubscriptionStatus,
  SubscriptionPlan,
  BillingLog,
  buildBillingUrl 
} from '../utils/api';

// Add missing types that were being imported
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  bank?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
  lineItems?: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
}

export interface EnterpriseInquiry {
  companyName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  estimatedUsers: number;
  specificRequirements: string;
  currentSolution: string;
  budget: string;
  timeline: string;
  inquiryType: 'pricing' | 'demo' | 'consultation' | 'trial';
  preferredContactTime: string;
  submittedAt: string;
}

// Environment detection helper
const isDevelopment = () => {
  return !window.location.hostname.includes('production') && 
         (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'));
};

// Error handling for billing operations
const handleBillingError = (response: Response, operation: string) => {
  if (response.status === 401) {
    throw new Error('Authentication required. Please log in again.');
  }
  if (response.status === 403) {
    throw new Error('Insufficient permissions for this operation.');
  }
  if (response.status === 404) {
    throw new Error(`${operation} not found.`);
  }
  if (response.status >= 500) {
    throw new Error(`Server error during ${operation}. Please try again later.`);
  }
  throw new Error(`${operation} failed. Please check your connection and try again.`);
};

// Get subscription status
export const fetchSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    console.log('🔄 Fetching subscription status...');
    const response = await authenticatedFetch(ENDPOINTS.BILLING_SUBSCRIPTION_STATUS);
    
    if (!response.ok) {
      handleBillingError(response, 'fetching subscription status');
    }
    
    const data: BillingAPIResponse<SubscriptionStatus> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Invalid subscription status response');
    }
    
    console.log('✅ Subscription status fetched successfully');
    return data.data || {
      subscriptionStatus: 'none',
      subscriptionPlan: null,
      isActive: false,
      plan: 'free',
      emailToken: 'fallback_email_token'
    };
  } catch (error: any) {
    console.error('❌ Subscription status fetch failed:', error.message);
    
    // Fallback in development
    if (isDevelopment()) {
      console.warn('🔄 Using fallback data in development');
      return {
        subscriptionStatus: 'active',
        subscriptionPlan: 'MONTHLY_PLAN',
        isActive: true,
        plan: 'premium',
        amount: 159.99,
        emailToken: 'dev_fallback_email_token'
      };
    }
    
    throw error;
  }
};

// Get available plans
export const fetchAvailablePlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    console.log('🔄 Fetching available plans...');
    const response = await authenticatedFetch(ENDPOINTS.BILLING_SUBSCRIPTION_PLANS);
    
    if (!response.ok) {
      handleBillingError(response, 'fetching subscription plans');
    }
    
    const data: BillingAPIResponse<SubscriptionPlan[]> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to load subscription plans');
    }
    
    console.log('✅ Subscription plans fetched successfully');
    return data.data || [];
  } catch (error: any) {
    console.error('❌ Plans fetch failed:', error.message);
    
    // Fallback in development
    if (isDevelopment()) {
      console.warn('🔄 Using fallback plans in development');
      return [
        {
          id: 'MONTHLY_PLAN',
          name: 'Monthly Subscription',
          amount: 159.99,
          interval: 'monthly',
          description: 'XS Card Monthly Subscription',
          trialDays: 0,
          features: ['Unlimited digital business cards', 'Advanced QR features', 'Priority support']
        },
        {
          id: 'ANNUAL_PLAN',
          name: 'Annual Subscription',
          amount: 1800.00,
          interval: 'annually',
          description: 'XS Card Annual Subscription',
          trialDays: 0,
          features: ['All Premium features', 'Save R120 compared to monthly', 'Priority support']
        }
      ];
    }
    
    throw error;
  }
};

// Get billing logs
export const fetchBillingLogs = async (): Promise<BillingLog[]> => {
  try {
    console.log('🔄 Fetching billing logs...');
    const response = await authenticatedFetch(ENDPOINTS.BILLING_SUBSCRIPTION_LOGS);
    
    if (!response.ok) {
      handleBillingError(response, 'fetching billing logs');
    }
    
    const data: BillingAPIResponse<BillingLog[]> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to load billing logs');
    }
    
    console.log('✅ Billing logs fetched successfully');
    return data.data || [];
  } catch (error: any) {
    console.error('❌ Billing logs fetch failed:', error.message);
    
    // Fallback in development
    if (isDevelopment()) {
      console.warn('🔄 Using fallback logs in development');
      return [
        {
          id: 'log_001',
          action: 'subscription_created',
          resource: 'subscription',
          userId: 'user_123',
          resourceId: 'sub_1234567890',
          timestamp: new Date().toISOString(),
          details: {
            type: 'subscription',
            plan: 'MONTHLY_PLAN',
            amount: 159.99
          }
        }
      ];
    }
    
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionCode: string, reason?: string): Promise<boolean> => {
  try {
    console.log('🔄 Cancelling subscription:', subscriptionCode);
    
    // First, fetch the current subscription status to get the email_token
    console.log('🔄 Fetching subscription details for email token...');
    const subscriptionStatus = await fetchSubscriptionStatus();
    
    console.log('📄 Subscription status received:', JSON.stringify(subscriptionStatus, null, 2));
    
    if (!subscriptionStatus.emailToken) {
      console.error('❌ Email token missing from subscription status:', subscriptionStatus);
      throw new Error('Email token not found in subscription details. Cannot cancel subscription.');
    }
    
    const payload = {
      code: subscriptionCode, // Backend expects 'code' field
      token: subscriptionStatus.emailToken, // Backend expects 'token' field from subscription
      reason: reason || 'User requested cancellation',
      feedback: reason,
      effectiveDate: 'end_of_period'
    };
    
    console.log('📤 Sending cancel payload:', JSON.stringify(payload, null, 2));
    
    // The backend expects the subscription code in the 'code' field and token in 'token' field
    const response = await authenticatedFetch(ENDPOINTS.CANCEL_SUBSCRIPTION, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      handleBillingError(response, 'cancelling subscription');
    }
    
    const data: BillingAPIResponse<any> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to cancel subscription');
    }
    
    console.log('✅ Subscription cancelled successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Subscription cancellation failed:', error.message);
    throw error;
  }
};

// Initialize payment
export const initializePayment = async (planId: string): Promise<any> => {
  try {
    const getUserEmail = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          return user.email || 'user@example.com';
        }
      } catch (error) {
        console.error('Error getting user email:', error);
      }
      return 'dadece8444@adrewire.com';
    };

    const getAmountForPlan = (planId: string): number => {
      switch (planId) {
        case 'MONTHLY_PLAN': return 15999; // R159.99 in cents
        case 'ANNUAL_PLAN': return 180000; // R1800.00 in cents
        default: return 100;
      }
    };

    const payload = {
      email: getUserEmail(),
      amount: getAmountForPlan(planId),
      planId: planId
    };

    console.log('🚀 Initializing payment for plan:', planId);
    const response = await authenticatedFetch(ENDPOINTS.INITIALIZE_PAYMENT, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      handleBillingError(response, 'initializing payment');
    }
    
    const data = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to initialize payment');
    }
    
    console.log('✅ Payment initialization successful');
    return data.data || data;
  } catch (error: any) {
    console.error('❌ Payment initialization failed:', error.message);
    throw error;
  }
};

// Submit demo request for enterprise
export const submitDemoRequest = async (inquiry: EnterpriseInquiry): Promise<boolean> => {
  try {
    console.log('🔄 Submitting demo request...');
    const response = await authenticatedFetch(ENDPOINTS.ENTERPRISE_DEMO_REQUEST, {
      method: 'POST',
      body: JSON.stringify(inquiry)
    });
    
    if (!response.ok) {
      handleBillingError(response, 'submitting demo request');
    }
    
    const data: BillingAPIResponse<any> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to submit demo request');
    }
    
    console.log('✅ Demo request submitted successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Demo request submission failed:', error.message);
    throw error;
  }
};

// Fetch payment methods
export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    console.log('🔄 Fetching payment methods...');
    const response = await authenticatedFetch(ENDPOINTS.BILLING_PAYMENT_METHODS);
    
    if (!response.ok) {
      handleBillingError(response, 'fetching payment methods');
    }
    
    const data: BillingAPIResponse<PaymentMethod[]> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to load payment methods');
    }
    
    console.log('✅ Payment methods fetched successfully');
    return data.data || [];
  } catch (error: any) {
    console.error('❌ Payment methods fetch failed:', error.message);
    
    // Fallback in development
    if (isDevelopment()) {
      console.warn('🔄 Using fallback payment methods in development');
      return [
        {
          id: 'pm_001',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          isDefault: true,
          expiryMonth: 12,
          expiryYear: 2025
        }
      ];
    }
    
    throw error;
  }
};

// Fetch enterprise invoices
export const fetchEnterpriseInvoices = async (): Promise<Invoice[]> => {
  try {
    console.log('🔄 Fetching invoices...');
    // Note: This endpoint might need to be added to the backend
    const response = await authenticatedFetch('/billing/invoices');
    
    if (!response.ok) {
      handleBillingError(response, 'fetching invoices');
    }
    
    const data: BillingAPIResponse<Invoice[]> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to load invoices');
    }
    
    console.log('✅ Invoices fetched successfully');
    return data.data || [];
  } catch (error: any) {
    console.error('❌ Invoices fetch failed:', error.message);
    
    // Fallback in development
    if (isDevelopment()) {
      console.warn('🔄 Using fallback invoices in development');      return [
        {
          id: 'inv_001',
          number: 'INV-2025-001',
          date: new Date().toISOString(),
          amount: 159.99,
          status: 'paid',
          downloadUrl: '#',
          lineItems: [
            {
              description: 'XS Card Monthly Subscription',
              amount: 159.99,
              quantity: 1
            }
          ]
        }
      ];
    }
    
    throw error;
  }
};

// Download invoice
export const downloadInvoice = async (invoiceId: string): Promise<void> => {
  try {
    console.log('🔄 Downloading invoice:', invoiceId);
    const response = await authenticatedFetch(`/billing/invoices/${invoiceId}/download`);
    
    if (!response.ok) {
      handleBillingError(response, 'downloading invoice');
    }
    
    // Handle file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('✅ Invoice downloaded successfully');
  } catch (error: any) {
    console.error('❌ Invoice download failed:', error.message);
    throw error;
  }
};

// Delete payment method
export const deletePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  try {
    console.log('🔄 Deleting payment method:', paymentMethodId);
    const response = await authenticatedFetch(`${ENDPOINTS.BILLING_PAYMENT_METHODS}/${paymentMethodId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      handleBillingError(response, 'deleting payment method');
    }
    
    const data: BillingAPIResponse<any> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to delete payment method');
    }
    
    console.log('✅ Payment method deleted successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Payment method deletion failed:', error.message);
    throw error;
  }
};

// Update subscription plan
export const updateSubscriptionPlan = async (planId: string): Promise<boolean> => {
  try {
    console.log('🔄 Updating subscription plan:', planId);
    const response = await authenticatedFetch(ENDPOINTS.BILLING_UPDATE_PLAN, {
      method: 'PUT',
      body: JSON.stringify({ planId })
    });
    
    if (!response.ok) {
      handleBillingError(response, 'updating subscription plan');
    }
    
    const data: BillingAPIResponse<any> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to update subscription plan');
    }
    
    console.log('✅ Subscription plan updated successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Subscription plan update failed:', error.message);
    throw error;
  }
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(dateString));
};

// Mock user scenarios for development
let mockUserScenario: 'free' | 'premium' | 'enterprise' = 'free';

export const setMockUserScenario = (scenario: 'free' | 'premium' | 'enterprise'): void => {
  mockUserScenario = scenario;
  console.log('🎭 Mock user scenario set to:', scenario);
};

export const getCurrentUserScenario = (): 'free' | 'premium' | 'enterprise' => {
  return mockUserScenario;
};
