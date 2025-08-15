import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  BUSINESS_CARD_PERMISSIONS, 
  ROLE_PERMISSIONS, 
  hasBusinessCardPermission, 
  showPermissionPopup,
  type BusinessCardPermission,
  type UserWithPermissions,
  type IndividualPermissions 
} from '../utils/permissions';

// Define user roles
export type UserRole = 'Employee' | 'Manager' | 'Administrator' | 'Admin' | 'Lead' | 'Staff';

// Define permissions
export interface UserPermissions {
  viewBusinessCards: boolean;
  createBusinessCards: boolean;
  editBusinessCards: boolean;
  deleteBusinessCards: boolean;
  shareBusinessCards: boolean;
  generateQRCodes: boolean;
  createTemplates: boolean;
  manageAllCards: boolean;
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
      viewBusinessCards: true,
      createBusinessCards: true,
      editBusinessCards: true,
      deleteBusinessCards: true,
      shareBusinessCards: true,
      generateQRCodes: true,
      createTemplates: true,
      manageAllCards: true,
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
      viewBusinessCards: true,
      createBusinessCards: true,
      editBusinessCards: true,
      deleteBusinessCards: false,
      shareBusinessCards: true,
      generateQRCodes: true,
      createTemplates: true,
      manageAllCards: false,
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
    viewBusinessCards: true,
    createBusinessCards: false,
    editBusinessCards: false,
    deleteBusinessCards: false,
    shareBusinessCards: true,
    generateQRCodes: true,
    createTemplates: false,
    manageAllCards: false,
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
      // For now, we'll simulate getting user data from localStorage or API
      // In a real app, this would fetch from your authentication system
      const userData = localStorage.getItem('userData');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const permissions = getPermissionsByRole(parsedUser.role || 'Employee');
        // Ensure enterprise properties are set
        const userPlan = parsedUser.plan || 'enterprise';
        const isEmployee = parsedUser.isEmployee !== undefined ? parsedUser.isEmployee : true;
        
        setUserState({
          id: parsedUser.id || 'temp-user-id',
          name: parsedUser.name || 'Current User',
          email: parsedUser.email || 'user@company.com',
          role: parsedUser.role || 'Employee',
          permissions,
          plan: userPlan,
          isEmployee: isEmployee
        });
      } else {
        // Default to Administrator role if no user data found (for testing)
        const permissions = getPermissionsByRole('Administrator');
        setUserState({
          id: 'temp-user-id',
          name: 'Demo Administrator',
          email: 'admin@company.com',
          role: 'Administrator',
          permissions,
          plan: 'enterprise',
          isEmployee: true
        });
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
        isEmployee: true
      });
    } finally {
      setLoading(false);
    }
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
        isEmployee: newUser.isEmployee !== undefined ? newUser.isEmployee : true
      }));
    } else {
      localStorage.removeItem('userData');
    }
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!user) return false;
    
    // For business card permissions, use the enhanced permission check with individual overrides
    const businessCardPermissions = [
      'viewBusinessCards', 'createBusinessCards', 'editBusinessCards', 
      'deleteBusinessCards', 'shareBusinessCards', 'generateQRCodes', 
      'createTemplates', 'manageAllCards'
    ];
    
    if (businessCardPermissions.includes(permission)) {
      return hasBusinessCardPermission(user as UserWithPermissions, permission as BusinessCardPermission);
    }
    
    // For other permissions, use the existing logic
    return user?.permissions[permission] || false;
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
    ...userData,
    permissions: getPermissionsByRole(userData.role)
  };
};