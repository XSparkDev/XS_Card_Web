import React, { useState, useEffect } from 'react';
import { Button } from '../UI/button';
import { Badge } from '../UI/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../UI/selectRadix';
import { buildEnterpriseUrl, getEnterpriseHeaders } from '../../utils/api';

// Types
interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  title: string;
  description: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  timestamp: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolvedBy?: {
    id: string;
    name: string;
    email: string;
  };
  acknowledgedBy?: {
    id: string;
    name: string;
    email: string;
  };
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    failedAttempts?: number;
    affectedUsers?: number;
    errorCode?: string;
    logEntryId?: string;
  };
}

interface SecurityAlertsResponse {
  status: boolean;
  data: {
    alerts: SecurityAlert[];
    totalCount: number;
    criticalCount: number;
    highCount?: number;
    mediumCount?: number;
    lowCount?: number;
  };
}

// Icon Component matching UserManagement style
type IconName = "AlertTriangle" | "Shield" | "Clock" | "Eye" | "CheckCircle" | "Filter" | "Users" | "LogIn" | "MapPin" | "Lock";

const IconComponent = ({ 
  name, 
  className = "", 
  ...props 
}: { 
  name: IconName; 
  className?: string; 
} & React.SVGProps<SVGSVGElement>) => {
  const icons = {
    AlertTriangle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>,
    Shield: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Clock: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    Eye: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
    CheckCircle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m12 15 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>,
    Filter: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    Users: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 21-2-2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    LogIn: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>,
    MapPin: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
    Lock: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  };

  return icons[name] || null;
};

