import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../UI/card";
import { Button } from "../UI/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";

import { Badge } from "../UI/badge";
import "../../styles/Security.css";

import ManageRolesModal from "./ManageRolesModal";
import UserPermissionsModal from "./UserPermissionsModal";
import RoleUsersModal from "./RoleUsersModal";
// import { useSessionTimeoutContext } from "../../providers/SessionTimeoutProvider";
import { sessionService } from "../../services/sessionService";
// import { rolesService, Role } from "../../services/rolesService";
import ActivityLogs from "./ActivityLogs";
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders, updateUserPermissions } from "../../utils/api";
import { calculateUserPermissions, ROLE_PERMISSIONS, type UserWithPermissions, type AllPermission, type IndividualPermissions } from "../../utils/permissions";

// Import icons
import { FaShieldAlt, FaUserPlus } from "react-icons/fa";



// Define interface for employee data from API
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
  individualPermissions?: IndividualPermissions; // Individual permission overrides from backend
  effectivePermissions?: AllPermission[]; // Calculated final permissions
}

// Define interface for API response
interface EmployeesResponse {
  employees: EmployeeData[];
}

// Define interface for role summary
interface RoleSummary {
  name: string;
  description: string;
  userCount: number;
  users: EmployeeData[]; // Add users array to role summary
  permissions: AllPermission[]; // Role-based default permissions
}

