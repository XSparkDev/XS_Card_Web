import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  hasBusinessCardPermission,
  type BusinessCardPermission,
  type UserWithPermissions,
  type IndividualPermissions 
} from '../utils/permissions';
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders, DEFAULT_USER_ID } from '../utils/api';

// Define user roles
export type UserRole = 'Employee' | 'Manager' | 'Administrator' | 'Admin' | 'Lead' | 'Staff';

// Define permissions - Using backend permission names
export interface UserPermissions {
  viewCards: boolean;
  createCards: boolean;
  editCards: boolean;
  deleteCards: boolean;
  shareCards: boolean;
  manageAllCards: boolean;
  exportCards: boolean;
  // Legacy permissions for other features
  generateQRCodes: boolean;
  createTemplates: boolean;
  viewContacts: boolean;
  manageContacts: boolean;
  viewCalendar: boolean;
  manageCalendar: boolean;
  viewAnalytics: boolean;
  viewDepartments: boolean;
  manageDepartments: boolean;
  viewUserManagement: boolean;
  manageUsers: boolean;
  viewSecurity: boolean;
  manageSecurity: boolean;
  viewIntegrations: boolean;
  manageIntegrations: boolean;
  viewSettings: boolean;
  manageSettings: boolean;
}

// Enhanced user interface with individual permissions support
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  // New fields for individual permission support
  plan?: string;
  isEmployee?: boolean;
  individualPermissions?: IndividualPermissions | null;
  [key: string]: any;
}

// Context type
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  hasBusinessCardPermission: (permission: BusinessCardPermission) => boolean;
  isRole: (role: UserRole | UserRole[]) => boolean;
  loading: boolean;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Permission mappings based on role
