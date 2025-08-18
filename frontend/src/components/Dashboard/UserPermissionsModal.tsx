import { useState, useEffect } from 'react';
import { Button } from '../UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/card';
import { FaUser, FaExclamationTriangle, FaChevronDown, FaChevronRight, FaTimes } from "react-icons/fa";
import "../../styles/DepartmentModal.css";
import { VALID_BACKEND_PERMISSIONS, PERMISSION_DISPLAY_NAMES, validatePermissions } from "../../utils/permissions";

// Types
interface EmployeeData {
  id: number;
  firstName: string;
  lastName: string;
  name?: string;
  surname?: string;
  email: string;
  role?: string;
  departmentName?: string;
  status?: string;
  lastActive?: string;
  individualPermissions?: {
    removed?: string[];
    added?: string[];
  };
  effectivePermissions?: string[];
}

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: EmployeeData | null;
  rolePermissions: string[];
  onSave: (userId: number, individualPermissions: { removed: string[]; added: string[] }) => Promise<void>;
  saving: boolean;
}

// Permission state for each permission
type PermissionState = 'inherit' | 'add' | 'remove';



// Permission Row Component for Table Layout
const PermissionRow = ({ 
  permission, 
  roleHasPermission, 
  currentState, 
  effectiveValue, 
  onChange, 
  disabled = false 
}: {
  permission: string;
  roleHasPermission: boolean;
  currentState: PermissionState;
  effectiveValue: boolean;
  onChange: (state: PermissionState) => void;
  disabled?: boolean;
}) => {
  const displayName = PERMISSION_DISPLAY_NAMES[permission as keyof typeof PERMISSION_DISPLAY_NAMES] || permission;
  const isOverridden = currentState !== 'inherit';
  
  return (
    <div className="permission-row">
      <div className="permission-name-cell">
        <span className="permission-name">{displayName}</span>
        {isOverridden && (
          <span className="permission-override-indicator">
            <FaExclamationTriangle className="override-icon" />
            {currentState === 'add' ? 'Added' : 'Removed'}
          </span>
        )}
      </div>
      
      <div className="permission-role-cell">
        <div className={`permission-status ${roleHasPermission ? 'active' : 'inactive'}`}>
          {roleHasPermission ? 'Yes' : 'No'}
        </div>
      </div>
      
      <div className="permission-user-cell">
        <select
          value={currentState}
          onChange={(e) => onChange(e.target.value as PermissionState)}
          disabled={disabled}
          className="permission-select"
        >
          <option value="inherit">Inherit from Role</option>
          <option value="add">Force Enable</option>
          <option value="remove">Force Disable</option>
        </select>
      </div>
      
      <div className="permission-effective-cell">
        <div className={`permission-status effective ${effectiveValue ? 'active' : 'inactive'}`}>
          {effectiveValue ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
};

const UserPermissionsModal = ({ 
  isOpen, 
  onClose, 
  user, 
  rolePermissions, 
  onSave, 
  saving 
}: UserPermissionsModalProps) => {
  const [permissionStates, setPermissionStates] = useState<Record<string, PermissionState>>({});
  const [businessCardsExpanded, setBusinessCardsExpanded] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize permission states when user changes
  useEffect(() => {
    if (user) {
      const states: Record<string, PermissionState> = {};
      
      VALID_BACKEND_PERMISSIONS.forEach(permission => {
        // Check if permission is in removed array
        if (user.individualPermissions?.removed?.includes(permission)) {
          states[permission] = 'remove';
        }
        // Check if permission is in added array
        else if (user.individualPermissions?.added?.includes(permission)) {
          states[permission] = 'add';
        }
        // Default to inherit
        else {
          states[permission] = 'inherit';
        }
      });
      
      setPermissionStates(states);
      setHasChanges(false);
      setValidationErrors([]);
    }
  }, [user]);

  // Calculate effective permissions for display
  const calculateEffectivePermissions = (): Record<string, boolean> => {
    const effective: Record<string, boolean> = {};
    
    VALID_BACKEND_PERMISSIONS.forEach(permission => {
      const state = permissionStates[permission] || 'inherit';
      const roleHasPermission = rolePermissions.includes(permission);
      
      if (state === 'add') {
        effective[permission] = true;
      } else if (state === 'remove') {
        effective[permission] = false;
      } else {
        effective[permission] = roleHasPermission;
      }
    });
    
    return effective;
  };

  // Update permission state
  const updatePermissionState = (permission: string, state: PermissionState) => {
    setPermissionStates(prev => ({
      ...prev,
      [permission]: state
    }));
    setHasChanges(true);
    
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Validate and prepare permissions for save
  const preparePermissionsForSave = (): { removed: string[]; added: string[] } | null => {
    const removed: string[] = [];
    const added: string[] = [];
    
    Object.entries(permissionStates).forEach(([permission, state]) => {
      if (state === 'remove') {
        removed.push(permission);
      } else if (state === 'add') {
        added.push(permission);
      }
    });
    
    console.log('🔍 Preparing permissions for save:', { removed, added });
    
    // Validate permissions
    const allPermissions = [...removed, ...added];
    const validation = validatePermissions(allPermissions);
    
    if (validation.invalid.length > 0) {
      console.error('❌ Invalid permissions detected:', validation.invalid);
      setValidationErrors(validation.invalid);
      return null;
    }
    
    console.log('✅ All permissions are valid');
    return { removed, added };
  };

  // Handle save
  const handleSave = async () => {
    if (!user) return;
    
    const individualPermissions = preparePermissionsForSave();
    if (!individualPermissions) return; // Validation failed
    
    try {
      await onSave(user.id, individualPermissions);
      onClose();
    } catch (error) {
      console.error('Failed to save permissions:', error);
      setValidationErrors(['Failed to save permissions. Please try again.']);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }
    onClose();
  };

  // Format user display name
  const formatUserName = (user: EmployeeData) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.name && user.surname) {
      return `${user.name} ${user.surname}`;
    }
    return user.email.split('@')[0];
  };

  if (!isOpen || !user) return null;

  const effectivePermissions = calculateEffectivePermissions();
  const hasOverrides = Object.values(permissionStates).some(state => state !== 'inherit');

  return (
    <div className="modal-overlay nested-modal" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <Card className="modal-card">
          <CardHeader className="modal-header">
            <div className="modal-user-info">
              <div className="modal-user-avatar">
                <FaUser className="modal-user-icon" />
              </div>
              <div className="modal-user-details">
                <CardTitle className="modal-title">
                  Edit Permissions for {formatUserName(user)}
                </CardTitle>
                <div className="modal-user-meta">
                  <span className="modal-user-email">{user.email}</span>
                  {user.departmentName && (
                    <span className="modal-user-department">• {user.departmentName}</span>
                  )}
                  {user.role && (
                    <span className="modal-user-department">• Role: {user.role}</span>
                  )}
                  {hasOverrides && (
                    <span className="modal-user-override-badge">
                      <FaExclamationTriangle className="override-icon" />
                      Custom Permissions
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button 
              className="department-modal-close" 
              onClick={handleCancel}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </CardHeader>
          
          <CardContent className="modal-content">
            <div className="modal-description">
              <p>
                Individual permissions override role permissions. Choose "Inherit from Role" to use default role permissions, 
                or override with "Force Enable" or "Force Disable" for specific permissions.
              </p>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div style={{ 
                padding: '1rem', 
                margin: '1rem 0', 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '0.5rem',
                color: '#991b1b'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Validation Errors:</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Business Card Permissions */}
            <div className="permission-category">
              <div className="permission-category-header" onClick={() => setBusinessCardsExpanded(!businessCardsExpanded)}>
                <div className="permission-category-title">
                  {businessCardsExpanded ? <FaChevronDown className="chevron-icon" /> : <FaChevronRight className="chevron-icon" />}
                  <span>Business Card Permissions</span>
                </div>
                <div className="permission-category-count">
                  {VALID_BACKEND_PERMISSIONS.length} permissions
                </div>
              </div>
              
              {businessCardsExpanded && (
                <div className="permission-category-content">
                  <div className="permissions-table">
                    <div className="permissions-table-header">
                      <div>Permission</div>
                      <div>Role Default</div>
                      <div>User Override</div>
                      <div>Effective</div>
                    </div>
                    
                    <div className="permissions-table-body">
                      {VALID_BACKEND_PERMISSIONS.map((permission) => (
                        <PermissionRow
                          key={permission}
                          permission={permission}
                          roleHasPermission={rolePermissions.includes(permission)}
                          currentState={permissionStates[permission] || 'inherit'}
                          effectiveValue={effectivePermissions[permission] || false}
                          onChange={(state) => updatePermissionState(permission, state)}
                          disabled={saving}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="department-modal-actions">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSave} 
                disabled={saving || validationErrors.length > 0}
                style={{ 
                  backgroundColor: hasChanges ? '#22c55e' : undefined,
                  opacity: !hasChanges ? 0.6 : 1
                }}
              >
                {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserPermissionsModal;
