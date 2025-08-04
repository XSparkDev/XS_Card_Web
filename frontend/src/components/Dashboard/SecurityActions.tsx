import React, { useState } from 'react';
import { Button } from '../UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/card';
import { buildEnterpriseUrl, getEnterpriseHeaders } from '../../utils/api';

// Types
interface SecurityActionResponse {
  status: boolean;
  message: string;
  data?: {
    actionId: string;
    performedAt: string;
    performedBy: string;
  };
}

// Icon Component matching UserManagement style
type IconName = "UserX" | "Shield" | "CheckCircle" | "XCircle" | "Zap";

const IconComponent = ({ 
  name, 
  className = "", 
  ...props 
}: { 
  name: IconName; 
  className?: string; 
} & React.SVGProps<SVGSVGElement>) => {
  const icons = {
    UserX: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>,
    Shield: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    CheckCircle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m12 15 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>,
    XCircle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>,
    Zap: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  };

  return icons[name] || null;
};

// Main Security Actions Component
const SecurityActions = () => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock users for demo
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@company.com', role: 'Employee' },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'Manager' },
    { id: '3', name: 'Bob Wilson', email: 'bob@company.com', role: 'Employee' }
  ];

  // Available security actions
  const securityActions = [
    { id: 'lock-account', name: 'Lock Account', description: 'Temporarily disable user access' },
    { id: 'reset-password', name: 'Reset Password', description: 'Force password reset on next login' },
    { id: 'disable-login', name: 'Disable Login', description: 'Prevent user from logging in' },
    { id: 'audit-trail', name: 'Audit Trail', description: 'Generate detailed activity report' },
    { id: 'security-alert', name: 'Send Security Alert', description: 'Notify user of security concern' }
  ];

  // Perform security action
  const performAction = async () => {
    if (!selectedUser || !selectedAction) {
      setMessage({ type: 'error', text: 'Please select both a user and an action' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const url = buildEnterpriseUrl('/enterprise/:enterpriseId/security/actions');
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: selectedUser,
          action: selectedAction,
          reason: reason || 'No reason provided',
          performedBy: 'current-user-id', // TODO: Get from auth context
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data: SecurityActionResponse = await response.json();
        setMessage({ type: 'success', text: data.message || 'Action performed successfully' });
        setSelectedUser('');
        setSelectedAction('');
        setReason('');
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to perform action' });
      }
    } catch (err) {
      console.error('Error performing security action:', err);
      setMessage({ type: 'error', text: 'Failed to perform security action' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alerts-container">
      {/* Message Display */}
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-warning' : 'alert-danger'}`}>
          <IconComponent 
            name={message.type === 'success' ? 'CheckCircle' : 'XCircle'} 
            className="alert-icon" 
          />
          <div className="alert-content">
            <div className="alert-description">{message.text}</div>
          </div>
        </div>
      )}

      {/* User Selection */}
      <Card className="sidebar-card">
        <CardHeader className="card-header-compact">
          <CardTitle className="card-title-small">
            <IconComponent name="UserX" className="icon-small mr-2" />
            Select User
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-compact">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="select-input"
          >
            <option value="">Choose a user...</option>
            {mockUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email}) - {user.role}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Action Selection */}
      <Card className="sidebar-card">
        <CardHeader className="card-header-compact">
          <CardTitle className="card-title-small">
            <IconComponent name="Shield" className="icon-small mr-2" />
            Select Action
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-compact">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="select-input"
          >
            <option value="">Choose an action...</option>
            {securityActions.map(action => (
              <option key={action.id} value={action.id}>
                {action.name} - {action.description}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Reason Input */}
      <Card className="sidebar-card">
        <CardHeader className="card-header-compact">
          <CardTitle className="card-title-small">
            <IconComponent name="Zap" className="icon-small mr-2" />
            Reason (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-compact">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for this action..."
            rows={3}
            style={{ 
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </CardContent>
      </Card>

      {/* Action Button */}
      <Card className="sidebar-card">
        <CardContent className="card-content-compact">
          <Button
            onClick={performAction}
            disabled={loading || !selectedUser || !selectedAction}
            className="action-button"
            style={{ width: '100%' }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '1rem', 
                  height: '1rem', 
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '0.5rem'
                }}></div>
                Performing Action...
              </div>
            ) : (
              'Perform Security Action'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Action Details */}
      {selectedAction && (
        <Card className="sidebar-card">
          <CardHeader className="card-header-compact">
            <CardTitle className="card-title-small">
              <IconComponent name="Shield" className="icon-small mr-2" />
              Action Details
            </CardTitle>
          </CardHeader>
          <CardContent className="card-content-compact">
            <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Action:</strong> {securityActions.find(a => a.id === selectedAction)?.name}</div>
              <div><strong>Description:</strong> {securityActions.find(a => a.id === selectedAction)?.description}</div>
              <div><strong>Impact:</strong> This action will be logged and may affect user access</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityActions;