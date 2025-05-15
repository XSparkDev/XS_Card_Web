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
export const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3ZDhjZWU0ZTYwYmYwMzYxNmM1ODg4NTJiMjA5MTZkNjRjMzRmYmEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzQ3MzA1MzQxLCJ1c2VyX2lkIjoiRWNjeU1Ddjd1aVMxZVlIQjNaTXU2elJSMURHMiIsInN1YiI6IkVjY3lNQ3Y3dWlTMWVZSEIzWk11NnpSUjFERzIiLCJpYXQiOjE3NDczMDUzNDEsImV4cCI6MTc0NzMwODk0MSwiZW1haWwiOiJ0ZXN0ZWhha2tlQGd1ZnVtLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RlaGFra2VAZ3VmdW0uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.KA6XWycR4cZ-AGox9YWIEkVdJPKcx8Pap-HphApw36Jh_9JQJtuuJCgezQ1ZkZDFJiDr1tw4EPyZFzw8bNTJQ81iLRLEonxoldRq918KGqkh9YCHIc7UyMAGOFsIuSY9rFzlcYWKQz8cdRC0h87SjtKn6ofEJEJudkBVDj_0GzdtY4r_xoCJocT17KT3v0LZ2FNUmkKVa0n58EocvmeySDHmc7F_qfTyiGFbvV_fn17_sktcNxI7r4PA9wB_DQqjcRvKGav5fx-iZrwgcLL-BiDl1t-h0JilwFxvz35aRRSFH-ABqt7yXFEgGn8CvHrb3O3Ncsc8HBj_YyNDV8JwvA";

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