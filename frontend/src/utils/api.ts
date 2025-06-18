// Add these types near the top of the file
export interface PasscreatorResponse {
    message: string;
    passUri: string;
    passFileUrl: string;
    passPageUrl: string;
    identifier: string;
    colorScheme?: string; // Add default color support
}

// Billing Types
export interface SubscriptionStatus {
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
  amount?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  interval: 'monthly' | 'annually';
  description: string;
  trialDays: number;
  planCode?: string;
  features?: string[];
}

export interface BillingLog {
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

export interface BillingAPIResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Firebase authentication token for API access
export const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjNiZjA1MzkxMzk2OTEzYTc4ZWM4MGY0MjcwMzM4NjM2NDA2MTBhZGMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzUwMjU4MzgzLCJ1c2VyX2lkIjoiRWNjeU1Ddjd1aVMxZVlIQjNaTXU2elJSMURHMiIsInN1YiI6IkVjY3lNQ3Y3dWlTMWVZSEIzWk11NnpSUjFERzIiLCJpYXQiOjE3NTAyNTgzODMsImV4cCI6MTc1MDI2MTk4MywiZW1haWwiOiJ0ZXN0ZWhha2tlQGd1ZnVtLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RlaGFra2VAZ3VmdW0uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.dsWbOfpn5fQ6mGxDhVQjNshZZvkQAA0b3mtEVqcwpmHxDIKi43mYsRUemJqOQJXorh58tglQXCW-C19rpOUH8asS35aMjYDNaIz1d0V2zpDjDBIuxIGQBYfFWIyNnZbHr4LkZAmTBLj-41xcBFj7tBCEQKwZWsDidH7cYY8-OqAf157IuO7eIMDE71ZJPt2CZXL_5BPHf2J3fskiM3SOZJjoXGmjCSMdshtgiyQSpYzgJtgGn8Zg3Jd8_BV0qm4biFAi-cI9C_TM_4RO0d--CcXxPFp83wUBsdwVpuWGAt8h31tGdu4XDz_PsUtGhq8IeXdaX3nBJHByMyVt7e5QJQ";

// Enterprise ID commonly used in the app
export const DEFAULT_ENTERPRISE_ID = "PegXyjZYojbLudlmOmDf";

// Default user ID specifically for meetings and user-specific features
export const DEFAULT_USER_ID = "EccyMCv7uiS1eYHB3ZMu6zRR1DG2";

// Helper function to get the appropriate base URL
const getBaseUrl = () => {
  // return 'https://xscard-app.onrender.com';
  return 'http://localhost:8383';
};

export const API_BASE_URL = getBaseUrl();

// API endpoints
export const ENDPOINTS = {
    ADD_USER: '/AddUser',
    GENERATE_QR_CODE: '/generateQR',
    SIGN_IN: '/SignIn',
    GET_USER: '/Users',
    GET_CARD: '/Cards',
    ADD_CARD: '/AddCard',
    GET_CONTACTS: '/Contacts',
    ADD_CONTACT: '/AddContact',
    UPDATE_USER: '/UpdateUser',
    UPDATE_PROFILE_IMAGE: '/Users/:id/profile-image',
    UPDATE_COMPANY_LOGO: '/Users/:id/company-logo', 
    UPDATE_USER_COLOR: '/Users/:id/color', 
    ADD_TO_WALLET: '/Cards/:userId/wallet/:cardIndex',
    DELETE_CONTACT: '/Contacts',
    UPDATE_CARD: '/Cards/:id',
    UPDATE_CARD_COLOR: '/Cards/:id/color',
    CREATE_MEETING: '/meetings',
    MEETING_INVITE: '/meetings/invite',
    DELETE_CARD: '/Cards/:id',
    UPGRADE_USER: '/Users/:id/upgrade',    
    INITIALIZE_PAYMENT: '/payment/initialize',
    SUBSCRIPTION_STATUS: '/subscription/status',
    CANCEL_SUBSCRIPTION: '/subscription/cancel',    // Billing endpoints (Premium/Free plans) - These map to existing backend routes
    BILLING_SUBSCRIPTION_STATUS: '/subscription/status',  // ✅ EXISTS
    BILLING_SUBSCRIPTION_PLANS: '/subscription/plans',   // ❌ NEED TO ADD  
    BILLING_SUBSCRIPTION_LOGS: '/subscription/logs',     // ✅ EXISTS
    BILLING_CANCEL_SUBSCRIPTION: '/subscription/cancel', // ✅ EXISTS
    BILLING_INITIALIZE_PAYMENT: '/subscription/initialize', // ✅ EXISTS
    BILLING_UPDATE_PLAN: '/subscription/plan',           // NEW: Direct plan changes
    BILLING_PAYMENT_METHODS: '/billing/payment-methods', // NEW: Payment method CRUD

    // Enterprise inquiry endpoints
    ENTERPRISE_INQUIRY_SUBMIT: '/enterprise/inquiry',
    ENTERPRISE_DEMO_REQUEST: '/enterprise/demo',
    ENTERPRISE_SALES_CONTACT: '/enterprise/contact-sales',

    // Enterprise-related endpoints
    ENTERPRISE_CARDS: `/enterprise/:enterpriseId/cards`,
    ENTERPRISE_DEPARTMENTS: `/enterprise/:enterpriseId/departments`,
    ENTERPRISE_EMPLOYEES: `/enterprise/:enterpriseId/employees`,
    ENTERPRISE_CREATE_DEPARTMENT: `/enterprise/:enterpriseId/departments`,
    ENTERPRISE_DELETE_DEPARTMENT: `/enterprise/:enterpriseId/departments/:departmentId`,
    ENTERPRISE_UPDATE_DEPARTMENT: `/enterprise/:enterpriseId/departments/:departmentId`,
    GET_ENTERPRISE: `/enterprise/:enterpriseId`,
    UPDATE_ENTERPRISE: `/enterprise/:enterpriseId`,   
    ENTERPRISE_CONTACTS: `/enterprise/:enterpriseId/contacts/details`,
    ENTERPRISE_DEPARTMENT_CONTACTS: `/enterprise/:enterpriseId/departments/:departmentId/contacts/details`,
    ENTERPRISE_CONTACTS_SUMMARY: `/enterprise/:enterpriseId/contacts/summary`,
};

// Helper function to build enterprise endpoints with the enterpriseId
export const buildEnterpriseUrl = (endpoint: string, enterpriseId: string = DEFAULT_ENTERPRISE_ID) => {
  return buildUrl(endpoint.replace(':enterpriseId', enterpriseId));
};

// Function to get authenticated headers for enterprise API calls
export const getEnterpriseHeaders = () => {
  return {
    'Authorization': `Bearer ${FIREBASE_TOKEN}`,
    'Content-Type': 'application/json'
  };
};

export const buildUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

// Web-specific utility function to get headers with authentication
export const getAuthHeaders = async (additionalHeaders = {}) => {
  const token = localStorage.getItem('userToken');
  return {
    'Authorization': token || '',
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
};

export const getUserId = (): string | null => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData).id;
    }
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Helper function to make authenticated requests
export const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // Try to get token from localStorage first, fallback to FIREBASE_TOKEN
    const localToken = localStorage.getItem('userToken');
    const token = localToken || FIREBASE_TOKEN;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Fixed: Added "Bearer " prefix
      ...options.headers,
    };

    const response = await fetch(buildUrl(endpoint), {
      ...options, 
      headers,
    });

    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
};

// ==============================================================================
// BILLING FUNCTIONS (Phase 1 - Following existing app architecture)
// ==============================================================================

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
      plan: 'free'
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
        amount: 159.99
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
    const response = await authenticatedFetch(ENDPOINTS.BILLING_CANCEL_SUBSCRIPTION, {
      method: 'POST',
      body: JSON.stringify({
        subscriptionCode,
        reason: reason || 'User requested cancellation',
        feedback: reason,
        effectiveDate: 'end_of_period'
      })
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
    const response = await authenticatedFetch(ENDPOINTS.BILLING_INITIALIZE_PAYMENT, {
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