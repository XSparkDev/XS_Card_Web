// Billing API functions for XSCard Application
// Handles subscription management and enterprise inquiries
// Uses mock data when backend is not available

import { 
  SubscriptionStatus, 
  SubscriptionPlan, 
  BillingLog, 
  EnterpriseInquiry,
  BillingAPIResponse,
  EnterpriseInquiryResponse,  PaymentMethod,
  Invoice
} from '../types/billing';
import { ENDPOINTS, authenticatedFetch } from './api';
import {
  getMockSubscriptionData, 
  MOCK_AVAILABLE_PLANS, 
  MOCK_BILLING_LOGS,
  MOCK_PAYMENT_METHODS,
  MOCK_ENTERPRISE_INVOICES,
  mockApiDelay,
  USER_SCENARIOS
} from './mockBillingData';

// Environment detection - set this based on your environment
const USE_MOCK_DATA = false; // Set to false when connecting to real backend

// Dynamic user scenario that can be changed at runtime
let currentMockUserScenario = USER_SCENARIOS.FREE_USER;

// Fetch current subscription status
export const fetchSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  if (USE_MOCK_DATA) {
    await mockApiDelay(800); // Simulate network delay
    return getMockSubscriptionData(currentMockUserScenario);
  }

  const response = await authenticatedFetch(ENDPOINTS.BILLING_SUBSCRIPTION_STATUS);
  if (!response.ok) {
    throw new Error('Failed to fetch subscription status');
  }
  const data: BillingAPIResponse<SubscriptionStatus> = await response.json();
  return data.data || {
    subscriptionStatus: 'none',
    subscriptionPlan: null,
    isActive: false,
    plan: 'free'
  };
};

// Fetch available subscription plans
export const fetchAvailablePlans = async (): Promise<SubscriptionPlan[]> => {
  if (USE_MOCK_DATA) {
    await mockApiDelay(600);
    return MOCK_AVAILABLE_PLANS;
  }

  const response = await authenticatedFetch(ENDPOINTS.BILLING_SUBSCRIPTION_PLANS);
  if (!response.ok) {
    throw new Error('Failed to fetch subscription plans');
  }
  const data: BillingAPIResponse<SubscriptionPlan[]> = await response.json();
  return data.data || [];
};

// Fetch billing activity logs
export const fetchBillingLogs = async (): Promise<BillingLog[]> => {
  if (USE_MOCK_DATA) {
    await mockApiDelay(700);
    return MOCK_BILLING_LOGS;
  }

  const response = await authenticatedFetch(ENDPOINTS.BILLING_SUBSCRIPTION_LOGS);
  if (!response.ok) {
    throw new Error('Failed to fetch billing logs');
  }
  const data: BillingAPIResponse<BillingLog[]> = await response.json();
  return data.data || [];
};

