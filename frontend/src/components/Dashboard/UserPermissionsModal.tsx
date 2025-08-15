import React, { useState, useEffect } from 'react';
import { Button } from '../UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/card';
import { FaUser, FaEdit, FaSave, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import "../../styles/DepartmentModal.css";

// Types
interface Permissions {
  viewCards: boolean;
  createCards: boolean;
  editCards: boolean;
  deleteCards: boolean;
  manageUsers: boolean;
  viewReports: boolean;
  systemSettings: boolean;
  auditLogs: boolean;
}

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
  individualPermissions?: Partial<Permissions>;
  effectivePermissions?: Permissions;
}

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: EmployeeData | null;
  rolePermissions: Permissions;
  onSave: (userId: number, permissions: Partial<Permissions>) => Promise<void>;
  saving: boolean;
}

// Permission Row Component for Table Layout
const PermissionRow = ({ 
  permission, 
  roleValue, 
  userValue, 
  effectiveValue, 
  onChange, 
  disabled = false 
}: {
  permission: keyof Permissions;
  roleValue: boolean;
  userValue: boolean | undefined;
  effectiveValue: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) => {
  const isInherited = userValue === undefined;
  
  return (
    <div className="permission-row">
      <div className="permission-name-cell">
        <span className="permission-name">
          {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        </span>
        {!isInherited && (
          <span className="permission-override-indicator">
            <FaExclamationTriangle className="override-icon" />
            Override
          </span>
        )}
      </div>
      
      <div className="permission-role-cell">
        <div className={`permission-status ${roleValue ? 'active' : 'inactive'}`}>
          {roleValue ? 'Yes' : 'No'}
        </div>
      </div>
      
      <div className="permission-user-cell">
        <select
          value={userValue === undefined ? 'inherit' : userValue.toString()}
          onChange={(e) => {
            if (e.target.value === 'inherit') {
              onChange(undefined as any); // Remove override
            } else {
              onChange(e.target.value === 'true');
            }
          }}
          disabled={disabled}
          className="permission-select"
        >
          <option value="inherit">Inherit</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      
      <div className="permission-effective-cell">
        <div className={`permission-status ${effectiveValue ? 'active' : 'inactive'} effective`}>
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
  const [userPermissions, setUserPermissions] = useState<Partial<Permissions>>({});

  // Initialize permissions when user changes
  useEffect(() => {
    if (user) {
      setUserPermissions(user.individualPermissions || {});
    }
  }, [user]);

  // Calculate effective permissions
  const calculateEffectivePermissions = (): Permissions => {
    return {
      viewCards: userPermissions.viewCards !== undefined ? userPermissions.viewCards : rolePermissions.viewCards,
      createCards: userPermissions.createCards !== undefined ? userPermissions.createCards : rolePermissions.createCards,
      editCards: userPermissions.editCards !== undefined ? userPermissions.editCards : rolePermissions.editCards,
      deleteCards: userPermissions.deleteCards !== undefined ? userPermissions.deleteCards : rolePermissions.deleteCards,
      manageUsers: userPermissions.manageUsers !== undefined ? userPermissions.manageUsers : rolePermissions.manageUsers,
      viewReports: userPermissions.viewReports !== undefined ? userPermissions.viewReports : rolePermissions.viewReports,
      systemSettings: userPermissions.systemSettings !== undefined ? userPermissions.systemSettings : rolePermissions.systemSettings,
      auditLogs: userPermissions.auditLogs !== undefined ? userPermissions.auditLogs : rolePermissions.auditLogs,
    };
  };

  // Update user permission
  const updateUserPermission = (permission: keyof Permissions, value: boolean) => {
    setUserPermissions(prev => ({
      ...prev,
      [permission]: value
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (user) {
      await onSave(user.id, userPermissions);
      onClose();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setUserPermissions(user?.individualPermissions || {});
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
  const hasOverrides = Object.keys(userPermissions).length > 0;

  return (
    <div className="modal-overlay nested-modal" onClick={handleCancel}>
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
              ×
            </button>
          </CardHeader>
          
          <CardContent className="modal-content">
            <div className="modal-description">
              <p>
                Individual permissions override role permissions. Leave as "Inherit from Role" to use default role permissions.
              </p>
            </div>
            
            <div className="permissions-table">
              <div className="permissions-table-header">
                <div className="permission-name-cell">Permission</div>
                <div className="permission-role-cell">Role Value</div>
                <div className="permission-user-cell">User Override</div>
                <div className="permission-effective-cell">Effective</div>
              </div>
              
              <div className="permissions-table-body">
                {(Object.keys(rolePermissions) as Array<keyof Permissions>).map((permission) => (
                  <PermissionRow
                    key={permission}
                    permission={permission}
                    roleValue={rolePermissions[permission]}
                    userValue={userPermissions[permission]}
                    effectiveValue={effectivePermissions[permission]}
                    onChange={(value) => {
                      if (value === undefined) {
                        // Remove override
                        setUserPermissions(prev => {
                          const newPerms = { ...prev };
                          delete newPerms[permission];
                          return newPerms;
                        });
                      } else {
                        updateUserPermission(permission, value);
                      }
                    }}
                    disabled={saving}
                  />
                ))}
              </div>
            </div>
            
            <div className="department-modal-actions">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserPermissionsModal;
