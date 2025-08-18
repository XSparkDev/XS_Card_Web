// Add these types near the top of the file
export interface PasscreatorResponse {
    message: string;
    passUri: string;
    passFileUrl: string;
    passPageUrl: string;
    identifier: string;
    colorScheme?: string; // Add default color support
}

// Employee Types
export interface Employee {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  position?: string;
  departmentId?: string;
  departmentName?: string;
  employeeNumber?: string;
  title?: string;
  role?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  departmentRef: string;
  leaderId: string;
  leaderRef: string | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamsResponse {
  success: boolean;
  teams: Team[];
  count: number;
  message?: string;
}

export interface EmployeeSearchResponse {
  success: boolean;
  data: {
    employees: Employee[];
    total: number;
    page?: number;
    limit?: number;
  };
  message?: string;
}

// Template Types
export interface Template {
  id: string;
  name: string;
  description?: string;
  colorScheme: string;
  companyLogo?: string | null;
  departmentId?: string | null;
  isEnterprise?: boolean;
  createdBy?: string;
  createdByRole?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface DepartmentTemplatesResponse {
  success: boolean;
  data: {
    departmentId: string;
    templates: Template[];
    total: number;
  };
}

export interface EffectiveTemplateResponse {
  success: boolean;
  data: {
    template?: Template;
    source?: 'department' | 'enterprise' | 'default';
    inheritance?: string;
  } | null;
  message?: string;
  fallback?: {
    colorScheme: string;
    companyLogo?: string | null;
  };
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
  timestamp: string | null | undefined; // Allow null/undefined timestamps
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
export const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU3YmZiMmExMWRkZmZjMGFkMmU2ODE0YzY4NzYzYjhjNjg3NTgxZDgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzU1NDgwOTM1LCJ1c2VyX2lkIjoieXk5cHJuVThzTVdzam9RVmFIaVpTUXJ3S0ZKMiIsInN1YiI6Inl5OXByblU4c01Xc2pvUVZhSGlaU1Fyd0tGSjIiLCJpYXQiOjE3NTU0ODA5MzUsImV4cCI6MTc1NTQ4NDUzNSwiZW1haWwiOiJoaWdlbmF3OTcyQGZ1cnNlZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJoaWdlbmF3OTcyQGZ1cnNlZS5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.Yq43Hz6UJey-0to3UhJY4fE1IEBAx7T-VaBR0yURUcAbSEQpavU6SCfRySTmKNmYJIn7WHTIsaoGBt6-HmEQRHB4dLrHSvFFEiU4BKzpFpZC0i6C65lwUBgRpDEPg-STZqlYZtrof0GNQZ6JUKc3ILNBnUa2kT-epDBi4uKBuv3l47GczlMTBogipEVclB_26Uvg0IQAvTx42SppX_GhAOGNQFDSwVKgC7kuCRzi3T4BZzIWb87L_rO5vzce5G7Ka6agr5OstsuWWjZMteknKbWX7-Qtu86qhvvqUrlkGr29Cn1XooM9kXaW_8VI0CjgtH8-MD9I1FQ8WKj_QNk2LA";

// Enterprise ID commonly used in the app
export const DEFAULT_ENTERPRISE_ID = "x-spark-test";// "x-spark-test";

// Default user ID specifically for meetings and user-specific features
//export const DEFAULT_USER_ID = "EccyMCv7uiS1eYHB3ZMu6zRR1DG2"; // user
//export const DEFAULT_USER_ID = "EccyMCv7uiS1eYHB3ZMu6zRR1DG2"; // employee
//export const DEFAULT_USER_ID = "jbtu0MfGddPJLWnrHmHKCvFhm1j2"; // admin
export const DEFAULT_USER_ID = "yy9prnU8sMWsjoQVaHiZSQrwKFJ2"; // manager




// Example payment method ID for testing
export const EXAMPLE_PAYMENT_METHOD_ID = "C1qy82bmgPwZdqjfqBQ8";

// Configuration for handling insecure connections
export const API_CONFIG = {
  // Allow HTTP requests from HTTPS pages (mixed content)
  allowMixedContent: true,
  // Bypass CORS restrictions in development
  bypassCORS: true,
  // Allow self-signed certificates
  allowSelfSigned: true,
  // Disable SSL verification for development
  disableSSLVerification: true
};

// Additional configuration for form autofill and credit card features
export const FORM_AUTOFILL_CONFIG = {
  // Enable autofill even on insecure connections (development only)
  enableInsecureAutofill: true,
  // Force autocomplete attributes
  forceAutocomplete: true,
  // Override browser security for forms
  overrideFormSecurity: true
};

// Helper function to get the appropriate base URL with security considerations
const getBaseUrl = () => {
  // Check if we're
  const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.port === '3000' ||
    window.location.port === '5173'; // Vite default port
  
  // In development, allow insecure connections
  if (isDevelopment) {
    // Check if we need to use HTTP or HTTPS based on current page protocol
    const protocol = window.location.protocol;
    const isSecurePage = protocol === 'https:';
    
    // If we're on a secure page but want to connect to local dev server
    if (isSecurePage && API_CONFIG.allowMixedContent) {
      console.warn('⚠️ Mixed content warning: HTTPS page connecting to HTTP API');
      console.warn('🔧 For development only - do not use in production');
    }
    
    return 'http://localhost:8383';
  }
  
  // In production, use secure connection
  return 'https://xscard-app.onrender.com';
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
    UPDATE_CARD_BY_INDEX: '/Cards/:userId?cardIndex=:cardIndex',
    UPDATE_CARD_COLOR: '/Cards/:id/color',
    CREATE_MEETING: '/meetings',
    MEETING_INVITE: '/meetings/invite',
    DELETE_CARD: '/Cards/:id',
    UPGRADE_USER: '/Users/:id/upgrade',    
    SUBSCRIPTION_STATUS: '/subscription/status',
    CANCEL_SUBSCRIPTION: '/subscription/cancel',
    UPLOAD_IMAGE: '/upload-image',
    DEACTIVATE_USER: '/deactivate',
    REACTIVATE_USER: '/reactivate',
    
    // Billing endpoints (Premium/Free plans) - These map to existing backend routes
    BILLING_SUBSCRIPTION_STATUS: '/subscription/status',  // ✅ EXISTS
    BILLING_SUBSCRIPTION_PLANS: '/subscription/plans',   // ❌ NEED TO ADD  
    BILLING_SUBSCRIPTION_LOGS: '/subscription/logs',     // ✅ EXISTS
    BILLING_INITIALIZE_PAYMENT: '/subscription/initialize', // ✅ EXISTS - Main payment initialization
    BILLING_TRIAL_INITIALIZE: '/subscription/trial/initialize', // NEW: Trial-specific initialization
    BILLING_UPDATE_PLAN: '/subscription/plan',           // NEW: Direct plan changes
    BILLING_PAYMENT_METHODS: '/billing/payment-methods', // NEW: Payment method CRUD
    BILLING_PAYMENT_METHOD_BY_ID: '/billing/payment-methods/:id', // NEW: Individual payment method operations (GET, PUT, DELETE)
    BILLING_INVOICES: '/billing/invoices', // NEW: Premium user invoices
    BILLING_INVOICE_BY_ID: '/billing/invoices/:id', // NEW: Individual invoice operations
    BILLING_CANCEL_SUBSCRIPTION: '/subscription/cancel',  // Billing cancel subscription endpoint

    // Enterprise-related endpoints (management routes - no /api prefix)
    ENTERPRISE_CARDS: `/enterprise/:enterpriseId/cards`,
    ENTERPRISE_DEPARTMENTS: `/enterprise/:enterpriseId/departments`,
    ENTERPRISE_EMPLOYEES: `/enterprise/:enterpriseId/employees`,
    ENTERPRISE_CREATE_DEPARTMENT: `/enterprise/:enterpriseId/departments`,
    ENTERPRISE_DELETE_DEPARTMENT: `/enterprise/:enterpriseId/departments/:departmentId`,
    ENTERPRISE_UPDATE_DEPARTMENT: `/enterprise/:enterpriseId/departments/:departmentId`,
    GET_ENTERPRISE: `/enterprise/:enterpriseId`,
    UPDATE_ENTERPRISE: `/enterprise/:enterpriseId`,   
    // API routes (with /api prefix)
    ENTERPRISE_CONTACTS: `/api/enterprise/:enterpriseId/contacts/details`,
    ENTERPRISE_DEPARTMENT_CONTACTS: `/api/enterprise/:enterpriseId/departments/:departmentId/contacts/details`,
    ENTERPRISE_CONTACTS_SUMMARY: `/api/enterprise/:enterpriseId/contacts/summary`,
    ENTERPRISE_INQUIRY_SUBMIT: '/enterprise/inquiry',
    ENTERPRISE_DEMO_REQUEST: '/enterprise/demo',
    ENTERPRISE_SALES_CONTACT: '/enterprise/contact-sales',
    
    // Security and Activity Logs endpoints
    ENTERPRISE_SECURITY_LOGS: `/api/enterprise/:enterpriseId/security/logs`,
    ENTERPRISE_SECURITY_ALERTS: `/api/enterprise/:enterpriseId/security/alerts`,
    
    // Individual Permissions endpoints
    ENTERPRISE_USER_PERMISSIONS: `/api/enterprise/:enterpriseId/users/:userId/permissions`,
    
    // Team Management endpoints (management routes - no /api prefix)
    ENTERPRISE_DEPARTMENT_TEAMS: `/enterprise/:enterpriseId/departments/:departmentId/teams`,
    ENTERPRISE_DEPARTMENT_TEAM_BY_ID: `/enterprise/:enterpriseId/departments/:departmentId/teams/:teamId`,
    ENTERPRISE_DEPARTMENT_TEAM_MEMBERS: `/enterprise/:enterpriseId/departments/:departmentId/teams/:teamId/members`,
    ENTERPRISE_DEPARTMENT_TEAM_ADD_MEMBER: `/enterprise/:enterpriseId/departments/:departmentId/teams/:teamId/members/:employeeId`,
    ENTERPRISE_DEPARTMENT_TEAM_REMOVE_MEMBER: `/enterprise/:enterpriseId/departments/:departmentId/teams/:teamId/members/:employeeId`,
    
    // Bulk Operations endpoints
    BULK_DEACTIVATE: `/bulk-deactivate`,
    BULK_REACTIVATE: `/bulk-reactivate`,
    
    // Cache Management endpoints
    CACHE_STATS: `/api/cache/stats`,
    CACHE_CLEAR: `/api/cache/clear`,
    CACHE_DEPARTMENTS_CLEAR: `/api/cache/departments/clear`,
    CACHE_WARM: `/api/cache/warm`,
    CACHE_CONFIG: `/api/cache/config`,
    CACHE_ANALYTICS: `/api/cache/analytics`,
    
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

// Request cache to prevent duplicate simultaneous requests
// Request cache for deduplication (currently unused but reserved for future optimization)
// const requestCache = new Map<string, Promise<Response>>();

// Enhanced helper function to make authenticated requests with better error handling and insecure connection support
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

    // Configure request options for insecure connections
    const requestOptions: RequestInit = {
      ...options,
      headers,
    };    // In development, configure request options for cross-origin requests
    const isDevelopment = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.');

    if (isDevelopment && API_CONFIG.bypassCORS) {
      // Set mode to 'cors' for cross-origin requests
      // Note: DO NOT set CORS response headers in the request - that's the server's job!
      requestOptions.mode = 'cors';
      requestOptions.credentials = 'omit'; // Don't send credentials for development
    }

    // For mixed content (HTTPS to HTTP), we need to handle it carefully
    const currentProtocol = window.location.protocol;
    const targetUrl = buildUrl(endpoint);
    
    if (currentProtocol === 'https:' && targetUrl.startsWith('http:')) {
      console.warn('🔒 Mixed content detected - attempting insecure request from secure page');
      console.warn('🔧 Target URL:', targetUrl);
      
      if (!API_CONFIG.allowMixedContent) {
        throw new Error('Mixed content blocked - set API_CONFIG.allowMixedContent to true for development');
      }
    }

    const response = await fetch(targetUrl, requestOptions);

    // Add response status checking
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} for ${endpoint}`);
      
      // Handle specific HTTP errors that might be related to security
      if (response.status === 0 || response.status === 404) {
        console.warn('🌐 Network error - this might be due to CORS or mixed content restrictions');
        console.warn('💡 Try: 1) Check if the server is running, 2) Verify CORS settings, 3) Check mixed content policies');
      }
      
      return response; // Still return the response to let calling code handle it
    }

    return response;
  } catch (error) {
    console.error('Authenticated fetch error for endpoint:', endpoint, error);
    
    // Provide helpful error messages for common insecure connection issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('🚫 Network error - possible causes:');
      console.error('   • CORS policy blocking the request');
      console.error('   • Mixed content policy (HTTPS → HTTP)');
      console.error('   • Server not accessible or not running');
      console.error('   • SSL/TLS certificate issues');
      console.error('💡 For development, ensure API_CONFIG settings allow insecure connections');
    }
    
    throw error;
  }
};

// Function to enable credit card autofill on insecure connections
export const enableInsecureAutofill = () => {
  if (window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('192.168.')) {
    console.warn('⚠️ Insecure autofill is only recommended for localhost development');
    return false;
  }

  console.log('💳 Attempting to enable credit card autofill on insecure connection...');

  // Method 1: Add autocomplete meta tag
  if (document && !document.querySelector('meta[name="format-detection"]')) {
    const formatMeta = document.createElement('meta');
    formatMeta.name = 'format-detection';
    formatMeta.content = 'telephone=no, date=no, address=no, email=no, url=no';
    document.head.appendChild(formatMeta);
    console.log('📱 Added format-detection meta tag');
  }

  // Method 2: Add viewport meta with user-scalable for mobile autofill
  const existingViewport = document.querySelector('meta[name="viewport"]');
  if (existingViewport && !existingViewport.getAttribute('content')?.includes('user-scalable')) {
    const currentContent = existingViewport.getAttribute('content') || '';
    existingViewport.setAttribute('content', currentContent + ', user-scalable=yes');
    console.log('📱 Updated viewport meta for autofill compatibility');
  }

  // Method 3: Override form security programmatically
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string, options?: ElementCreationOptions) {
    const element = originalCreateElement.call(this, tagName, options);
    
    if (tagName.toLowerCase() === 'form') {
      // Force secure attributes on forms
      (element as HTMLFormElement).setAttribute('autocomplete', 'on');
      (element as HTMLFormElement).setAttribute('data-lpignore', 'false');
      console.log('🔒 Enhanced form element for autofill');
    }
    
    if (tagName.toLowerCase() === 'input') {
      const inputElement = element as HTMLInputElement;
      // Ensure credit card inputs have proper autocomplete attributes
      const name = inputElement.name || inputElement.id || '';
      if (name.includes('card') || name.includes('credit')) {
        inputElement.setAttribute('data-lpignore', 'false');
        inputElement.setAttribute('data-form-type', 'payment');
        console.log('💳 Enhanced credit card input for autofill');
      }
    }
    
    return element;
  };

  console.log('✅ Insecure autofill configuration applied');
  return true;
};

// Function to configure specific form for credit card autofill
export const configureFormForAutofill = (formElement: HTMLFormElement) => {
  if (!formElement) return;

  console.log('💳 Configuring form for credit card autofill...');

  // Set form attributes for autofill
  formElement.setAttribute('autocomplete', 'on');
  formElement.setAttribute('data-lpignore', 'false');
  formElement.setAttribute('data-form-type', 'payment');
  
  // Configure individual inputs
  const inputs = formElement.querySelectorAll('input');
  inputs.forEach(input => {
    configureInputForAutofill(input);
  });

  console.log('✅ Form configured for autofill');
};

// Function to configure individual inputs for autofill
export const configureInputForAutofill = (inputElement: HTMLInputElement) => {
  if (!inputElement) return;

  const name = (inputElement.name || inputElement.id || '').toLowerCase();
  
  // Set appropriate autocomplete values based on input purpose
  if (name.includes('cardnumber') || name.includes('card-number') || name.includes('cc-number')) {
    inputElement.setAttribute('autocomplete', 'cc-number');
    inputElement.setAttribute('data-lpignore', 'false');
    inputElement.setAttribute('x-autocompletetype', 'cc-number');
  } else if (name.includes('expiry') || name.includes('exp')) {
    if (name.includes('month')) {
      inputElement.setAttribute('autocomplete', 'cc-exp-month');
      inputElement.setAttribute('x-autocompletetype', 'cc-exp-month');
    } else if (name.includes('year')) {
      inputElement.setAttribute('autocomplete', 'cc-exp-year');
      inputElement.setAttribute('x-autocompletetype', 'cc-exp-year');
    } else {
      inputElement.setAttribute('autocomplete', 'cc-exp');
      inputElement.setAttribute('x-autocompletetype', 'cc-exp');
    }
  } else if (name.includes('cvv') || name.includes('cvc') || name.includes('security')) {
    inputElement.setAttribute('autocomplete', 'cc-csc');
    inputElement.setAttribute('x-autocompletetype', 'cc-csc');
  } else if (name.includes('name') || name.includes('cardholder')) {
    inputElement.setAttribute('autocomplete', 'cc-name');
    inputElement.setAttribute('x-autocompletetype', 'cc-name');
  }

  // Add general autofill enabling attributes
  inputElement.setAttribute('data-lpignore', 'false');
  inputElement.setAttribute('data-form-type', 'payment');
  
  console.log(`💳 Configured input "${name}" for autofill`);
};

// Date utility functions
export const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.getFullYear() > 1900;
};

export const safeFormatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Subscription status helpers
export const isTrialExpired = (trialEndDate: string | undefined): boolean => {
  if (!trialEndDate) return false;
  return new Date(trialEndDate) < new Date();
};

export const getSubscriptionStatusMessage = (subscription: SubscriptionStatus): string => {
  if (subscription.subscriptionStatus === 'trial') {
    if (subscription.trialEndDate && isTrialExpired(subscription.trialEndDate)) {
      return 'Trial expired - Please upgrade to continue';
    }
    return 'Trial active';
  }
  
  switch (subscription.subscriptionStatus) {
    case 'active':
      return 'Subscription active';
    case 'cancelled':
      return 'Subscription cancelled';
    case 'past_due':
      return 'Payment past due';
    case 'none':
    default:
      return 'No active subscription';
  }
};

// Development helper functions
export const checkServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    return response.ok;
  } catch (error) {
    console.error('❌ Server connection check failed:', error);
    return false;
  }
};

export const setupInsecureConnectionSupport = () => {
  const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.');

  if (!isDevelopment) {
    console.warn('⚠️ Insecure connection support should only be enabled in development');
    return;
  }

  console.log('🔧 Setting up development environment for insecure connections...');

  // Enable autofill on insecure connections
  enableInsecureAutofill();

  // Log current configuration
  console.log('📋 Development API Configuration:');
  console.log(`   • API Base URL: ${API_BASE_URL}`);
  console.log(`   • Allow Mixed Content: ${API_CONFIG.allowMixedContent}`);
  console.log(`   • Bypass CORS: ${API_CONFIG.bypassCORS}`);
  console.log(`   • Current Protocol: ${window.location.protocol}`);
  console.log(`   • Current Host: ${window.location.hostname}:${window.location.port}`);

  // Check server connectivity
  checkServerConnection().then(isConnected => {
    if (isConnected) {
      console.log('✅ Server is accessible');
    } else {
      console.warn('❌ Server is not accessible - check if backend is running on', API_BASE_URL);
      console.warn('💡 Common fixes:');
      console.warn('   1. Start the backend server');
      console.warn('   2. Check if port 8383 is open');
      console.warn('   3. Verify CORS is configured on the backend');
    }
  });
};

export const bypassSecurityForDevelopment = () => {
  const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.');

  if (!isDevelopment) {
    console.warn('⚠️ Security bypass is only allowed in development');
    return false;
  }

  console.log('🚨 DEVELOPMENT ONLY: Bypassing security restrictions...');
  
  // Override fetch for development
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    
    if (url.includes(API_BASE_URL)) {
      const modifiedInit = {
        ...init,
        mode: 'cors' as RequestMode,
        credentials: 'omit' as RequestCredentials,
        headers: {
          ...init?.headers,
          // Remove any CORS headers that the client shouldn't set
        }
      };

      // Remove CORS response headers if they were mistakenly added
      if (modifiedInit.headers && typeof modifiedInit.headers === 'object') {
        const headers = modifiedInit.headers as Record<string, string>;
        delete headers['Access-Control-Allow-Origin'];
        delete headers['Access-Control-Allow-Methods'];
        delete headers['Access-Control-Allow-Headers'];
      }

      console.log(`🌐 Development fetch to: ${url}`);
      return originalFetch(input, modifiedInit);
    }
    
    return originalFetch(input, init);
  };

  console.log('✅ Development security bypass activated');
  return true;
};

// Automatically setup development environment when in dev mode
(() => {
  const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.');

  if (isDevelopment) {
    console.log('🚀 XSCard Development Mode Active');
    console.log('💡 Available development helpers:');
    console.log('   • setupInsecureConnectionSupport() - Configure dev environment');
    console.log('   • bypassSecurityForDevelopment() - Override security for dev');
    console.log('   • checkServerConnection() - Test backend connectivity');
    console.log('   • enableInsecureAutofill() - Enable CC autofill on HTTP');
    
    // Auto-setup basic development features
    setTimeout(() => {
      if (API_CONFIG.bypassCORS) {
        setupInsecureConnectionSupport();
      }
    }, 1000);
  }
})();

// Template API Functions
export const fetchDepartmentTemplates = async (departmentId: string, enterpriseId: string = DEFAULT_ENTERPRISE_ID): Promise<DepartmentTemplatesResponse> => {
  try {
    const url = buildEnterpriseUrl(`/api/templates/${enterpriseId}/departments/${departmentId}`);
    const headers = getEnterpriseHeaders();
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const fetchEffectiveTemplate = async (departmentId: string, enterpriseId: string = DEFAULT_ENTERPRISE_ID): Promise<EffectiveTemplateResponse> => {
  try {
    const url = buildEnterpriseUrl(`/api/templates/${enterpriseId}/${departmentId}/effective`);
    const headers = getEnterpriseHeaders();
    
    console.log('🎨 Fetching effective template:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        data: null,
        message: `HTTP ${response.status}: ${errorText}`,
        fallback: {
          colorScheme: '#1B2B5B',
          companyLogo: null
        }
      };
    }
    
    const result = await response.json();
    
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Unknown error',
      fallback: {
        colorScheme: '#1B2B5B',
        companyLogo: null
      }
    };
  }
};

export const getAvailableTemplatesForDepartment = async (departmentId: string, enterpriseId: string = DEFAULT_ENTERPRISE_ID): Promise<{
  departmentTemplates: Template[];
  enterpriseTemplates: Template[];
  defaultTemplate: Template;
}> => {
  try {
    // Fetch department templates
    const deptResponse = await fetchDepartmentTemplates(departmentId, enterpriseId);
    const departmentTemplates = deptResponse.success ? deptResponse.data.templates : [];
    
    // Fetch enterprise templates (all templates for the enterprise)
    const enterpriseUrl = buildEnterpriseUrl(`/api/templates/${enterpriseId}`);
    const headers = getEnterpriseHeaders();
    
    const enterpriseResponse = await fetch(enterpriseUrl, {
      method: 'GET',
      headers
    });
    
    let enterpriseTemplates: Template[] = [];
    if (enterpriseResponse.ok) {
      const enterpriseResult = await enterpriseResponse.json();
      if (enterpriseResult.success && enterpriseResult.data) {
        enterpriseTemplates = enterpriseResult.data.enterpriseTemplates || [];
      }
    }
    
    // Create default template
    const defaultTemplate: Template = {
      id: 'default',
      name: 'Default Template',
      description: 'Default card template with standard styling',
      colorScheme: '#1B2B5B',
      companyLogo: null,
      departmentId: null,
      isEnterprise: false
    };
    
    return {
      departmentTemplates,
      enterpriseTemplates,
      defaultTemplate
    };
  } catch (error) {
    return {
      departmentTemplates: [],
      enterpriseTemplates: [],
      defaultTemplate: {
        id: 'default',
        name: 'Default Template',
        description: 'Default card template with standard styling',
        colorScheme: '#1B2B5B',
        companyLogo: null,
        departmentId: null,
        isEnterprise: false
      }
    };
  }
};

// Employee Search Functions
export const fetchAllEmployees = async (enterpriseId: string = DEFAULT_ENTERPRISE_ID): Promise<EmployeeSearchResponse> => {
  try {
    const url = buildEnterpriseUrl(`/enterprise/${enterpriseId}/employees`);
    const headers = getEnterpriseHeaders();
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        data: {
          employees: [],
          total: 0
        },
        message: `HTTP ${response.status}: ${errorText}`
      };
    }
    
    const result = await response.json();
    
    // Transform backend response to match expected structure
    return {
      success: result.success,
      data: {
        employees: result.employees || [],
        total: result.totalCount || 0
      },
      message: result.message
    };
  } catch (error) {
    return {
      success: false,
      data: {
        employees: [],
        total: 0
      },
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const searchEmployees = async (
  searchTerm: string, 
  enterpriseId: string = DEFAULT_ENTERPRISE_ID
): Promise<EmployeeSearchResponse> => {
  try {
    const url = buildEnterpriseUrl(`/enterprise/${enterpriseId}/employees?search=${encodeURIComponent(searchTerm)}`);
    const headers = getEnterpriseHeaders();
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        data: {
          employees: [],
          total: 0
        },
        message: `HTTP ${response.status}: ${errorText}`
      };
    }
    
    const result = await response.json();
    
    // Transform backend response to match expected structure
    return {
      success: result.success,
      data: {
        employees: result.employees || [],
        total: result.totalCount || 0
      },
      message: result.message
    };
  } catch (error) {
    return {
      success: false,
      data: {
        employees: [],
        total: 0
      },
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Individual Permissions Functions
export const updateUserIndividualPermissions = async (
  userId: string,
  individualPermissions: { removed: string[], added: string[] },
  enterpriseId: string = DEFAULT_ENTERPRISE_ID
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_USER_PERMISSIONS.replace(':userId', userId), enterpriseId);
    const headers = getEnterpriseHeaders();
    
    console.log('🌐 API Call - updateUserIndividualPermissions:', {
      url,
      userId,
      individualPermissions,
      enterpriseId
    });
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ individualPermissions })
    });
    
    console.log('📡 API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return {
        success: false,
        message: `HTTP ${response.status}: ${errorText}`
      };
    }
    
    const result = await response.json();
    console.log('✅ API Success:', result);
    return result;
  } catch (error) {
    console.error('❌ API Exception:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Team Functions
export const fetchTeamsForDepartment = async (
  departmentId: string,
  enterpriseId: string = DEFAULT_ENTERPRISE_ID
): Promise<TeamsResponse> => {
  try {
    const url = buildEnterpriseUrl(`/enterprise/${enterpriseId}/departments/${departmentId}/teams`);
    const headers = getEnterpriseHeaders();
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        teams: [],
        count: 0,
        message: `HTTP ${response.status}: ${errorText}`
      };
    }
    
    const result = await response.json();
    
    return {
      success: result.success,
      teams: result.teams || [],
      count: result.count || 0
    };
  } catch (error) {
    return {
      success: false,
      teams: [],
      count: 0
    };
  }
};
