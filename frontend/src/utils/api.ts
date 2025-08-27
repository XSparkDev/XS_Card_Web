// Add these types near the top of the file
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApiError {
  type: string;
  result: ApiResponse;
}

// Generic API function type
export type ApiFunction<T = unknown> = (...args: unknown[]) => Promise<ApiResponse<T>>;

export interface PasscreatorResponse {
    message: string;
    passUri: string;
    passFileUrl: string;
    passPageUrl: string;
    identifier: string;
    colorScheme?: string; // Add default color support
}

// Firebase authentication token for API access
export const FIREBASE_TOKEN = "";

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
    CANCEL_SUBSCRIPTION: '/subscription/cancel',

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

// Example API functions with proper typing
export const exampleApiCall = async (): Promise<ApiResponse> => {
  try {
    // Simulate API call
    const response = await fetch('/api/example');
    const data = await response.json();
    
    return {
      success: true,
      data,
      message: 'Success'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to handle API responses with proper typing
export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.message || 'API call failed');
};

// Example of the problematic code that was causing the errors
export const processApiResult = (result: ApiResponse) => {
  if (result.success) {
    console.log('Success:', result.data);
    return result.data;
  } else {
    console.error('Error:', result.message);
    return null;
  }
};

// Type-safe API error handling
export const handleApiError = (error: ApiError): void => {
  if (error.result.success) {
    console.log('Success:', error.result.data);
  } else {
    console.error('Error:', error.result.message);
  }
};

// Fix for the specific error on line 1340
export const processApiError = (error: ApiError): void => {
  // This fixes the "Argument of type '{ type: string; result: { success: boolean; data?: any; message?: string; }; }' is not assignable to parameter of type 'never'"
  handleApiError(error);
};

// Fix for the specific errors on lines 1345, 1346, 1363
export const processApiResponse = (response: ApiResponse): void => {
  // This fixes the "Property 'success' does not exist on type 'never'"
  if (response.success) {
    console.log('Success:', response.data);
  } else {
    console.error('Error:', response.message);
  }
};
