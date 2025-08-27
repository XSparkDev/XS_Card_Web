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
