import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user roles
export type UserRole = 'Employee' | 'Manager' | 'Administrator' | 'Admin' | 'Lead' | 'Staff';

// Define permissions
export interface UserPermissions {
  viewBusinessCards: boolean;
  createBusinessCards: boolean;
  editBusinessCards: boolean;
  deleteBusinessCards: boolean;
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

// Define user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
}

// Context type
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  hasPermission: (permission: keyof UserPermissions) => boolean;
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
        
        setUserState({
          id: parsedUser.id || 'temp-user-id',
          name: parsedUser.name || 'Current User',
          email: parsedUser.email || 'user@company.com',
          role: parsedUser.role || 'Employee',
          permissions
        });
      } else {
        // Default to Employee role if no user data found
        const permissions = getPermissionsByRole('Employee');
        setUserState({
          id: 'temp-user-id',
          name: 'Demo Employee',
          email: 'employee@company.com',
          role: 'Employee',
          permissions
        });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Fallback to Employee role
      const permissions = getPermissionsByRole('Employee');
      setUserState({
        id: 'temp-user-id',
        name: 'Demo Employee',
        email: 'employee@company.com',
        role: 'Employee',
        permissions
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
        role: newUser.role
      }));
    } else {
      localStorage.removeItem('userData');
    }
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return user?.permissions[permission] || false;
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