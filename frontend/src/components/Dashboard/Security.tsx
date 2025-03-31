import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../UI/card";
import { Button } from "../UI/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";
import { Input } from "../UI/input";
import { Badge } from "../UI/badge";
import "../../styles/Security.css";
import { Switch } from "../UI/switch";

// Import icons
import { FaShieldAlt, FaUserPlus, FaToggleOn, FaKey, FaLock, FaExclamationTriangle, FaBell, FaUserCog, FaSearch, FaFileExport } from "react-icons/fa";

const Security = () => {
  const [activeTab, setActiveTab] = useState("access-control");
  const [ipRestrictionEnabled, setIpRestrictionEnabled] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [dataEncryption, setDataEncryption] = useState(false);
  const [gdprCompliance, setGdprCompliance] = useState(false);

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
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
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
                <div className="role-card">
                  <div className="role-header">
                    <h3 className="role-title">Administrator</h3>
                    <Badge variant="default" className="role-badge">Active</Badge>
                  </div>
                  <p className="role-description">Full system access and permissions</p>
                  <div className="role-users">
                    <FaUserPlus className="role-icon" />
                    <span>5 Users Assigned</span>
                  </div>
                </div>
                
                <div className="role-card">
                  <div className="role-header">
                    <h3 className="role-title">Manager</h3>
                    <Badge variant="default" className="role-badge">Active</Badge>
                  </div>
                  <p className="role-description">Can manage cards and departments</p>
                  <div className="role-users">
                    <FaUserPlus className="role-icon" />
                    <span>12 Users Assigned</span>
                  </div>
                </div>
                
                <div className="role-card">
                  <div className="role-header">
                    <h3 className="role-title">Employee</h3>
                    <Badge variant="default" className="role-badge">Active</Badge>
                  </div>
                  <p className="role-description">View only their own cards</p>
                  <div className="role-users">
                    <FaUserPlus className="role-icon" />
                    <span>38 Users Assigned</span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="manage-roles-button">
                Manage Roles
              </Button>
            </CardContent>
          </Card>
          
          {/* IP Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle>IP Restrictions</CardTitle>
              <CardDescription>Control which IP addresses can access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="ip-restriction">
                <div>
                  <h3 className="ip-restriction-title">IP Restriction</h3>
                  <p className="ip-restriction-description">Restrict access to specific IP addresses</p>
                </div>
                <Switch 
                  checked={ipRestrictionEnabled} 
                  onChange={setIpRestrictionEnabled} 
                />
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
        
        <TabsContent value="compliance" className="security-tab-content">
          {/* Data Protection Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Protection</CardTitle>
              <CardDescription>Compliance settings and data security</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Data Encryption Toggle */}
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
              
              {/* GDPR Compliance Toggle */}
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
              
              {/* Data Retention Policy */}
              <div className="compliance-setting mt-6">
                <div>
                  <h3 className="compliance-setting-title">Data Retention Policy</h3>
                  <p className="compliance-setting-description">Set automatic data deletion timeframes</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Compliance Audit Alert */}
          <div className="compliance-alert mb-6">
            <div className="compliance-alert-icon">
              <FaShieldAlt />
            </div>
            <div className="compliance-alert-content">
              <h3 className="compliance-alert-title">Compliance Audit Due</h3>
              <p className="compliance-alert-message">Your annual compliance audit is due in 14 days</p>
            </div>
          </div>
          
          {/* Security Certifications */}
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
    </div>
  );
};

export default Security;