const Security = () => {
  const [activeTab, setActiveTab] = useState("access-control");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [showManageRolesModal, setShowManageRolesModal] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30 minutes");
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionData, setSessionData] = useState({
    total: 8,
    administrators: 2,
    managers: 3,
    employees: 3
  });
  const [isForceLogoutLoading, setIsForceLogoutLoading] = useState(false);
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EmployeeData | null>(null);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleSummary | null>(null);
  
  // Normalize role names to standard values - moved to top for accessibility
  const normalizeRole = (role: string): string => {
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
  
  // const { updateSessionTimeout } = useSessionTimeoutContext();

  // Load session data on component mount and tab change
  useEffect(() => {
    if (activeTab === "access-control") {
      loadSessionData();
      loadRoles();
    }
  }, [activeTab]);

  // Load timeout settings on mount
  useEffect(() => {
    loadTimeoutSettings();
  }, []);

  // Debug: Monitor roles state changes
  useEffect(() => {
    console.log('🔄 Roles state changed:', roles.length, 'roles');
    roles.forEach(role => {
      console.log(`  - ${role.name}: ${role.userCount} users`);
      role.users.forEach(user => {
        if (user.individualPermissions && (user.individualPermissions.added?.length || user.individualPermissions.removed?.length)) {
          console.log(`    * ${user.email}: ${user.individualPermissions.added?.length || 0} added, ${user.individualPermissions.removed?.length || 0} removed`);
        }
      });
    });
  }, [roles]);

  const loadSessionData = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await sessionService.getActiveSessions();
      setSessionData({
        total: data.totalSessions,
        administrators: data.sessionsByRole.Administrator,
        managers: data.sessionsByRole.Manager,
        employees: data.sessionsByRole.Employee
      });
    } catch (error) {
      console.error("Failed to load session data:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadTimeoutSettings = async () => {
    try {
      const settings = await sessionService.getTimeoutSettings();
      const timeoutString = 
        settings.timeoutMinutes === 15 ? "15 minutes" :
        settings.timeoutMinutes === 60 ? "1 hour" :
        settings.timeoutMinutes === 1440 ? "24 hours" :
        settings.timeoutMinutes === 20160 ? "14 days" : "30 minutes";
      setSessionTimeout(timeoutString);
      

    } catch (error) {
      console.error("Failed to load timeout settings:", error);
    }
  };

  const loadRoles = async () => {
    setIsLoadingRoles(true);
    try {
      // Use the same enterprise employees endpoint as UserManagement
      const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_EMPLOYEES);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('📥 Backend response for employees:', data);
      
      // Process employees to extract role information
      const employees = (data as EmployeesResponse).employees;
      
      console.log('👥 Employees with individual permissions:', employees.filter(emp => emp.individualPermissions).map(emp => ({
        id: emp.id,
        email: emp.email,
        role: emp.role,
        individualPermissions: emp.individualPermissions
      })));
      
      // Count users by role
      const roleCounts: { [key: string]: number } = {};
      const roleDescriptions: { [key: string]: string } = {
        'Administrator': 'Full system access and permissions',
        'Manager': 'Can manage cards and departments',
        'Employee': 'View only their own cards'
      };
      
      // Debug: Log original roles from backend
      console.log('🔍 Original roles from backend:', employees.map(emp => ({ 
        name: emp.name || emp.firstName, 
        email: emp.email, 
        originalRole: emp.role 
      })));
      
      // Count employees by normalized role
      employees.forEach((emp: EmployeeData) => {
        const normalizedRole = normalizeRole(emp.role || 'Employee');
        roleCounts[normalizedRole] = (roleCounts[normalizedRole] || 0) + 1;
      });
      
      // Create role summaries with users using normalized roles
      const roleSummaries: RoleSummary[] = Object.entries(roleCounts).map(([roleName, count]) => {
        const roleUsers = employees.filter((emp: EmployeeData) => normalizeRole(emp.role || 'Employee') === roleName);
        
        // Calculate effective permissions for each user
        const usersWithEffectivePermissions = roleUsers.map(user => ({
          ...user,
          effectivePermissions: calculateEffectivePermissions(user)
        }));
        
        return {
          name: roleName,
          description: roleDescriptions[roleName] || 'Custom role with specific permissions',
          userCount: count,
          users: usersWithEffectivePermissions,
          permissions: getDefaultPermissions(roleName)
        };
      });
      
      // Sort roles by user count (descending)
      roleSummaries.sort((a, b) => b.userCount - a.userCount);
      
      // Debug: Log normalized roles
      console.log('✅ Normalized roles:', roleSummaries.map(role => ({
        name: role.name,
        userCount: role.userCount,
        users: role.users.map(u => u.email)
      })));
      
      console.log('🔄 Setting roles state with', roleSummaries.length, 'roles');
      setRoles(roleSummaries);
      console.log('✅ Roles state updated');
      
    } catch (error) {
      console.error("Failed to load roles:", error);
      // Fallback to default roles if API fails
      setRoles([
        {
          name: 'Administrator',
          description: 'Full system access and permissions',
          userCount: 0,
          users: [],
          permissions: getDefaultPermissions('Administrator')
        },
        {
          name: 'Manager',
          description: 'Can manage cards and departments',
          userCount: 0,
          users: [],
          permissions: getDefaultPermissions('Manager')
        },
        {
          name: 'Employee',
          description: 'View only their own cards',
          userCount: 0,
          users: [],
          permissions: getDefaultPermissions('Employee')
        }
      ]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  // Helper function to calculate effective permissions for a user
  const calculateEffectivePermissions = (employee: EmployeeData): AllPermission[] => {
    const userWithPermissions: UserWithPermissions = {
      id: employee.id.toString(),
      email: employee.email,
      role: employee.role,
      plan: 'enterprise',
      isEmployee: true,
      individualPermissions: employee.individualPermissions
    };
    
    const effectivePermissions = calculateUserPermissions(userWithPermissions);
    
    // Debug logging for permission calculation
    if (employee.individualPermissions && (employee.individualPermissions.added?.length || employee.individualPermissions.removed?.length)) {
      console.log('🔍 Calculating effective permissions for:', employee.email, {
        role: employee.role,
        individualPermissions: employee.individualPermissions,
        effectivePermissions
      });
    }
    
    return effectivePermissions;
  };

  // Helper function to get default permissions based on role (for role display)
  const getDefaultPermissions = (roleName: string): AllPermission[] => {
    const normalizedRole = normalizeRole(roleName);
    const permissions = ROLE_PERMISSIONS[normalizedRole as keyof typeof ROLE_PERMISSIONS] || [];
    return [...permissions]; // Convert readonly array to mutable array
  };



  const handleSessionTimeoutChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSessionTimeout(value);
    
    // Convert to minutes and update context
    const timeoutMap: { [key: string]: number } = {
      "15 minutes": 15,
      "1 hour": 60,
      "24 hours": 1440,
      "14 days": 20160,
    };
    
    const minutes = timeoutMap[value];
    if (minutes) {
      // updateSessionTimeout(minutes);
      
      // Save to backend
      try {
        await sessionService.updateTimeoutSettings({ timeoutMinutes: minutes });
        await sessionService.logSecurityAction({
          type: 'SETTINGS_CHANGE',
          description: `Session timeout changed to ${value}`,
          metadata: { oldValue: sessionTimeout, newValue: value }
        });
      } catch (error) {
        console.error("Failed to update timeout settings:", error);
      }
    }
  };



  const handleForceLogout = async () => {
    if (window.confirm("Are you sure you want to force logout all users? This will immediately terminate all active sessions.")) {
      setIsForceLogoutLoading(true);
      try {
        const result = await sessionService.forceLogoutAllUsers();
        
        if (result.success) {
          alert(`${result.message}\n\nLogged out ${result.loggedOutCount} users.`);
          
          // Log the action
          await sessionService.logSecurityAction({
            type: 'FORCE_LOGOUT',
            description: `Force logout initiated - ${result.loggedOutCount} users logged out`,
            metadata: { loggedOutCount: result.loggedOutCount }
          });
          
          // Refresh session data
          await loadSessionData();
        }
      } catch (error) {
        console.error("Failed to force logout users:", error);
        alert("Failed to force logout users. Please try again.");
      } finally {
        setIsForceLogoutLoading(false);
      }
    }
  };

  // Open users modal for a role
  const openUsersModal = (role: RoleSummary) => {
    setSelectedRole(role);
    setUsersModalOpen(true);
  };

  // Close users modal
  const closeUsersModal = () => {
    setUsersModalOpen(false);
    setSelectedRole(null);
  };



  // Open permissions modal for a user
  const openPermissionsModal = (user: EmployeeData) => {
    setSelectedUser(user);
    setPermissionsModalOpen(true);
  };

  // Close permissions modal
  const closePermissionsModal = () => {
    setPermissionsModalOpen(false);
    setSelectedUser(null);
  };

  // Save user permissions
  const saveUserPermissions = async (userId: number, individualPermissions: { removed: string[]; added: string[] }) => {
    setSavingPermissions(true);
    try {
      console.log('🔄 Saving permissions for user:', userId, 'with:', individualPermissions);
      
      // Use the universal permission update function that automatically routes to the correct endpoint
      const result = await updateUserPermissions(
        userId.toString(),
        individualPermissions
      );

      if (result.success) {
        console.log('✅ Permissions saved successfully, reloading roles...');
        // Reload roles to get updated data with recalculated permissions
        await loadRoles();
        console.log('✅ Roles reloaded, checking if state updated...');
        
        // Force a re-render by updating a state variable
        setRoles(prevRoles => {
          console.log('🔄 Updating roles state, current roles:', prevRoles.length);
          return [...prevRoles];
        });
        
        alert('User permissions updated successfully');
      } else {
        throw new Error(result.message || 'Failed to save permissions');
      }
    } catch (error) {
      console.error('Error saving user permissions:', error);
      alert('Failed to save permissions. Please try again.');
    } finally {
      setSavingPermissions(false);
    }
  };



  return (
    <div className="security-container">
      <div className="security-header">
        <div>
          <h1 className="security-title">Security Settings</h1>
          <p className="security-description">Manage security settings and user access controls</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadRoles} disabled={isLoadingRoles}>
            <FaShieldAlt className="mr-2" />
            Refresh Roles
          </Button>
          <Button variant="outline" className="audit-button">
            <FaShieldAlt className="mr-2" />
            Security Audit
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="security-tabs">
        <TabsList>
          <TabsTrigger value="access-control">Access Control</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          {/* DO NOT DELETE/REMOVE/EDIT - Compliance tab will be implemented in the future */}
          {/* <TabsTrigger value="compliance">Compliance</TabsTrigger> */}
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="access-control" className="security-tab-content">
          {/* Role-Based Access Control Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Role-Based Access Control</CardTitle>
              <CardDescription>Manage what different user roles can access in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="roles-container">
                {isLoadingRoles ? (
                  <div className="role-loading">Loading roles...</div>
                ) : roles.length > 0 ? (
                  roles.map((role) => (
                    <div key={role.name} className="role-card">
                      <div className="role-header">
                        <h3 className="role-title">{role.name}</h3>
                        <Badge variant="default" className="role-badge">Active</Badge>
                      </div>
                      <p className="role-description">{role.description}</p>
                      <div className="role-users">
                        <FaUserPlus className="role-icon" />
                        <span>{role.userCount} Users Assigned</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUsersModal(role)}
                          className="role-expand-button"
                        >
                          View Users
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="role-empty">No roles found</div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="manage-roles-button" 
                onClick={() => setShowManageRolesModal(true)}
              >
                Manage Roles
              </Button>
            </CardContent>
          </Card>
          
          {/* Session Management */}
          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>Control user sessions and access policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="session-settings">
                <div className="session-setting-item">
                  <div>
                    <h3 className="session-setting-title">Session Timeout</h3>
                    <p className="session-setting-description">Automatically log out inactive users</p>
                  </div>
                  <div className="session-setting-control">
                    <select className="session-select" value={sessionTimeout} onChange={handleSessionTimeoutChange}>
                      <option>15 minutes</option>
                      <option>1 hour</option>
                      <option>24 hours</option>
                      <option>14 days</option>
                    </select>
                  </div>
                </div>
                

                
                <div className="session-setting-item">
                  <div>
                    <h3 className="session-setting-title">Force Logout All Users</h3>
                    <p className="session-setting-description">Immediately terminate all active sessions</p>
                  </div>
                  <div className="session-setting-control">
                    <Button 
                      variant="outline" 
                      className="force-logout-button" 
                      onClick={handleForceLogout}
                      disabled={isForceLogoutLoading}
                    >
                      {isForceLogoutLoading ? "Processing..." : "Force Logout"}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="active-sessions-summary">
                <div className="active-sessions-header">
                  <h4 className="active-sessions-title">
                    Current Active Sessions: {isLoadingSessions ? "..." : sessionData.total}
                  </h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadSessionData} 
                    disabled={isLoadingSessions}
                    className="refresh-sessions-button"
                  >
                    {isLoadingSessions ? "Loading..." : "Refresh"}
                  </Button>
                </div>
                <div className="session-breakdown">
                  {isLoadingSessions ? (
                    <span className="session-loading">Loading session data...</span>
                  ) : (
                    <>
                      <span className="session-type">Administrators: {sessionData.administrators}</span>
                      <span className="session-type">Managers: {sessionData.managers}</span>
                      <span className="session-type">Employees: {sessionData.employees}</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="authentication" className="security-tab-content">
          {/* Multi-Factor Authentication */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="ip-restriction">
                <div>
                  <h3 className="ip-restriction-title">Require MFA</h3>
                  <p className="ip-restriction-description">Enforce MFA for all users</p>
                </div>
                <div className="toggle-switch" onClick={() => setMfaRequired(!mfaRequired)}>
                  <div className={`toggle ${mfaRequired ? 'active' : ''}`}>
                    <div className="toggle-thumb"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Authentication Methods */}
          <div className="auth-methods-grid">
            <Card>
              <CardHeader>
                <CardTitle>SMS Authentication</CardTitle>
                <CardDescription>Receive codes via SMS</CardDescription>
              </CardHeader>
              <CardContent className="text-right">
                <Button variant="outline">Configure</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Authenticator App</CardTitle>
                <CardDescription>Use Google Authenticator or similar</CardDescription>
              </CardHeader>
              <CardContent className="text-right">
                <Button variant="outline">Configure</Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Password Policy */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>Configure password requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="password-policy-grid">
                <div className="password-policy-item">
                  <label className="password-policy-label">Password Strength</label>
                  <div className="password-policy-select">
                    <select>
                      <option>Strong</option>
                      <option>Medium</option>
                      <option>Weak</option>
                    </select>
                  </div>
                </div>
                
                <div className="password-policy-item">
                  <label className="password-policy-label">Session Timeout (minutes)</label>
                  <div className="password-policy-select">
                    <select>
                      <option>30 minutes</option>
                      <option>60 minutes</option>
                      <option>120 minutes</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="password-requirements mt-6">
                <h3 className="password-requirements-title">Password Requirements:</h3>
                <ul className="password-requirements-list">
                  <li className="password-requirement-item">
                    <span className="password-requirement-check">✓</span>
                    Minimum 8 characters
                  </li>
                  <li className="password-requirement-item">
                    <span className="password-requirement-check">✓</span>
                    At least one uppercase letter
                  </li>
                  <li className="password-requirement-item">
                    <span className="password-requirement-check">✓</span>
                    At least one number
                  </li>
                  <li className="password-requirement-item">
                    <span className="password-requirement-check">✓</span>
                    At least one special character
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 
        ==================================================================================
        DO NOT DELETE/REMOVE/EDIT - COMPLIANCE TAB - FUTURE IMPLEMENTATION
        ==================================================================================
        This compliance tab is commented out for future implementation.
        Keep all this code intact - it will be activated later.
        ==================================================================================
        */}
        {/*
        <TabsContent value="compliance" className="security-tab-content">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Protection</CardTitle>
              <CardDescription>Compliance settings and data security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="compliance-setting">
                <div>
                  <h3 className="compliance-setting-title">Data Encryption</h3>
                  <p className="compliance-setting-description">Encrypt all sensitive data</p>
                </div>
                <div className="toggle-switch" onClick={() => setDataEncryption(!dataEncryption)}>
                  <div className={`toggle ${dataEncryption ? 'active' : ''}`}>
                    <div className="toggle-thumb"></div>
                  </div>
                </div>
              </div>
              
              <div className="compliance-setting mt-6">
                <div>
                  <h3 className="compliance-setting-title">GDPR Compliance</h3>
                  <p className="compliance-setting-description">Enable GDPR compliance features</p>
                </div>
                <div className="toggle-switch" onClick={() => setGdprCompliance(!gdprCompliance)}>
                  <div className={`toggle ${gdprCompliance ? 'active' : ''}`}>
                    <div className="toggle-thumb"></div>
                  </div>
                </div>
              </div>
              
              <div className="compliance-setting mt-6">
                <div>
                  <h3 className="compliance-setting-title">Data Retention Policy</h3>
                  <p className="compliance-setting-description">Set automatic data deletion timeframes</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="compliance-alert mb-6">
            <div className="compliance-alert-icon">
              <FaShieldAlt />
            </div>
            <div className="compliance-alert-content">
              <h3 className="compliance-alert-title">Compliance Audit Due</h3>
              <p className="compliance-alert-message">Your annual compliance audit is due in 14 days</p>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Security Certifications</CardTitle>
              <CardDescription>View and manage security certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="certifications-grid">
                <div className="certification-card">
                  <div className="certification-icon">
                    <FaShieldAlt />
                  </div>
                  <h3 className="certification-name">SOC 2 Type II</h3>
                  <Badge variant="default" className="certification-status">Certified</Badge>
                </div>
                
                <div className="certification-card">
                  <div className="certification-icon">
                    <FaShieldAlt />
                  </div>
                  <h3 className="certification-name">ISO 27001</h3>
                  <Badge variant="secondary" className="certification-status">In Progress</Badge>
                </div>
                
                <div className="certification-card">
                  <div className="certification-icon">
                    <FaShieldAlt />
                  </div>
                  <h3 className="certification-name">GDPR</h3>
                  <Badge variant="outline" className="certification-status">Compliant</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        */}
        
        <TabsContent value="audit-logs" className="security-tab-content">
          <ActivityLogs />
        </TabsContent>
        

      </Tabs>
      
      {/* Manage Roles Modal */}
      <ManageRolesModal 
        isOpen={showManageRolesModal} 
        onClose={() => setShowManageRolesModal(false)} 
      />

      {/* User Permissions Modal */}
      <UserPermissionsModal
        isOpen={permissionsModalOpen}
        onClose={closePermissionsModal}
        user={selectedUser}
        rolePermissions={selectedUser ? getDefaultPermissions(selectedUser.role || 'Employee') : []}
        onSave={saveUserPermissions}
        saving={savingPermissions}
      />

      {/* Role Users Modal */}
      <RoleUsersModal
        isOpen={usersModalOpen}
        onClose={closeUsersModal}
        role={selectedRole}
        onEditUserPermissions={openPermissionsModal}
      />
    </div>
  );
};

export default Security;
