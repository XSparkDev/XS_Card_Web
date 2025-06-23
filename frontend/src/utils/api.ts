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
  emailToken?: string; // Add email token for subscription operations
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
export const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjNiZjA1MzkxMzk2OTEzYTc4ZWM4MGY0MjcwMzM4NjM2NDA2MTBhZGMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzUwNjg0MzAwLCJ1c2VyX2lkIjoiVHJXdWNYZ012RWhtMTN5MVFEdk1WVWQyNzdlMiIsInN1YiI6IlRyV3VjWGdNdkVobTEzeTFRRHZNVlVkMjc3ZTIiLCJpYXQiOjE3NTA2ODQzMDAsImV4cCI6MTc1MDY4NzkwMCwiZW1haWwiOiJ2aXBlYjMyMzEwQG5hYjQuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidmlwZWIzMjMxMEBuYWI0LmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.gKFWgf-IyHYYlsAjbTyqckSdgjrbdTrntdUljWJ2vuo4D5QPCYP2TJMIoJTyykL3rHbVF5LVZYY5z9LdrplAzcZfe44t1JpA9lDj54LhQYC5BqRowurCguqQKb749pYYTgCJj-QojZDvwDpIle5sTX0nYL40TQmwj8HUBTVw2FIZSAIlNW_ENfuoa0wxV-qRS_Gglqwlhwg-3FV93OxYEv3-L1nJBjOJht_3ALMtRR2df-Gk5CFt9DCFXx11GWNrm5R8D29jHmRUsgj7wUy_Nzg82biY-82_jdMfHZMjTgM9FO6zScGvs1lpNJRElynTluRLLwuVAlg2VsLHHlnzpg";

// Enterprise ID commonly used in the app
export const DEFAULT_ENTERPRISE_ID = "PegXyjZYojbLudlmOmDf";

// Default user ID specifically for meetings and user-specific features
export const DEFAULT_USER_ID = "TrWucXgMvEhm13y1QDvMVUd277e2";

// Helper function to get the appropriate base URL
const getBaseUrl = () => {
  // return 'https://xscard-app.onrender.com';
  return 'http://localhost:8384';
};

export const API_BASE_URL = getBaseUrl();

// API endpoints
export const ENDPOINTS = {
    // Shared endpoints
    SIGN_IN: '/SignIn',
    INITIALIZE_PAYMENT: '/payment/initialize',
    ADD_USER: '/AddUser',
    GENERATE_QR_CODE: '/generateQR',
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
    SUBSCRIPTION_STATUS: '/subscription/status',
    CANCEL_SUBSCRIPTION: '/subscription/cancel',    // Billing endpoints (Premium/Free plans) - These map to existing backend routes
    BILLING_SUBSCRIPTION_STATUS: '/subscription/status',  // ✅ EXISTS
    BILLING_SUBSCRIPTION_PLANS: '/subscription/plans',   // ❌ NEED TO ADD  
    BILLING_SUBSCRIPTION_LOGS: '/subscription/logs',     // ✅ EXISTS
    BILLING_UPDATE_PLAN: '/subscription/plan',           // NEW: Direct plan changes
    BILLING_PAYMENT_METHODS: '/billing/payment-methods', // NEW: Payment method CRUD
    BILLING_CANCEL_SUBSCRIPTION: '/subscription/cancel',  // Billing cancel subscription endpoint



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
    ENTERPRISE_INQUIRY_SUBMIT: '/enterprise/inquiry',
    ENTERPRISE_DEMO_REQUEST: '/enterprise/demo',
    ENTERPRISE_SALES_CONTACT: '/enterprise/contact-sales',
    
};

// Helper function to build enterprise endpoints with the enterpriseId
export const buildEnterpriseUrl = (endpoint: string, enterpriseId: string = DEFAULT_ENTERPRISE_ID) => {
  return buildUrl(endpoint.replace(':enterpriseId', enterpriseId));
};

// Helper function to build billing endpoints with subscription code
export const buildBillingUrl = (endpoint: string, subscriptionCode?: string) => {
  if (subscriptionCode && endpoint.includes(':subscriptionCode')) {
    return buildUrl(endpoint.replace(':subscriptionCode', subscriptionCode));
  }
  return buildUrl(endpoint);
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
    throw error;  }
};