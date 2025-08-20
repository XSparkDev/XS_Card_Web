import React, { useState, useEffect } from "react";
import { Button } from "../UI/button";
import { Badge } from "../UI/badge";
// Removed unused Card imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../UI/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../UI/selectRadix";
import { FaUser, FaUserCog, FaShieldAlt, FaExclamationTriangle } from "react-icons/fa";
import "../../styles/Security.css";
import { updateEmployeeRole, DEFAULT_ENTERPRISE_ID } from "../../utils/api";
import { type AllPermission, type IndividualPermissions } from "../../utils/permissions";

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
  departmentId?: string;
  status?: string;
  lastActive?: string;
  individualPermissions?: IndividualPermissions;
  effectivePermissions?: AllPermission[];
}

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: EmployeeData | null;
  currentUserRole?: string;
  onRoleUpdated?: () => void;
}

// Valid backend roles - these are the exact values the backend expects
const VALID_BACKEND_ROLES = ['employee', 'manager', 'director', 'admin'] as const;
type BackendRole = typeof VALID_BACKEND_ROLES[number];

// Role mapping between frontend display names and backend values
const ROLE_MAPPING = {
  // Frontend -> Backend
  'Employee': 'employee',
  'Manager': 'manager',
  'Director': 'director', 
  'Administrator': 'admin',
  'Admin': 'admin',
  // Also handle lowercase versions
  'employee': 'employee',
  'manager': 'manager', 
  'director': 'director',
  'admin': 'admin'
} as const;

// Reverse mapping for display
const BACKEND_TO_FRONTEND = {
  'employee': 'Employee',
  'manager': 'Manager',
  'director': 'Director',
  'admin': 'Administrator'
} as const;

// Role options with descriptions (using backend values as keys)
const ROLE_OPTIONS = [
  {
    value: 'employee' as BackendRole,
    label: 'Employee',
    description: 'Basic employee with limited access',
    permissions: ['viewCards', 'viewContacts', 'viewCalendar']
  },
  {
    value: 'manager' as BackendRole,
    label: 'Manager',
    description: 'Department manager with enhanced permissions',
    permissions: ['viewCards', 'createCards', 'editCards', 'viewContacts', 'viewCalendar', 'createMeetings']
  },
  {
    value: 'director' as BackendRole,
    label: 'Director',
    description: 'Senior manager with broad access',
    permissions: ['viewCards', 'createCards', 'editCards', 'deleteCards', 'viewContacts', 'viewCalendar', 'createMeetings', 'viewDepartments']
  },
  {
    value: 'admin' as BackendRole,
    label: 'Administrator',
    description: 'Full system access and control',
    permissions: ['viewCards', 'createCards', 'editCards', 'deleteCards', 'manageAllCards', 'viewContacts', 'viewCalendar', 'createMeetings', 'viewDepartments', 'viewUserManagement', 'viewSecurity', 'viewSettings']
  }
];

// Helper functions for role mapping
const mapFrontendToBackend = (frontendRole: string): BackendRole => {
  const mapped = ROLE_MAPPING[frontendRole as keyof typeof ROLE_MAPPING];
  if (!mapped) {
    console.warn(`Unknown frontend role: ${frontendRole}, defaulting to 'employee'`);
    return 'employee';
  }
  return mapped as BackendRole;
};

const mapBackendToFrontend = (backendRole: string): string => {
  const mapped = BACKEND_TO_FRONTEND[backendRole as keyof typeof BACKEND_TO_FRONTEND];
  if (!mapped) {
    console.warn(`Unknown backend role: ${backendRole}, returning as-is`);
    return backendRole;
  }
  return mapped;
};