const getPermissionsByRole = (role: UserRole): UserPermissions => {
  const normalizedRole = role.toLowerCase();
  
  // Administrator/Admin permissions
  if (normalizedRole.includes('admin')) {
    return {
      viewCards: true,
      createCards: true,
      editCards: true,
      deleteCards: true,
      shareCards: true,
      manageAllCards: true,
      exportCards: true,
      generateQRCodes: true,
      createTemplates: true,
      viewContacts: true,
      manageContacts: true,
      viewCalendar: true,
      manageCalendar: true,
      viewAnalytics: true,
      viewDepartments: true,
      manageDepartments: true,
      viewUserManagement: true,
      manageUsers: true,
      viewSecurity: true,
      manageSecurity: true,
      viewIntegrations: false,
      manageIntegrations: false,
      viewSettings: true,
      manageSettings: true,
    };
  }
  
  // Manager/Lead permissions
  if (normalizedRole.includes('manager') || normalizedRole.includes('lead')) {
    return {
      viewCards: true,
      createCards: true,
      editCards: true,
      deleteCards: true, // Updated: Managers/Leads can delete cards
      shareCards: true,
      manageAllCards: false,
      exportCards: true,
      generateQRCodes: true,
      createTemplates: true,
      viewContacts: true,
      manageContacts: true,
      viewCalendar: true,
      manageCalendar: true,
      viewAnalytics: true,
      viewDepartments: true,
      manageDepartments: false,
      viewUserManagement: true,
      manageUsers: false,
      viewSecurity: false,
      manageSecurity: false,
      viewIntegrations: false,
      manageIntegrations: false,
      viewSettings: false,
      manageSettings: false,
    };
  }
  
  // Employee/Staff permissions (restricted access)
  return {
    viewCards: true,
    createCards: false,
    editCards: true, // Updated: Employees can edit cards
    deleteCards: false,
    shareCards: true,
    manageAllCards: false,
    exportCards: false,
    generateQRCodes: true,
    createTemplates: false,
    viewContacts: true,
    manageContacts: false,
    viewCalendar: true,
    manageCalendar: false,
    viewAnalytics: false,
    viewDepartments: false,
    manageDepartments: false,
    viewUserManagement: false,
    manageUsers: false,
    viewSecurity: false,
    manageSecurity: false,
    viewIntegrations: false,
    manageIntegrations: false,
    viewSettings: false,
    manageSettings: false,
  };
};

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('🔍 UserContext: Loading user data...');
      
      // First, try to load from localStorage
      const userData = localStorage.getItem('userData');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('📋 UserContext: Loaded user from localStorage:', parsedUser);
        
        // Try to refresh user data from enterprise API to get latest individual permissions
        await tryRefreshFromEnterpriseAPI(parsedUser);
      } else {
        console.log('⚠️ UserContext: No localStorage data, trying to load from enterprise API');
        // Try to load from enterprise API
        await tryLoadFromEnterpriseAPI();
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Fallback to Administrator role (for testing)
      const permissions = getPermissionsByRole('Administrator');
      setUserState({
        id: 'temp-user-id',
        name: 'Demo Administrator',
        email: 'admin@company.com',
        role: 'Administrator',
        permissions,
        plan: 'enterprise',
        isEmployee: true,
        individualPermissions: null
      });
    } finally {
      setLoading(false);
    }
  };

  const tryRefreshFromEnterpriseAPI = async (localUser: any) => {
    try {
      console.log('🔄 UserContext: Attempting to refresh user data from enterprise API...');
      
      // Load enterprise employees to get updated individual permissions
      const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_EMPLOYEES);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        const employees = data.employees || [];
        
        // Find current user in the enterprise employees list
        const currentUserId = DEFAULT_USER_ID;
        const enterpriseUser = employees.find((emp: any) => 
          emp.id === currentUserId || 
          emp.email === localUser.email ||
          emp.email === 'higenaw972@fursee.com' || // Fallback for test user
          emp.email === 'xenacoh740@percyfx.com' // Fallback for admin user
        );
        
        console.log('🔍 UserContext: Looking for user in enterprise data:', {
          currentUserId,
          localUserEmail: localUser.email,
          foundUser: enterpriseUser ? enterpriseUser.email : 'NOT FOUND',
          totalEmployees: employees.length,
          sampleEmails: employees.slice(0, 5).map((emp: any) => emp.email)
        });
        
        if (enterpriseUser) {
          console.log('✅ UserContext: Found user in enterprise data:', enterpriseUser);
          
          const permissions = getPermissionsByRole(enterpriseUser.role || 'Employee');
          const finalUser = {
            id: enterpriseUser.id || localUser.id,
            name: `${enterpriseUser.firstName || ''} ${enterpriseUser.lastName || ''}`.trim() || localUser.name,
            email: enterpriseUser.email || localUser.email,
            role: enterpriseUser.role || localUser.role || 'Employee',
            permissions,
            plan: 'enterprise',
            isEmployee: true,
            // Use individual permissions from enterprise data
            individualPermissions: enterpriseUser.individualPermissions || null
          };
          
          console.log('👤 UserContext: Updated user with enterprise data:', finalUser);
          console.log('🔐 UserContext: Individual permissions from API:', finalUser.individualPermissions);
          
          setUserState(finalUser);
          
          // Save updated data to localStorage
          localStorage.setItem('userData', JSON.stringify(finalUser));
          
          return;
        }
      }
      
      console.log('⚠️ UserContext: Could not refresh from API, using local data');
      // Fall back to local data
      await useLocalUserData(localUser);
      
    } catch (error) {
      console.warn('UserContext: Failed to refresh from enterprise API:', error);
      // Fall back to local data
      await useLocalUserData(localUser);
    }
  };

  const tryLoadFromEnterpriseAPI = async () => {
    try {
      console.log('🔄 UserContext: Attempting to load user data from enterprise API...');
      
      // Load enterprise employees
      const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_EMPLOYEES);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        const employees = data.employees || [];
        
        // Find current user - use test user email for now
        const enterpriseUser = employees.find((emp: any) => 
          emp.email === 'higenaw972@fursee.com' ||
          emp.email === 'xenacoh740@percyfx.com'
        );
        
        console.log('🔍 UserContext: Looking for user in enterprise data (no localStorage):', {
          foundUser: enterpriseUser ? enterpriseUser.email : 'NOT FOUND',
          totalEmployees: employees.length,
          sampleEmails: employees.slice(0, 5).map((emp: any) => emp.email)
        });
        
        if (enterpriseUser) {
          console.log('✅ UserContext: Found user in enterprise data:', enterpriseUser);
          
          const permissions = getPermissionsByRole(enterpriseUser.role || 'Employee');
          const finalUser = {
            id: enterpriseUser.id,
            name: `${enterpriseUser.firstName || ''} ${enterpriseUser.lastName || ''}`.trim(),
            email: enterpriseUser.email,
            role: enterpriseUser.role || 'Employee',
            permissions,
            plan: 'enterprise',
            isEmployee: true,
            individualPermissions: enterpriseUser.individualPermissions || null
          };
          
          console.log('👤 UserContext: Loaded user from enterprise API:', finalUser);
          console.log('🔐 UserContext: Individual permissions from API:', finalUser.individualPermissions);
          
          setUserState(finalUser);
          
          // Save to localStorage
          localStorage.setItem('userData', JSON.stringify(finalUser));
          
          return;
        }
      }
      
      console.log('⚠️ UserContext: Could not load from API, using default');
      // Fall back to default
      await useDefaultUser();
      
    } catch (error) {
      console.warn('UserContext: Failed to load from enterprise API:', error);
      await useDefaultUser();
    }
  };

  const useLocalUserData = async (parsedUser: any) => {
    const permissions = getPermissionsByRole(parsedUser.role || 'Employee');
    const userPlan = parsedUser.plan || 'enterprise';
    const isEmployee = parsedUser.isEmployee !== undefined ? parsedUser.isEmployee : true;
    
    const finalUser = {
      id: parsedUser.id || 'temp-user-id',
      name: parsedUser.name || 'Current User',
      email: parsedUser.email || 'user@company.com',
      role: parsedUser.role || 'Employee',
      permissions,
      plan: userPlan,
      isEmployee: isEmployee,
      individualPermissions: parsedUser.individualPermissions || null
    };
    
    console.log('👤 UserContext: Using local user data:', finalUser);
    setUserState(finalUser);
  };

  const useDefaultUser = async () => {
    console.log('⚠️ UserContext: Using default Administrator user');
    const permissions = getPermissionsByRole('Administrator');
    setUserState({
      id: 'temp-user-id',
      name: 'Demo Administrator',
      email: 'admin@company.com',
      role: 'Administrator',
      permissions,
      plan: 'enterprise',
      isEmployee: true,
      individualPermissions: null
    });
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('userData', JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        plan: newUser.plan || 'enterprise',
        isEmployee: newUser.isEmployee !== undefined ? newUser.isEmployee : true,
        individualPermissions: newUser.individualPermissions || null
      }));
    } else {
      localStorage.removeItem('userData');
    }
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!user) {
      console.log('❌ hasPermission: No user found');
      return false;
    }
    
    // For business card permissions, use the enhanced permission check with individual overrides
    const businessCardPermissions = [
      'viewCards', 'createCards', 'editCards', 
      'deleteCards', 'shareCards', 'manageAllCards', 'exportCards'
    ];
    
    if (businessCardPermissions.includes(permission)) {
      const result = hasBusinessCardPermission(user as UserWithPermissions, permission as BusinessCardPermission);
      console.log(`🔐 hasPermission: Business card permission '${permission}' = ${result} for user:`, {
        email: user.email,
        role: user.role,
        individualPermissions: user.individualPermissions
      });
      return result;
    }
    
    // For other permissions, use the existing logic
    const result = user?.permissions[permission] || false;
    console.log(`🔐 hasPermission: Regular permission '${permission}' = ${result}`);
    return result;
  };

  const hasBusinessCardPermissionDirect = (permission: BusinessCardPermission): boolean => {
    if (!user) return false;
    return hasBusinessCardPermission(user as UserWithPermissions, permission);
  };

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  const value: UserContextType = {
    user,
    setUser,
    hasPermission,
    hasBusinessCardPermission: hasBusinessCardPermissionDirect,
    isRole,
    loading
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Hook to use the context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Utility function to create a user with proper permissions
export const createUser = (userData: Omit<User, 'permissions'>): User => {
  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    plan: userData.plan,
    isEmployee: userData.isEmployee,
    individualPermissions: userData.individualPermissions,
    permissions: getPermissionsByRole(userData.role)
  };
};