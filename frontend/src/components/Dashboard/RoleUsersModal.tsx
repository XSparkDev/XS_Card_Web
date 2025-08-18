import React, { useState, useMemo } from "react";
import { Button } from "../UI/button";
import { Badge } from "../UI/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card";
import { FaUser, FaEdit, FaExclamationTriangle, FaSearch } from "react-icons/fa";
import "../../styles/Security.css";
import "../../styles/DepartmentModal.css";
import { type BusinessCardPermission, type IndividualPermissions } from "../../utils/permissions";

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
  individualPermissions?: IndividualPermissions;
  effectivePermissions?: BusinessCardPermission[];
}

interface RoleSummary {
  name: string;
  description: string;
  userCount: number;
  users: EmployeeData[];
  permissions: BusinessCardPermission[];
}

interface RoleUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleSummary | null;
  onEditUserPermissions: (user: EmployeeData) => void;
}

const RoleUsersModal: React.FC<RoleUsersModalProps> = ({
  isOpen,
  onClose,
  role,
  onEditUserPermissions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

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

  // Check if user has individual permission overrides
  const hasPermissionOverrides = (user: EmployeeData): boolean => {
    const individualPermissions = user.individualPermissions;
    return !!(individualPermissions && 
      ((individualPermissions.removed && individualPermissions.removed.length > 0) ||
       (individualPermissions.added && individualPermissions.added.length > 0)));
  };

  // Get override summary for display
  const getOverrideSummary = (user: EmployeeData): string => {
    const individualPermissions = user.individualPermissions;
    if (!individualPermissions) return '';

    const removedCount = individualPermissions.removed?.length || 0;
    const addedCount = individualPermissions.added?.length || 0;

    if (removedCount > 0 && addedCount > 0) {
      return `+${addedCount}, -${removedCount}`;
    } else if (addedCount > 0) {
      return `+${addedCount}`;
    } else if (removedCount > 0) {
      return `-${removedCount}`;
    }
    return '';
  };

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return role?.users || [];
    
    const searchLower = searchTerm.toLowerCase();
    return (role?.users || []).filter(user => {
      const firstName = user.firstName?.toLowerCase() || '';
      const lastName = user.lastName?.toLowerCase() || '';
      const name = user.name?.toLowerCase() || '';
      const surname = user.surname?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const employeeId = user.id?.toString() || '';
      
      return (
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        name.includes(searchLower) ||
        surname.includes(searchLower) ||
        email.includes(searchLower) ||
        employeeId.includes(searchLower)
      );
    });
  }, [role?.users, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (!isOpen || !role) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <Card className="modal-card">
          <CardHeader className="modal-header">
            <div className="modal-role-info">
              <div className="modal-role-details">
                <CardTitle className="modal-title">
                  Users in {role.name} Role
                </CardTitle>
                <div className="modal-role-meta">
                  <span className="modal-role-description">{role.description}</span>
                  <span className="modal-role-count">• {role.userCount} users</span>
                </div>
              </div>
            </div>
            <button 
              className="department-modal-close" 
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </CardHeader>
          
          <CardContent className="modal-content">
            {/* Search Bar */}
            <div className="search-container" style={{ marginBottom: '1rem' }}>
              <div className="search-input-container" style={{ position: 'relative' }}>
                <FaSearch 
                  className="search-icon" 
                  style={{ 
                    position: 'absolute', 
                    left: '0.75rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#64748b', 
                    zIndex: 1 
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search users by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
            </div>

            {filteredUsers.length > 0 ? (
              <>
                {/* Search Results Counter */}
                {searchTerm && (
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    Found {filteredUsers.length} of {role.users.length} users
                    {searchTerm && ` matching "${searchTerm}"`}
                  </div>
                )}

                <div className="users-list">
                  {currentUsers.map((user) => {
                  const hasOverrides = hasPermissionOverrides(user);
                  const overrideSummary = getOverrideSummary(user);
                  
                  return (
                    <div key={user.id} className="user-card">
                      <div className="user-card-header">
                        <div className="user-avatar">
                          <FaUser className="user-icon" />
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {formatUserName(user)}
                            {hasOverrides && (
                              <span className="user-override-indicator">
                                <FaExclamationTriangle className="override-icon" />
                                {overrideSummary}
                              </span>
                            )}
                          </div>
                          <div className="user-email">{user.email}</div>
                          {user.departmentName && (
                            <div className="user-department">{user.departmentName}</div>
                          )}
                        </div>
                        <div className="user-actions">
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className="user-status-badge"
                          >
                            {user.status || 'Active'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onEditUserPermissions(user);
                              onClose(); // Close the current modal when opening Edit Permissions
                            }}
                            className="user-edit-button"
                          >
                            <FaEdit className="button-icon" />
                            Edit Permissions
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                              </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginTop: '1rem',
                    padding: '1rem',
                    borderTop: '1px solid #E5E7EB'
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-button"
                      >
                        Previous
                      </Button>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151'
                      }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-button"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                {searchTerm ? (
                  <>
                    <FaSearch className="empty-icon" />
                    <h3 className="empty-title">No users found</h3>
                    <p className="empty-description">
                      No users match your search criteria "{searchTerm}".
                    </p>
                  </>
                ) : (
                  <>
                    <FaUser className="empty-icon" />
                    <h3 className="empty-title">No users assigned</h3>
                    <p className="empty-description">
                      No users are currently assigned to the {role.name} role.
                    </p>
                  </>
                )}
              </div>
            )}
            
            <div className="department-modal-actions">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleUsersModal;
