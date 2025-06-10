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
export const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE0YTEwZGVjZTk4MzY2ZDZmNjNlMTY3Mjg2YWU5YjYxMWQyYmFhMjciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzQ5NTE4Nzk0LCJ1c2VyX2lkIjoiRWNjeU1Ddjd1aVMxZVlIQjNaTXU2elJSMURHMiIsInN1YiI6IkVjY3lNQ3Y3dWlTMWVZSEIzWk11NnpSUjFERzIiLCJpYXQiOjE3NDk1MTg3OTQsImV4cCI6MTc0OTUyMjM5NCwiZW1haWwiOiJ0ZXN0ZWhha2tlQGd1ZnVtLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RlaGFra2VAZ3VmdW0uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.dnHgvc4m3NicauhJSSlU6qlx00YX53p2IHkKyZ6YdqtJQGtaLYmWX_RlQbPVemOhx4NWg87MG0plJNjB43tY0gGtA1Ls5NnOJ9yRoZLmHYx-IvU0X0NSlY87ms0hh6BwSsmCozXby5Pr0Mq_Bi6cb2IPYloiaLmDEufqk1O91dT-YsNj607QDN1ua71Y91NVX2oA1QRtyDF-1ckaYodzKrjxJ1Q6F4Q4I86krwtNEaXOItkiPcaSBDomyW9bGrM5jxHNKa99S91cheM2ZLhIldpN1bgfZAWkJ280nXOd_HbQAMYYuqsayCjLMm4zaA8TgiY_slZiyV2TYtwTZBLu7A";

// Enterprise ID commonly used in the app
export const DEFAULT_ENTERPRISE_ID = "PegXyjZYojbLudlmOmDf";
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
    CANCEL_SUBSCRIPTION: '/subscription/cancel',

    // Enterprise-related endpoints
    ENTERPRISE_CARDS: `/enterprise/:enterpriseId/cards`,
    ENTERPRISE_DEPARTMENTS: `/enterprise/:enterpriseId/departments`,
    ENTERPRISE_EMPLOYEES: `/enterprise/:enterpriseId/employees`,
    ENTERPRISE_CREATE_DEPARTMENT: `/enterprise/:enterpriseId/departments`,
    ENTERPRISE_DELETE_DEPARTMENT: `/enterprise/:enterpriseId/departments/:departmentId`,
    ENTERPRISE_UPDATE_DEPARTMENT: `/enterprise/:enterpriseId/departments/:departmentId`,
    GET_ENTERPRISE: `/enterprises/:enterpriseId`,
    UPDATE_ENTERPRISE: `/enterprises/:enterpriseId`,
    ENTERPRISE_CONTACTS: `/enterprise/:enterpriseId/contacts/details`,
    ENTERPRISE_DEPARTMENT_CONTACTS: `/enterprise/:enterpriseId/departments/:departmentId/contacts/details`,
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
    const token = localStorage.getItem('userToken');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `${token}`, // Token from login is used here
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