import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../UI/card";
import { Button } from "../UI/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";
import { Input } from "../UI/input";
import { Badge } from "../UI/badge";
import "../../styles/Security.css";
import { Switch } from "../UI/switch";
import ManageRolesModal from "./ManageRolesModal";
import { useSessionTimeoutContext } from "../../providers/SessionTimeoutProvider";
import { sessionService } from "../../services/sessionService";
import { rolesService, Role } from "../../services/rolesService";

// Import icons
import { FaShieldAlt, FaUserPlus, FaToggleOn, FaKey, FaLock, FaExclamationTriangle, FaBell, FaUserCog, FaSearch, FaFileExport } from "react-icons/fa";

const Security = () => {
  const [activeTab, setActiveTab] = useState("access-control");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [dataEncryption, setDataEncryption] = useState(false);
  const [gdprCompliance, setGdprCompliance] = useState(false);
  const [showManageRolesModal, setShowManageRolesModal] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30 minutes");
  const [concurrentSessions, setConcurrentSessions] = useState("2 sessions");
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionData, setSessionData] = useState({
    total: 8,
    administrators: 2,
    managers: 3,
    employees: 3
  });
  const [isForceLogoutLoading, setIsForceLogoutLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
  const { updateSessionTimeout } = useSessionTimeoutContext();

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
      
      const sessionString = `${settings.concurrentSessions} session${settings.concurrentSessions !== 1 ? 's' : ''}`;
      setConcurrentSessions(sessionString);
    } catch (error) {
      console.error("Failed to load timeout settings:", error);
    }
  };

  const loadRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const data = await rolesService.getRoles();
      setRoles(data.roles);
    } catch (error) {
      console.error("Failed to load roles:", error);
    } finally {
      setIsLoadingRoles(false);
    }
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
      updateSessionTimeout(minutes);
      
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

  const handleConcurrentSessionsChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setConcurrentSessions(value);
    
    // Extract number from string
    const sessionCount = value === "Unlimited" ? -1 : parseInt(value.split(' ')[0]);
    
    try {
      await sessionService.updateTimeoutSettings({ concurrentSessions: sessionCount });
      await sessionService.logSecurityAction({
        type: 'SETTINGS_CHANGE',
        description: `Concurrent sessions changed to ${value}`,
        metadata: { oldValue: concurrentSessions, newValue: value }
      });
    } catch (error) {
      console.error("Failed to update concurrent sessions:", error);
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

  return (
    <div className="security-container">
      <div className="security-header">
        <div>
          <h1 className="security-title">Security Settings</h1>
          <p className="security-description">Manage security settings and user access controls</p>
        </div>
        <Button variant="outline" className="audit-button">
          <FaShieldAlt className="mr-2" />
          Security Audit
        </Button>
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
                    <div key={role.id} className="role-card">
                      <div className="role-header">
                        <h3 className="role-title">{role.name}</h3>
                        <Badge variant="default" className="role-badge">Active</Badge>
                      </div>
                      <p className="role-description">{role.description}</p>
                      <div className="role-users">
                        <FaUserPlus className="role-icon" />
                        <span>{role.userCount} Users Assigned</span>
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
                    <h3 className="session-setting-title">Concurrent Sessions</h3>
                    <p className="session-setting-description">Maximum active sessions per user</p>
                  </div>
                  <div className="session-setting-control">
                    <select className="session-select" value={concurrentSessions} onChange={handleConcurrentSessionsChange}>
                      <option>1 session</option>
                      <option>2 sessions</option>
                      <option>3 sessions</option>
                      <option>Unlimited</option>
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
          <Card>
            <CardHeader>
              <CardTitle>Security Activity Logs</CardTitle>
              <CardDescription>Review all security-related activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="audit-header">
                <div className="audit-search">
                  <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <Input type="text" placeholder="Search logs..." className="search-input" />
                  </div>
                </div>
                <Button variant="outline" className="export-button">
                  <FaFileExport className="export-icon" />
                  Export Logs
                </Button>
              </div>
              
              <div className="audit-logs">
                {/* User Login */}
                <div className="audit-log-item">
                  <div className="audit-log-icon login-icon">
                    <FaKey />
                  </div>
                  <div className="audit-log-content">
                    <div className="audit-log-title">User Login</div>
                    <div className="audit-log-user">john.doe@example.com</div>
                  </div>
                  <div className="audit-log-meta">
                    <div className="audit-log-time">Today, 10:45 AM</div>
                    <div className="audit-log-ip">192.168.1.1</div>
                  </div>
                </div>
                
                {/* Password Changed */}
                <div className="audit-log-item">
                  <div className="audit-log-icon password-icon">
                    <FaLock />
                  </div>
                  <div className="audit-log-content">
                    <div className="audit-log-title">Password Changed</div>
                    <div className="audit-log-user">mark.wilson@example.com</div>
                  </div>
                  <div className="audit-log-meta">
                    <div className="audit-log-time">Yesterday, 4:23 PM</div>
                    <div className="audit-log-ip">192.168.1.5</div>
                  </div>
                </div>
                
                {/* Failed Login Attempt */}
                <div className="audit-log-item">
                  <div className="audit-log-icon error-icon">
                    <FaExclamationTriangle />
                  </div>
                  <div className="audit-log-content">
                    <div className="audit-log-title">Failed Login Attempt</div>
                    <div className="audit-log-user">sarah.johnson@example.com</div>
                  </div>
                  <div className="audit-log-meta">
                    <div className="audit-log-time">Jan 15, 2023, 9:30 AM</div>
                    <div className="audit-log-ip">192.168.1.10</div>
                  </div>
                </div>
                
                {/* Security Alert */}
                <div className="audit-log-item">
                  <div className="audit-log-icon alert-icon">
                    <FaBell />
                  </div>
                  <div className="audit-log-content">
                    <div className="audit-log-title">Security Alert Triggered</div>
                    <div className="audit-log-user">Unusual access pattern detected</div>
                  </div>
                  <div className="audit-log-meta">
                    <div className="audit-log-time">Jan 12, 2023, 3:15 PM</div>
                    <div className="audit-log-ip">System</div>
                  </div>
                </div>
                
                {/* Role Permissions Changed */}
                <div className="audit-log-item">
                  <div className="audit-log-icon role-icon">
                    <FaUserCog />
                  </div>
                  <div className="audit-log-content">
                    <div className="audit-log-title">Role Permissions Changed</div>
                    <div className="audit-log-user">Admin updated Manager role</div>
                  </div>
                  <div className="audit-log-meta">
                    <div className="audit-log-time">Jan 10, 2023, 11:05 AM</div>
                    <div className="audit-log-ip">admin@example.com</div>
                  </div>
                </div>
              </div>
              
              <div className="load-more-container">
                <Button variant="outline" className="load-more-button">Load More</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Manage Roles Modal */}
      <ManageRolesModal 
        isOpen={showManageRolesModal} 
        onClose={() => setShowManageRolesModal(false)} 
      />
    </div>
  );
};

export default Security;
