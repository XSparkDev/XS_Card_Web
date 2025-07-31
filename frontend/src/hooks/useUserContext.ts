import { useState, useEffect } from 'react';
import { ENDPOINTS, buildUrl, buildEnterpriseUrl, getAuthHeaders, getEnterpriseHeaders, FIREBASE_TOKEN, DEFAULT_USER_ID } from '../utils/api';

export interface UserContext {
  isEnterprise: boolean;
  userId?: string;
  enterpriseId?: string;
  isLoading: boolean;
  error?: string;
}

export const useUserContext = () => {
  const [userContext, setUserContext] = useState<UserContext>({
    isEnterprise: false, // Default to individual instead of enterprise
    isLoading: true,
    enterpriseId: undefined
  });

  useEffect(() => {
    const detectUserContext = async () => {
      try {
        setUserContext(prev => ({ ...prev, isLoading: true, error: undefined }));

        // TODO: When login page is implemented, get user ID from localStorage or token
        // For now, use the hardcoded user ID from api.ts
        const userId = DEFAULT_USER_ID; // "x-spark-test"
        
        console.log('Using hardcoded user ID:', userId); // Debug log
        
        // First try to check if this is an enterprise user
        await checkEnterpriseUser(userId);
      } catch (error) {
        console.warn('Could not detect user context, trying individual user fallback:', error);
        await tryIndividualUserFallback();
      }
    };

    const checkEnterpriseUser = async (userId: string) => {
      try {
        // Try to get enterprise info - enterprise users are in enterprises collection
        const enterpriseUrl = buildUrl(`/enterprises/${userId}`);
        
        // Use the Firebase token directly for authentication
        const token = FIREBASE_TOKEN;
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        console.log('Checking if enterprise user with URL:', enterpriseUrl); // Debug log
        
        const response = await fetch(enterpriseUrl, { headers });
        
        console.log('Enterprise check response status:', response.status); // Debug log
        
        if (response.ok) {
          const enterpriseData = await response.json();
          const enterprise = enterpriseData.data || enterpriseData;
          
          console.log('Enterprise data from API:', enterprise); // Debug log
          
          // This is an enterprise user
          setUserContext({
            isEnterprise: true,
            userId,
            enterpriseId: userId, // Enterprise ID is the same as user ID for enterprise users
            isLoading: false
          });
        } else {
          console.log('Not an enterprise user, checking individual user...');
          // Not an enterprise user, try individual user
          await checkIndividualUser(userId);
        }
      } catch (error) {
        console.warn('Could not check enterprise user, trying individual user:', error);
        await checkIndividualUser(userId);
      }
    };

    const checkIndividualUser = async (userId: string) => {
      try {
        // Get user info from the users collection
        const userUrl = buildUrl(`${ENDPOINTS.GET_USER}/${userId}`);
        
        // Use the Firebase token directly for authentication
        const token = FIREBASE_TOKEN;
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        console.log('Checking individual user with URL:', userUrl); // Debug log
        
        const response = await fetch(userUrl, { headers });
        
        console.log('Individual user API response status:', response.status); // Debug log
        
        if (response.ok) {
          const userData = await response.json();
          const user = userData.data || userData;
          
          console.log('Individual user data from API:', user); // Debug log
          
          // This is an individual user
          setUserContext({
            isEnterprise: false,
            userId,
            enterpriseId: undefined,
            isLoading: false
          });
        } else {
          console.warn(`Individual user API failed with status ${response.status}, trying fallback`);
          // User not found in either collection, try fallback
          await tryIndividualUserFallback();
        }
      } catch (error) {
        console.warn('Could not get individual user info, trying fallback:', error);
        await tryIndividualUserFallback();
      }
    };

    const tryIndividualUserFallback = async () => {
      try {
        // Try to access enterprise endpoint to see if user is enterprise
        const enterpriseUrl = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CARDS);
        const headers = getEnterpriseHeaders();
        
        console.log('Trying enterprise fallback with URL:', enterpriseUrl); // Debug log
        
        const response = await fetch(enterpriseUrl, { headers });
        
        console.log('Enterprise fallback response status:', response.status); // Debug log
        
        if (response.ok) {
          // User can access enterprise endpoint, so they're enterprise
          console.log('Enterprise fallback succeeded - user is enterprise');
          setUserContext({
            isEnterprise: true,
            userId: DEFAULT_USER_ID,
            enterpriseId: DEFAULT_USER_ID,
            isLoading: false
          });
        } else {
          // User cannot access enterprise endpoint, so they're individual
          console.log('Enterprise fallback failed - user is individual');
          setUserContext({
            isEnterprise: false,
            userId: DEFAULT_USER_ID,
            enterpriseId: undefined,
            isLoading: false
          });
        }
      } catch (error) {
        console.warn('Enterprise fallback failed, defaulting to individual:', error);
        // Final fallback - assume individual (most users are individual)
        setUserContext({
          isEnterprise: false,
          userId: DEFAULT_USER_ID,
          enterpriseId: undefined,
          isLoading: false,
          error: 'Could not determine user type, defaulting to individual'
        });
      }
    };

    detectUserContext();
  }, []);

  return userContext;
}; 