// Alert Card Component matching the image design
const AlertCard = ({ 
  alert, 
  onAcknowledge, 
  onResolve,
  acknowledgeLoading,
  resolveLoading
}: { 
  alert: SecurityAlert; 
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  acknowledgeLoading: string | null;
  resolveLoading: string | null;
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Get appropriate icon based on alert type
  const getAlertIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'bulk_operations':
      case 'user_operations':
        return 'Users';
      case 'login':
      case 'authentication':
        return 'LogIn';
      case 'location':
      case 'geolocation':
        return 'MapPin';
      case 'password':
      case 'credentials':
        return 'Lock';
      case 'permissions':
      case 'access':
        return 'Shield';
      default:
        return 'AlertTriangle';
    }
  };

  // Get severity colors matching the image
  const getSeverityColors = (severity: string) => {
    switch(severity) {
      case 'critical':
        return { bg: '#FEEAEA', text: '#DC2626', border: '#FECACA' };
      case 'high':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
      case 'medium':
        return { bg: '#FEEFCD', text: '#CA8A04', border: '#FED7AA' };
      case 'low':
        return { bg: '#EBF5FF', text: '#2563EB', border: '#BFDBFE' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
    }
  };

  const severityColors = getSeverityColors(alert.severity);
  const activeColors = { bg: '#FEEAEA', text: '#DC2626', border: '#FECACA' };

  return (
    <div style={{ 
      backgroundColor: '#FFFDF5', 
      border: '1px solid #E5E7EB', 
      borderRadius: '8px', 
      padding: '1rem', 
      marginBottom: '0.75rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
          {/* Alert Icon */}
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginRight: '1rem',
            color: '#F59E0B' // Light orange/yellow as shown in image
          }}>
            <IconComponent name={getAlertIcon(alert.type)} className="icon-small" />
          </div>
          
          {/* Alert Content */}
          <div style={{ flex: 1 }}>
            {/* Title and Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: '#1F2937', 
                margin: 0 
              }}>
                {alert.title}
              </h3>
              
              {/* Severity Badge */}
              <span style={{
                backgroundColor: severityColors.bg,
                color: severityColors.text,
                border: `1px solid ${severityColors.border}`,
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '500',
                textTransform: 'uppercase'
              }}>
                {alert.severity.toUpperCase()}
              </span>
              
              {/* Active Badge */}
              {alert.status === 'active' && (
                <span style={{
                  backgroundColor: activeColors.bg,
                  color: activeColors.text,
                  border: `1px solid ${activeColors.border}`,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  textTransform: 'uppercase'
                }}>
                  ACTIVE
                </span>
              )}
            </div>
            
            {/* Description */}
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#374151', 
              margin: '0 0 0.5rem 0',
              lineHeight: '1.4'
            }}>
              {alert.description}
            </p>
            
            {/* Details */}
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6B7280',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              {alert.user && (
                <span>User: {alert.user.email}</span>
              )}
              <span>Time: {formatTimestamp(alert.timestamp)}</span>
              {alert.metadata.location && (
                <span>Location: {alert.metadata.location}</span>
              )}
            </div>
          </div>
        </div>
        
                 {/* Action Buttons */}
         {alert.status === 'active' && (
           <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
             <Button 
               size="sm" 
               variant="outline"
               onClick={() => onAcknowledge(alert.id)}
               disabled={acknowledgeLoading === alert.id}
               style={{
                 borderColor: '#F59E0B',
                 color: '#F59E0B',
                 backgroundColor: 'white',
                 fontSize: '0.75rem',
                 padding: '0.375rem 0.75rem'
               }}
             >
               {acknowledgeLoading === alert.id ? (
                 <div style={{ display: 'flex', alignItems: 'center' }}>
                   <div style={{ 
                     width: '0.75rem', 
                     height: '0.75rem', 
                     border: '1px solid #F59E0B', 
                     borderTop: '1px solid transparent',
                     borderRadius: '50%',
                     animation: 'spin 1s linear infinite',
                     marginRight: '0.25rem'
                   }} />
                   Loading...
                 </div>
               ) : (
                 <>
                   <IconComponent name="Eye" className="icon-tiny mr-1" />
                   Acknowledge
                 </>
               )}
             </Button>
             <Button 
               size="sm" 
               variant="outline"
               onClick={() => onResolve(alert.id)}
               disabled={resolveLoading === alert.id}
               style={{
                 borderColor: '#22C55E',
                 color: '#22C55E',
                 backgroundColor: 'white',
                 fontSize: '0.75rem',
                 padding: '0.375rem 0.75rem'
               }}
             >
               {resolveLoading === alert.id ? (
                 <div style={{ display: 'flex', alignItems: 'center' }}>
                   <div style={{ 
                     width: '0.75rem', 
                     height: '0.75rem', 
                     border: '1px solid #22C55E', 
                     borderTop: '1px solid transparent',
                     borderRadius: '50%',
                     animation: 'spin 1s linear infinite',
                     marginRight: '0.25rem'
                   }} />
                   Loading...
                 </div>
               ) : (
                 <>
                   <IconComponent name="CheckCircle" className="icon-tiny mr-1" />
                   Resolve
                 </>
               )}
             </Button>
           </div>
         )}
      </div>
    </div>
  );
};

