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

// Business Card Permissions
export const VALID_BUSINESS_CARD_PERMISSIONS = [
  'viewCards',      // Can view business cards
  'createCards',    // Can create new business cards
  'editCards',      // Can edit existing business cards
  'deleteCards',    // Can delete business cards
  'manageAllCards', // Can manage all cards in enterprise
  'exportCards',    // Can export business card data
  'shareCards'      // Can share business cards
] as const;

// Contact Permissions
export const VALID_CONTACT_PERMISSIONS = [
  'viewContacts',   // Can view contacts
  'deleteContacts', // Can delete contacts
  'shareContacts',  // Can share contacts
  'exportContacts'  // Can export contact data
] as const;

// All valid permissions (combining both types)
export const VALID_BACKEND_PERMISSIONS = [
  ...VALID_BUSINESS_CARD_PERMISSIONS,
  ...VALID_CONTACT_PERMISSIONS
] as const;

// Permission display names
export const PERMISSION_DISPLAY_NAMES = {
  // Business Card Permissions
  'viewCards': 'View Business Cards',
  'createCards': 'Create Business Cards',
  'editCards': 'Edit Business Cards',
  'deleteCards': 'Delete Business Cards',
  'manageAllCards': 'Manage All Cards',
  'exportCards': 'Export Card Data',
  'shareCards': 'Share Business Cards',
  // Contact Permissions
  'viewContacts': 'View Contacts',
  'deleteContacts': 'Delete Contacts',
  'shareContacts': 'Share Contacts',
  'exportContacts': 'Export Contact Data'
} as const;

// Role to Permission Mapping - Using backend permission names
export const ROLE_PERMISSIONS = {
  'Administrator': [
    // Business Card Permissions
    'viewCards',
    'createCards',
    'editCards',
    'deleteCards',
    'shareCards',
    'manageAllCards',
    'exportCards',
    // Contact Permissions
    'viewContacts',
    'deleteContacts',
    'shareContacts',
    'exportContacts'
  ],
  'Admin': [
    // Business Card Permissions
    'viewCards',
    'createCards',
    'editCards',
    'deleteCards',
    'shareCards',
    'manageAllCards',
    'exportCards',
    // Contact Permissions
    'viewContacts',
    'deleteContacts',
    'shareContacts',
    'exportContacts'
  ],
  'Manager': [
    // Business Card Permissions
    'viewCards',
    'createCards',
    'editCards',
    'deleteCards',
    'shareCards',
    'exportCards',
    // Contact Permissions
    'viewContacts',
    'deleteContacts',
    'shareContacts',
    'exportContacts'
  ],
  'Lead': [
    // Business Card Permissions
    'viewCards',
    'createCards',
    'editCards',
    'deleteCards',
    'shareCards',
    'exportCards',
    // Contact Permissions
    'viewContacts',
    'deleteContacts',
    'shareContacts',
    'exportContacts'
  ],
  'Employee': [
    // Business Card Permissions
    'viewCards',
    'editCards',
    'shareCards',
    // Contact Permissions
    'viewContacts',
    'deleteContacts',
    'shareContacts'
  ],
  'Staff': [
    // Business Card Permissions
    'viewCards',
    'editCards',
    'shareCards',
    // Contact Permissions
    'viewContacts',
    'deleteContacts',
    'shareContacts'
  ]
} as const;

// Type definitions
export type BusinessCardPermission = typeof VALID_BUSINESS_CARD_PERMISSIONS[number];
export type ContactPermission = typeof VALID_CONTACT_PERMISSIONS[number];
export type AllPermission = typeof VALID_BACKEND_PERMISSIONS[number];
export type UserRole = keyof typeof ROLE_PERMISSIONS;

// Permission categories for UI organization
export const PERMISSION_CATEGORIES = {
  BUSINESS_CARDS: {
    name: 'Business Cards',
    description: 'Manage business card creation, editing, and sharing',
    permissions: VALID_BUSINESS_CARD_PERMISSIONS,
    icon: '💼'
  },
  CONTACTS: {
    name: 'Contacts',
    description: 'Manage contact viewing, deletion, and sharing',
    permissions: VALID_CONTACT_PERMISSIONS,
    icon: '👥'
  }
} as const;

