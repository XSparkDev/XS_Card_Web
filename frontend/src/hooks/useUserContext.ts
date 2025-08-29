import { useState, useEffect } from 'react';
import { ENDPOINTS, buildUrl, buildEnterpriseUrl, getEnterpriseHeaders } from '../utils/api';

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

        // Get user data from localStorage (stored by Login component)
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
          throw new Error('No user data found. Please log in first.');
        }
        
        const userData = JSON.parse(userDataStr);
        const userId = userData.id;
        
        console.log('Using user ID from login:', userId); // Debug log
        console.log('User data from login:', userData); // Debug log
        
        // Check if this is an enterprise user based on user data
        console.log('🔍 User data analysis:', {
          plan: userData.plan,
          isEmployee: userData.isEmployee,
          role: userData.role,
          email: userData.email
        });
        
        // More robust enterprise detection
        const isEnterprise = userData.plan === 'enterprise' && userData.isEmployee;
        const isIndividual = userData.plan === 'individual' || userData.plan === 'free' || userData.plan === 'premium';
        
        console.log('🔍 Enterprise detection:', {
          isEnterprise,
          isIndividual,
          plan: userData.plan,
          isEmployee: userData.isEmployee
        });
        
        if (isEnterprise) {
          console.log('✅ User identified as enterprise based on plan and employee status');
          await checkEnterpriseUser(userId);
        } else if (isIndividual) {
          console.log('✅ User identified as individual based on plan');
          await checkIndividualUser(userId);
        } else {
          // Fallback: if plan is enterprise but isEmployee is false, treat as individual
          console.log('⚠️ Ambiguous user type, treating as individual (fallback)');
          await checkIndividualUser(userId);
        }
      } catch (error) {
        console.warn('Could not detect user context, trying individual user fallback:', error);
        await tryIndividualUserFallback();
      }
    };

    const checkEnterpriseUser = async (userId: string) => {
      try {
        // Try to get enterprise info - enterprise users are in enterprises collection
        // Use the enterprise employees endpoint to check if user is enterprise
        const enterpriseUrl = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_EMPLOYEES);
        const headers = getEnterpriseHeaders();
        
        console.log('Checking if enterprise user with URL:', enterpriseUrl); // Debug log
        
        const response = await fetch(enterpriseUrl, { headers });
        
        console.log('Enterprise check response status:', response.status); // Debug log
        
        if (response.ok) {
          const enterpriseData = await response.json();
          console.log('Enterprise data from API:', enterpriseData); // Debug log
          
          // This is an enterprise user
          setUserContext({
            isEnterprise: true,
            userId,
            enterpriseId: 'x-spark-test', // Use the default enterprise ID
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
        
        // Get token from localStorage (stored by Login component)
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          throw new Error('Authentication required. Please log in first.');
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
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
        // Get user data from localStorage for fallback
        const userDataStr = localStorage.getItem('userData');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userId = userData?.id || 'unknown';
        
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
            userId: userId,
            enterpriseId: 'x-spark-test', // Default enterprise ID
            isLoading: false
          });
        } else {
          // User cannot access enterprise endpoint, so they're individual
          console.log('Enterprise fallback failed - user is individual');
          setUserContext({
            isEnterprise: false,
            userId: userId,
            enterpriseId: undefined,
            isLoading: false
          });
        }
      } catch (error) {
        console.warn('Enterprise fallback failed, defaulting to individual:', error);
        // Final fallback - assume individual (most users are individual)
        const userDataStr = localStorage.getItem('userData');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const userId = userData?.id || 'unknown';
        
        setUserContext({
          isEnterprise: false,
          userId: userId,
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