const validateRole = (role: string): boolean => {
  return VALID_BACKEND_ROLES.includes(role as BackendRole);
};

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUserRole,
  onRoleUpdated
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  // Check if current user can change this user's role
  const canChangeRole = (): boolean => {
    if (!currentUserRole || !user) return false;
    
    // Only admins can change roles (including their own)
    const normalizedCurrentRole = mapFrontendToBackend(currentUserRole);
    return normalizedCurrentRole === 'admin';
  };

  // Get current role display info
  const getCurrentRoleInfo = () => {
    if (!user?.role) return null;
    
    const backendRole = mapFrontendToBackend(user.role);
    return ROLE_OPTIONS.find(option => option.value === backendRole) || {
      value: backendRole,
      label: mapBackendToFrontend(backendRole),
      description: 'Custom role',
      permissions: []
    };
  };

  // Initialize selected role when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const backendRole = mapFrontendToBackend(user.role || 'employee');
      setSelectedRole(backendRole);
      setError('');
      setSuccess(false);
      setShowConfirmation(false);
    }
  }, [isOpen, user]);

  // Show confirmation dialog
  const handleRoleChangeRequest = () => {
    setShowConfirmation(true);
  };

  // Handle confirmed role update
  const handleConfirmedRoleUpdate = async () => {
    if (!user || !selectedRole) return;

    // Validate the selected role
    if (!validateRole(selectedRole)) {
      setError(`Invalid role selected. Valid roles are: ${VALID_BACKEND_ROLES.join(', ')}`);
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      console.log('🔄 Updating role for user:', user.email, 'to:', selectedRole);
      console.log('🔍 Role validation passed:', validateRole(selectedRole));
      
      // Get department ID - try to get from user data
      let departmentId = user.departmentId;
      
      if (!departmentId) {
        // If departmentId is not available, show specific error message
        console.error('❌ Department ID missing for user:', user.email);
        setError(
          'Department ID is required for role updates but is missing from user data. ' +
          'This is a system configuration issue. Please contact your system administrator ' +
          'to ensure user department assignments are properly configured.'
        );
        setIsUpdating(false);
        return;
      }
      
      console.log('📍 Using department ID:', departmentId);
      console.log('🏢 Using enterprise ID:', DEFAULT_ENTERPRISE_ID);
      
      const result = await updateEmployeeRole(
        user.id.toString(),
        departmentId,
        selectedRole,
        DEFAULT_ENTERPRISE_ID
      );

      if (result.success) {
        console.log('✅ Role updated successfully:', result);
        setSuccess(true);
        setShowConfirmation(false);
        
        // Call callback to refresh data
        if (onRoleUpdated) {
          onRoleUpdated();
        }
        
        // Close modal after a brief delay to show success
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        console.error('❌ Role update failed:', result.message);
        setError(result.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('❌ Error updating role:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsUpdating(false);
      setShowConfirmation(false);
    }
  };

  // Cancel confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  // Get selected role info
  const getSelectedRoleInfo = () => {
    return ROLE_OPTIONS.find(option => option.value === selectedRole);
  };

  const currentRoleInfo = getCurrentRoleInfo();
  const selectedRoleInfo = getSelectedRoleInfo();
  const canChange = canChangeRole();

  if (!isOpen || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="role-management-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaUserCog className="text-blue-600" />
            Manage User Role
          </DialogTitle>
          <DialogDescription>
            Change the role and permissions for {formatUserName(user)}
          </DialogDescription>
        </DialogHeader>

        <div className="role-management-content">
          {/* User Info */}
          <div className="user-info-section">
            <div className="user-avatar">
              <FaUser className="user-icon" />
            </div>
            <div className="user-details">
              <h3 className="user-name">{formatUserName(user)}</h3>
              <p className="user-email">{user.email}</p>
              {user.departmentName && (
                <p className="user-department">{user.departmentName}</p>
              )}
            </div>
          </div>

          {/* Current Role */}
          <div className="current-role-section">
            <h4 className="section-title">Current Role</h4>
            <div className="current-role-display">
              <Badge variant="outline" className="role-badge">
                {currentRoleInfo?.label || user.role || 'No Role'}
              </Badge>
              <p className="role-description">
                {currentRoleInfo?.description || 'No description available'}
              </p>
            </div>
          </div>

          {/* Permission Check */}
          {!canChange && (
            <div className="permission-warning">
              <FaExclamationTriangle className="warning-icon" />
              <div className="warning-content">
                                 <h4 className="warning-title">Insufficient Permissions</h4>
                 <p className="warning-message">
                   Only administrators can change user roles. Please contact your system administrator if you need role changes.
                 </p>
              </div>
            </div>
          )}

          {/* Role Selection */}
          {canChange && (
            <div className="role-selection-section">
              <h4 className="section-title">Select New Role</h4>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="role-select">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="role-option">
                        <div className="role-option-header">
                          <span className="role-option-label">{role.label}</span>
                          {role.value === 'admin' && (
                            <FaShieldAlt className="admin-icon" />
                          )}
                        </div>
                        <span className="role-option-description">{role.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Role Info */}
              {selectedRoleInfo && (
                <div className="selected-role-info">
                  <h5 className="info-title">Role Permissions</h5>
                  <div className="permissions-list">
                    {selectedRoleInfo.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary" className="permission-badge">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <FaExclamationTriangle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="success-message">
              <FaShieldAlt className="success-icon" />
              <span>Role updated successfully!</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          {canChange && (
            <Button 
              onClick={handleRoleChangeRequest} 
              disabled={isUpdating || !selectedRole || selectedRole === mapFrontendToBackend(user.role || 'employee')}
            >
              {isUpdating ? (
                <>
                  <div className="spinner" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
      
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="confirmation-dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500" />
                Confirm Role Change
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to change this user's role?
              </DialogDescription>
            </DialogHeader>

            <div className="confirmation-content">
              <div className="role-change-summary">
                <div className="change-item">
                  <span className="change-label">User:</span>
                  <span className="change-value">{formatUserName(user!)}</span>
                </div>
                <div className="change-item">
                  <span className="change-label">Current Role:</span>
                  <Badge variant="outline" className="current-role-badge">
                    {currentRoleInfo?.label || user?.role || 'Unknown'}
                  </Badge>
                </div>
                <div className="change-item">
                  <span className="change-label">New Role:</span>
                  <Badge variant="default" className="new-role-badge">
                    {selectedRoleInfo?.label || selectedRole}
                  </Badge>
                </div>
              </div>
              
              <div className="confirmation-warning">
                <FaExclamationTriangle className="warning-icon-small" />
                <p className="warning-text">
                  This action will immediately change the user's permissions and access level. 
                  The change will be logged for security audit purposes.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancelConfirmation} disabled={isUpdating}>
                Cancel
              </Button>
              <Button onClick={handleConfirmedRoleUpdate} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <div className="spinner" />
                    Updating...
                  </>
                ) : (
                  'Confirm Change'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default RoleManagementModal;