// Main Security Alerts Component
const SecurityAlerts = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [acknowledgeLoading, setAcknowledgeLoading] = useState<string | null>(null);
  const [resolveLoading, setResolveLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCount: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 5;
  const [filters, setFilters] = useState({
    severity: 'all'
    // Status filter removed - only severity filtering available
  });

    // Fetch alerts from backend
  const fetchAlerts = async () => {
    try {
      const url = buildEnterpriseUrl('/enterprise/:enterpriseId/security/alerts');
      const headers = getEnterpriseHeaders();
      
      console.log('Fetching alerts from:', url);
      console.log('Headers:', headers);
      
      const response = await fetch(url, { headers });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: SecurityAlertsResponse = await response.json();
      console.log('API Response:', data);
      console.log('Alerts from API:', data.data.alerts);
      
      // Log first few alerts in detail to see the data structure
      console.log('First 3 alerts detailed:', data.data.alerts.slice(0, 3).map(alert => ({
        id: alert.id,
        severity: alert.severity,
        status: alert.status,
        title: alert.title,
        type: alert.type
      })));
      
      setAlerts(data.data.alerts);
      
      // Calculate severity counts from the alerts data (not from API stats)
      const highCount = data.data.alerts.filter(alert => alert.severity === 'high').length;
      const mediumCount = data.data.alerts.filter(alert => alert.severity === 'medium').length;
      const lowCount = data.data.alerts.filter(alert => alert.severity === 'low').length;
      const criticalCount = data.data.alerts.filter(alert => alert.severity === 'critical').length;
      
      console.log('Calculated counts from actual alerts:', { criticalCount, highCount, mediumCount, lowCount });
      console.log('API provided counts (ignored due to mismatch):', { 
        criticalCount: data.data.criticalCount, 
        highCount: data.data.highCount, 
        mediumCount: data.data.mediumCount, 
        lowCount: data.data.lowCount 
      });
      
      setStats({
        totalCount: data.data.alerts.length, // Use actual alerts count
        criticalCount: criticalCount, // Use calculated count, not API count
        highCount: highCount,
        mediumCount: mediumCount,
        lowCount: lowCount
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching security alerts:', err);
      setError('Failed to load security alerts');
      
      // Add fallback mock data for testing
      console.log('Using fallback mock data for testing');
      const mockAlerts: SecurityAlert[] = [
        {
          id: '1',
          type: 'system_error',
          severity: 'critical',
          status: 'active',
          title: 'Critical System Error',
          description: 'A critical system error has been detected affecting user management functionality.',
          timestamp: new Date().toISOString(),
          metadata: {
            errorCode: 'ERR_001',
            affectedUsers: 5
          }
        },
        {
          id: '2',
          type: 'authentication',
          severity: 'high',
          status: 'active',
          title: 'Multiple Failed Login Attempts',
          description: 'Multiple failed login attempts detected from suspicious IP address.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          metadata: {
            ipAddress: '192.168.1.100',
            failedAttempts: 10,
            location: 'Unknown'
          }
        },
        {
          id: '3',
          type: 'user_operations',
          severity: 'medium',
          status: 'acknowledged',
          title: 'Bulk User Operations',
          description: 'Large number of user operations detected in short time period.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          metadata: {
            affectedUsers: 25
          }
        },
        {
          id: '4',
          type: 'permissions',
          severity: 'high',
          status: 'resolved',
          title: 'Unauthorized Access Attempt',
          description: 'Attempt to access restricted area detected and resolved.',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          metadata: {
            ipAddress: '10.0.0.50',
            location: 'Internal Network'
          }
        },
        {
          id: '5',
          type: 'credentials',
          severity: 'low',
          status: 'acknowledged',
          title: 'Password Reset Request',
          description: 'Multiple password reset requests from same user.',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          metadata: {
            affectedUsers: 1
          }
        }
      ];
      
      setAlerts(mockAlerts);
      
      const highCount = mockAlerts.filter(alert => alert.severity === 'high').length;
      const mediumCount = mockAlerts.filter(alert => alert.severity === 'medium').length;
      const lowCount = mockAlerts.filter(alert => alert.severity === 'low').length;
      const criticalCount = mockAlerts.filter(alert => alert.severity === 'critical').length;
      
      setStats({
        totalCount: mockAlerts.length,
        criticalCount: criticalCount,
        highCount: highCount,
        mediumCount: mediumCount,
        lowCount: lowCount
      });
    } finally {
      setLoading(false);
    }
  };

  // Acknowledge alert
  const handleAcknowledge = async (alertId: string) => {
    if (acknowledgeLoading) return; // Prevent multiple clicks
    
    try {
      setAcknowledgeLoading(alertId);
      
      // Update local state immediately for better UX
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { 
                ...alert, 
                status: 'acknowledged' as const,
                acknowledgedAt: new Date().toISOString(),
                acknowledgedBy: {
                  id: 'current-user-id',
                  name: 'Current User',
                  email: 'user@example.com'
                }
              }
            : alert
        )
      );
      
      // Stats updated automatically when alerts state changes
      
      const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/security/alerts/${alertId}/acknowledge`);
      const headers = getEnterpriseHeaders();
      
      const requestBody = {
        acknowledgedBy: 'current-user-id', // TODO: Get from auth context
        notes: 'Acknowledged via dashboard'
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        // Revert local state if API call fails
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert.id === alertId 
              ? { ...alert, status: 'active' as const, acknowledgedAt: undefined, acknowledgedBy: undefined }
              : alert
          )
        );
        // Stats will be updated when alerts state changes
        
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Failed to acknowledge alert:', response.status, response.statusText, errorText);
        alert(`Failed to acknowledge alert: ${response.status} ${response.statusText}`);
      } else {
        // Optionally refresh from server to ensure consistency
        // await fetchAlerts();
        console.log('Alert acknowledged successfully');
      }
    } catch (err) {
      // Revert local state if API call fails
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'active' as const, acknowledgedAt: undefined, acknowledgedBy: undefined }
            : alert
        )
      );
      // Stats will be updated when alerts state changes
      
      console.error('Error acknowledging alert:', err);
      alert('Failed to acknowledge alert');
    } finally {
      setAcknowledgeLoading(null);
    }
  };

  // Resolve alert
  const handleResolve = async (alertId: string) => {
    if (resolveLoading) return; // Prevent multiple clicks
    
    try {
      setResolveLoading(alertId);
      
      // Update local state immediately for better UX
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { 
                ...alert, 
                status: 'resolved' as const,
                resolvedAt: new Date().toISOString(),
                resolvedBy: {
                  id: 'current-user-id',
                  name: 'Current User',
                  email: 'user@example.com'
                }
              }
            : alert
        )
      );
      
      // Stats updated automatically when alerts state changes
      
      const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/security/alerts/${alertId}/resolve`);
      const headers = getEnterpriseHeaders();
      
      const requestBody = {
        resolvedBy: 'current-user-id', // TODO: Get from auth context
        resolution: 'Issue resolved via dashboard',
        notes: 'Resolved through security dashboard'
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        // Revert local state if API call fails
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert.id === alertId 
              ? { ...alert, status: 'active' as const, resolvedAt: undefined, resolvedBy: undefined }
              : alert
          )
        );
        // Stats will be updated when alerts state changes
        
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Failed to resolve alert:', response.status, response.statusText, errorText);
        alert(`Failed to resolve alert: ${response.status} ${response.statusText}`);
      } else {
        // Optionally refresh from server to ensure consistency
        // await fetchAlerts();
        console.log('Alert resolved successfully');
      }
    } catch (err) {
      // Revert local state if API call fails
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'active' as const, resolvedAt: undefined, resolvedBy: undefined }
            : alert
        )
      );
      // Stats will be updated when alerts state changes
      
      console.error('Error resolving alert:', err);
      alert('Failed to resolve alert');
    } finally {
      setResolveLoading(null);
    }
  };

  // Filter alerts based on current filters
  const getFilteredAlerts = () => {
    console.log('Current filters:', filters);
    console.log('All alerts:', alerts);
    
    // Check status distribution for debugging
    const statusCounts = alerts.reduce((acc, alert) => {
      acc[alert.status] = (acc[alert.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('Status distribution:', statusCounts);
    
    console.log('Alerts with severity:', alerts.map(a => ({ id: a.id, severity: a.severity, status: a.status })));
    
    const filtered = alerts.filter(alert => {
      const severityMatch = filters.severity === 'all' || alert.severity === filters.severity;
      
      console.log(`Alert ${alert.id}: severity=${alert.severity}, status=${alert.status}, severityMatch=${severityMatch}`);
      
      return severityMatch; // Only filter by severity now
    });
    
    console.log('Filtered alerts:', filtered);
    console.log('Filter summary:', {
      severityFilter: filters.severity,
      totalAlerts: alerts.length,
      filteredCount: filtered.length,
      severityMatches: alerts.filter(a => filters.severity === 'all' || a.severity === filters.severity).length,
      statusDistribution: statusCounts
    });
    
    return filtered;
  };

  // Set up polling for real-time updates
  useEffect(() => {
    fetchAlerts();
    
    // Poll every 30 seconds for new alerts
    const interval = setInterval(fetchAlerts, 30000);
    
    return () => clearInterval(interval);
  }, []); // fetchAlerts is stable, no need to add to deps

  const filteredAlerts = getFilteredAlerts();
  
  // Pagination logic
  const indexOfLastAlert = currentPage * alertsPerPage;
  const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirstAlert, indexOfLastAlert);
  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="alerts-container" style={{ backgroundColor: '#F8F8F8', padding: '0.25rem', borderRadius: '8px' }}>
      {/* Stats Cards (compact, severity-colored) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {/* Critical */}
        <Card className="sidebar-card">
          <CardContent className="card-content-compact" style={{ padding: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700 }}>Critical</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#DC2626' }}>{stats.criticalCount}</div>
              </div>
              <IconComponent name="AlertTriangle" className="icon-small" style={{ color: '#DC2626' }} />
            </div>
          </CardContent>
        </Card>
        {/* High */}
        <Card className="sidebar-card">
          <CardContent className="card-content-compact" style={{ padding: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>High</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706' }}>{stats.highCount || 0}</div>
              </div>
              <IconComponent name="AlertTriangle" className="icon-small" style={{ color: '#D97706' }} />
            </div>
          </CardContent>
        </Card>
        {/* Medium (kept as-is tone) */}
        <Card className="sidebar-card">
          <CardContent className="card-content-compact" style={{ padding: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#CA8A04', fontWeight: 700 }}>Medium</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#CA8A04' }}>{stats.mediumCount || 0}</div>
              </div>
              <IconComponent name="AlertTriangle" className="icon-small" style={{ color: '#CA8A04' }} />
            </div>
          </CardContent>
        </Card>
        {/* Low */}
        <Card className="sidebar-card">
          <CardContent className="card-content-compact" style={{ padding: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>Low</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563EB' }}>{stats.lowCount || 0}</div>
              </div>
              <IconComponent name="AlertTriangle" className="icon-small" style={{ color: '#2563EB' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters (compact, no icon) */}
      <Card className="sidebar-card">
        <CardHeader className="card-header-compact" style={{ padding: '0.5rem 0.75rem' }}>
          <CardTitle className="card-title-small">Filters</CardTitle>
        </CardHeader>
        <CardContent className="card-content-compact" style={{ padding: '0.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label className="form-label">Severity</label>
              <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value as any }))}>
                <SelectTrigger className="select-input">
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div></div>
          </div>
        </CardContent>
      </Card>

                           

              {/* Alerts List */}
        <div className="users-table">
          {loading ? (
            <div className="loading-state">Loading security alerts...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : (
            <>
              <div className="table-body">
                {filteredAlerts.length === 0 ? (
                  <div className="no-results">
                    <IconComponent name="Shield" className="icon-small" style={{ marginBottom: '0.5rem' }} />
                    <p>No security alerts found. Try adjusting your filters.</p>
                  </div>
                ) : (
                                     currentAlerts.map(alert => (
                     <AlertCard 
                       key={alert.id}
                       alert={alert}
                       onAcknowledge={handleAcknowledge}
                       onResolve={handleResolve}
                       acknowledgeLoading={acknowledgeLoading}
                       resolveLoading={resolveLoading}
                     />
                   ))
                )}
              </div>
             
             {/* Pagination */}
             {filteredAlerts.length > 0 && (
               <div style={{ 
                 display: 'flex', 
                 justifyContent: 'space-between', 
                 alignItems: 'center', 
                 marginTop: '1rem',
                 padding: '1rem',
                 borderTop: '1px solid #E5E7EB'
               }}>
                 <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                   Showing {indexOfFirstAlert + 1} to {Math.min(indexOfLastAlert, filteredAlerts.length)} of {filteredAlerts.length} alerts
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
         )}
       </div>
    </div>
  );
};

export default SecurityAlerts; 