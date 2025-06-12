// Add these types near the top of the file
export interface PasscreatorResponse {
    message: string;
    passUri: string;
    passFileUrl: string;
    passPageUrl: string;
    identifier: string;
    colorScheme?: string; // Add default color support
}

// Firebase authentication token for API access
export const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE0YTEwZGVjZTk4MzY2ZDZmNjNlMTY3Mjg2YWU5YjYxMWQyYmFhMjciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzQ5Njc1Mzk3LCJ1c2VyX2lkIjoiM3VCZnVqSWxUQWFrQ0JKb0dMcTA1T1RTcTY4MiIsInN1YiI6IjN1QmZ1aklsVEFha0NCSm9HTHEwNU9UU3E2ODIiLCJpYXQiOjE3NDk2NzUzOTcsImV4cCI6MTc0OTY3ODk5NywiZW1haWwiOiJkYWRlY2U4NDQ0QGFkcmV3aXJlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImRhZGVjZTg0NDRAYWRyZXdpcmUuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.BLpBqfR42VasbgE3jgKapudU8nEkEpvb_k2To2BdElsxtOK9bbzbgC41tyy3MleRRNFP0XPAFkL6wL1aLTF5wiTnHw6uOGr8ePF5polGt_IaEuqXrwy-xQ_aHknncNpJPqisob2uOGhj__EzgnwK0Wzncimvd2brp7Ajfb3UKp6TWdEz4Dgwh899hTW_B5Z1ND2qWikZX8T6Tbpw6PqAvfkzEkrKXHoHPDSypkM2VcTT4GqqYYnafvhk52iXzfLlS4GIjqwCnzzT12UIitatzFNGigLE5WBFJ3itCvZK-biy971-sOHCurxgm8y_rgGp654alTfltdwwIfUEYorUqg";

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
    UPGRADE_USER: '/Users/:id/upgrade',    INITIALIZE_PAYMENT: '/payment/initialize',
    SUBSCRIPTION_STATUS: '/subscription/status',
    CANCEL_SUBSCRIPTION: '/subscription/cancel',

    // Billing endpoints (Premium/Free plans)
    BILLING_SUBSCRIPTION_STATUS: '/subscription/status',
    BILLING_SUBSCRIPTION_PLANS: '/subscription/plans',
    BILLING_SUBSCRIPTION_LOGS: '/subscription/logs',
    BILLING_CANCEL_SUBSCRIPTION: '/subscription/cancel',
    BILLING_INITIALIZE_PAYMENT: '/payment/initialize',

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