export interface IndividualPermissions {
  removed?: AllPermission[];
  added?: AllPermission[];
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

// Helper function to normalize role names
const normalizeRole = (role: string): UserRole => {
  const normalizedRole = role?.toLowerCase() || 'employee';
  
  if (normalizedRole.includes('admin') || normalizedRole.includes('administrator')) {
    return 'Administrator';
  } else if (normalizedRole.includes('manager') || normalizedRole.includes('lead')) {
    return 'Manager';
  } else if (normalizedRole.includes('employee') || normalizedRole.includes('staff') || normalizedRole.includes('user')) {
    return 'Employee';
  } else {
    return 'Employee'; // Default fallback
  }
};

// Permission checker function
export const calculateUserPermissions = (user: UserWithPermissions): AllPermission[] => {
  // For non-enterprise users, allow basic permissions
  if (user?.plan !== 'enterprise') {
    return ['viewCards', 'shareCards', 'viewContacts', 'shareContacts'] as AllPermission[];
  }
  
  // For enterprise users, start with role-based permissions
  const userRole = user?.role;
  const normalizedRole = normalizeRole(userRole || 'Employee');
  const basePermissions = ROLE_PERMISSIONS[normalizedRole] || [];
  
  console.log('🔍 calculateUserPermissions debug:', {
    userEmail: user?.email,
    originalRole: userRole,
    normalizedRole,
    basePermissions,
    individualPermissions: user?.individualPermissions
  });
  
  let finalPermissions: AllPermission[] = [...basePermissions];
  
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
  
  console.log('🔍 Final calculated permissions:', finalPermissions);
  
  return finalPermissions;
};

// Show permission popup for enterprise users without permissions
export const showPermissionPopup = (user: UserWithPermissions): void => {
  alert(`User ${user.email} has no explicit permissions assigned. Please configure permissions in Security settings.`);
};

// Main permission check function
export const hasBusinessCardPermission = (user: UserWithPermissions, permission: AllPermission): boolean => {
  // For non-enterprise users, allow basic access
  if (user?.plan !== 'enterprise') {
    const basicPermissions = ['viewCards', 'shareCards', 'viewContacts', 'shareContacts'];
    return basicPermissions.includes(permission);
  }
  
  // For enterprise users
  const userPermissions = calculateUserPermissions(user);
  
  // Debug logging to understand what's happening
  console.log('🔍 hasBusinessCardPermission debug:', {
    userEmail: user?.email,
    userRole: user?.role,
    plan: user?.plan,
    isEmployee: user?.isEmployee,
    individualPermissions: user?.individualPermissions,
    basePermissions: ROLE_PERMISSIONS[user?.role as UserRole] || [],
    calculatedPermissions: userPermissions,
    requestedPermission: permission,
    hasPermission: userPermissions.includes(permission)
  });
  
  // Only show popup if user truly has no permissions (this should rarely happen)
  // Most users should inherit role permissions even without individual overrides
  if (user?.plan === 'enterprise' && user?.isEmployee && userPermissions.length === 0) {
    console.warn('⚠️ User has no permissions at all - this might indicate a configuration issue:', user?.email);
    showPermissionPopup(user);
    return false;
  }
  
  return userPermissions.includes(permission);
};

// Validate permission names against backend's valid list
export const validatePermission = (permission: string): boolean => {
  return VALID_BACKEND_PERMISSIONS.includes(permission as any);
};

// Validate an array of permissions
export const validatePermissions = (permissions: string[]): { valid: string[], invalid: string[] } => {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  permissions.forEach(permission => {
    if (validatePermission(permission)) {
      valid.push(permission);
    } else {
      invalid.push(permission);
    }
  });
  
  return { valid, invalid };
};

// Get permission display name
export const getPermissionDisplayName = (permission: string): string => {
  return PERMISSION_DISPLAY_NAMES[permission as keyof typeof PERMISSION_DISPLAY_NAMES] || permission;
};

// Helper functions for permission categorization
export const isBusinessCardPermission = (permission: string): permission is BusinessCardPermission => {
  return VALID_BUSINESS_CARD_PERMISSIONS.includes(permission as BusinessCardPermission);
};

export const isContactPermission = (permission: string): permission is ContactPermission => {
  return VALID_CONTACT_PERMISSIONS.includes(permission as ContactPermission);
};

export const getPermissionCategory = (permission: string): keyof typeof PERMISSION_CATEGORIES | null => {
  if (isBusinessCardPermission(permission)) return 'BUSINESS_CARDS';
  if (isContactPermission(permission)) return 'CONTACTS';
  return null;
};

// Get permissions by category
export const getPermissionsByCategory = (permissions: AllPermission[]) => {
  const categorized = {
    BUSINESS_CARDS: [] as BusinessCardPermission[],
    CONTACTS: [] as ContactPermission[]
  };

  permissions.forEach(permission => {
    if (isBusinessCardPermission(permission)) {
      categorized.BUSINESS_CARDS.push(permission);
    } else if (isContactPermission(permission)) {
      categorized.CONTACTS.push(permission);
    }
  });

  return categorized;
};
