// Business Card Permission Constants
export const BUSINESS_CARD_PERMISSIONS = {
  CREATE_CARDS: 'createBusinessCards',
  EDIT_CARDS: 'editBusinessCards', 
  DELETE_CARDS: 'deleteBusinessCards',
  VIEW_CARDS: 'viewBusinessCards',
  SHARE_CARDS: 'shareBusinessCards',
  GENERATE_QR: 'generateQRCodes',
  CREATE_TEMPLATES: 'createTemplates',
  MANAGE_ALL_CARDS: 'manageAllCards'
} as const;

// Role to Permission Mapping
export const ROLE_PERMISSIONS = {
  'Administrator': [
    'createBusinessCards',
    'editBusinessCards', 
    'deleteBusinessCards',
    'viewBusinessCards',
    'shareBusinessCards',
    'generateQRCodes',
    'createTemplates',
    'manageAllCards'
  ],
  'Admin': [
    'createBusinessCards',
    'editBusinessCards', 
    'deleteBusinessCards',
    'viewBusinessCards',
    'shareBusinessCards',
    'generateQRCodes',
    'createTemplates',
    'manageAllCards'
  ],
  'Manager': [
    'createBusinessCards',
    'editBusinessCards',
    'viewBusinessCards',
    'shareBusinessCards',
    'generateQRCodes',
    'createTemplates'
  ],
  'Lead': [
    'createBusinessCards',
    'editBusinessCards',
    'viewBusinessCards',
    'shareBusinessCards',
    'generateQRCodes',
    'createTemplates'
  ],
  'Employee': [
    'viewBusinessCards',
    'shareBusinessCards',
    'generateQRCodes'
  ],
  'Staff': [
    'viewBusinessCards',
    'shareBusinessCards',
    'generateQRCodes'
  ]
} as const;

// Type definitions
export type BusinessCardPermission = typeof BUSINESS_CARD_PERMISSIONS[keyof typeof BUSINESS_CARD_PERMISSIONS];
export type UserRole = keyof typeof ROLE_PERMISSIONS;

export interface IndividualPermissions {
  removed?: BusinessCardPermission[];
  added?: BusinessCardPermission[];
}

export interface UserWithPermissions {
  id: string;
  email: string;
  role?: string;
  plan?: string;
  isEmployee?: boolean;
  individualPermissions?: IndividualPermissions | null;
  [key: string]: any;
}

// Permission checker function
export const calculateUserPermissions = (user: UserWithPermissions): BusinessCardPermission[] => {
  // For non-enterprise users, allow basic permissions
  if (user?.plan !== 'enterprise') {
    return ['viewBusinessCards', 'shareBusinessCards', 'generateQRCodes'] as BusinessCardPermission[];
  }
  
  // For enterprise users, start with role-based permissions
  const userRole = user?.role as UserRole;
  const basePermissions = ROLE_PERMISSIONS[userRole] || [];
  
  let finalPermissions: BusinessCardPermission[] = [...basePermissions];
  
  // Apply individual overrides if they exist
  const individualOverrides = user?.individualPermissions;
  if (individualOverrides) {
    // Remove permissions if specified
    if (individualOverrides.removed) {
      finalPermissions = finalPermissions.filter(p => !individualOverrides.removed!.includes(p));
    }
    
    // Add extra permissions if specified
    if (individualOverrides.added) {
      finalPermissions = [...finalPermissions, ...individualOverrides.added];
    }
  }
  
  return finalPermissions;
};

// Show permission popup for enterprise users without permissions
export const showPermissionPopup = (user: UserWithPermissions): void => {
  alert(`User ${user.email} has no explicit permissions assigned. Please configure permissions in Security settings.`);
};

// Main permission check function
export const hasBusinessCardPermission = (user: UserWithPermissions, permission: BusinessCardPermission): boolean => {
  // For non-enterprise users, allow basic access
  if (user?.plan !== 'enterprise') {
    const basicPermissions = ['viewBusinessCards', 'shareBusinessCards', 'generateQRCodes'];
    return basicPermissions.includes(permission);
  }
  
  // For enterprise users
  const userPermissions = calculateUserPermissions(user);
  
  // If enterprise user has no permissions at all, show popup
  if (user?.plan === 'enterprise' && user?.isEmployee && userPermissions.length === 0) {
    showPermissionPopup(user);
    return false;
  }
  
  return userPermissions.includes(permission);
};