// Cancel subscription (Premium plan users)
export const cancelSubscription = async (subscriptionCode: string, reason?: string): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    await mockApiDelay(1500);
    console.log('🚫 Mock: Cancelling subscription', subscriptionCode, 'Reason:', reason);
    // Simulate successful cancellation
    return true;
  }

  const response = await authenticatedFetch(ENDPOINTS.BILLING_CANCEL_SUBSCRIPTION, {
    method: 'POST',
    body: JSON.stringify({
      code: subscriptionCode,
      reason: reason || 'User requested cancellation'
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }
  
  const data: BillingAPIResponse<any> = await response.json();
  return data.status;
};

// Submit enterprise inquiry
export const submitEnterpriseInquiry = async (inquiryData: EnterpriseInquiry): Promise<EnterpriseInquiryResponse> => {
  const response = await authenticatedFetch(ENDPOINTS.ENTERPRISE_INQUIRY_SUBMIT, {
    method: 'POST',
    body: JSON.stringify(inquiryData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit enterprise inquiry');
  }
  
  return await response.json();
};

// Initialize payment for Premium plan upgrade
export const initializePayment = async (planId: string): Promise<any> => {
  // Get user email from localStorage or use a default
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
    return 'dadece8444@adrewire.com'; // Fallback email
  };

  // Get amount based on plan (using cents as your backend expects)
  const getAmountForPlan = (planId: string): number => {
    switch (planId) {
      case 'MONTHLY_PLAN':
        return 15999; // R159.99 in cents
      case 'ANNUAL_PLAN':
        return 180000; // R1800.00 in cents
      default:
        return 100; // Default test amount
    }
  };
  const payload = {
    email: getUserEmail(),
    amount: getAmountForPlan(planId)
  };

  console.log('🚀 Initializing payment with payload:', payload);

  const response = await authenticatedFetch(ENDPOINTS.BILLING_INITIALIZE_PAYMENT, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    console.error('❌ Payment initialization failed:', response.status, response.statusText);
    throw new Error('Failed to initialize payment');
  }
  
  const data = await response.json();
  console.log('✅ Payment response received:', data);
  
  // Return the data directly since your backend might not wrap it in a 'data' property
  return data.data || data;
};

// Utility function to format currency (South African Rand)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Utility function to format dates
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    return 'Invalid Date';
  }
};

// Utility function to get plan display name
export const getPlanDisplayName = (plan: string): string => {
  switch (plan) {
    case 'free':
      return 'Free Plan';
    case 'premium':
      return 'Premium Plan';
    case 'enterprise':
      return 'Enterprise Plan';
    default:
      return 'Unknown Plan';
  }
};

// Utility function to get subscription status display
export const getSubscriptionStatusDisplay = (status: string): string => {
  switch (status) {
    case 'none':
      return 'No Subscription';
    case 'trial':
      return 'Trial';
    case 'active':
      return 'Active';
    case 'cancelled':
      return 'Cancelled';
    case 'past_due':
      return 'Past Due';
    default:
      return 'Unknown';
  }
};

// NEW PHASE 2 FUNCTIONS

// Fetch payment methods for Premium users
export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  if (USE_MOCK_DATA) {
    await mockApiDelay(500);
    return MOCK_PAYMENT_METHODS;
  }

  const response = await authenticatedFetch('/api/billing/payment-methods');
  if (!response.ok) {
    throw new Error('Failed to fetch payment methods');
  }
  const data: BillingAPIResponse<PaymentMethod[]> = await response.json();
  return data.data || [];
};

// Fetch enterprise invoices
export const fetchEnterpriseInvoices = async (): Promise<Invoice[]> => {
  if (USE_MOCK_DATA) {
    await mockApiDelay(900);
    return MOCK_ENTERPRISE_INVOICES;
  }

  const response = await authenticatedFetch('/api/enterprise/invoices');
  if (!response.ok) {
    throw new Error('Failed to fetch enterprise invoices');
  }
  const data: BillingAPIResponse<Invoice[]> = await response.json();
  return data.data || [];
};

// Update payment method
export const updatePaymentMethod = async (paymentMethodId: string, updates: Partial<PaymentMethod>): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    await mockApiDelay(1200);
    console.log('✅ Mock: Successfully updated payment method', paymentMethodId, updates);
    // Simulate a successful update
    return true;
  }

  const response = await authenticatedFetch(`/api/billing/payment-methods/${paymentMethodId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  
  return response.ok;
};

// Download invoice (Enterprise)
export const downloadInvoice = async (invoiceId: string): Promise<string> => {
  if (USE_MOCK_DATA) {
    await mockApiDelay(800);
    console.log('📄 Mock: Downloading invoice', invoiceId);
    // Simulate creating a download blob and URL
    const mockPdfContent = 'Mock PDF content for invoice ' + invoiceId;
    const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);
    
    // Create a temporary download link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `invoice-${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    
    return downloadUrl;
  }

  const response = await authenticatedFetch(`/api/enterprise/invoices/${invoiceId}/download`);
  if (!response.ok) {
    throw new Error('Failed to download invoice');
  }
  const data = await response.json();
  return data.downloadUrl;
};

// Environment configuration functions
export const setMockUserScenario = (scenario: string) => {
  // This updates the current mock user scenario for testing
  currentMockUserScenario = scenario;
  console.log('🔄 Switched to user scenario:', scenario);
};

export const getCurrentUserScenario = (): string => {
  return currentMockUserScenario;
};
