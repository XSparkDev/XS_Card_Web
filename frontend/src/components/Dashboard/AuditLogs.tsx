import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/card';
import { Button } from '../UI/button';
import { activityLogsService, ActivityLog, ActivityLogsFilters } from '../../services/activityLogsService';

// Icon Component
type IconName = "AlertTriangle" | "Shield" | "Clock" | "Eye" | "CheckCircle" | "Filter" | "Users" | "LogIn" | "MapPin" | "Lock" | "FileText" | "Search" | "Download" | "RefreshCw" | "X" | "Check" | "XCircle";

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
    Lock: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    FileText: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>,
    Search: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    Download: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
    RefreshCw: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>,
    X: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
    Check: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polyline points="20 6 9 17 4 12"/></svg>,
    XCircle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
  };

  return icons[name] || null;
};

// Simplified Log Item Component
const LogItem = ({ log }: { log: ActivityLog }) => {
  const formatTimestamp = (timestamp: string) => {
    try {
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
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getActionIcon = (action: string) => {
    switch(action?.toLowerCase()) {
      case 'login':
      case 'logout':
        return 'LogIn';
      case 'create':
        return 'FileText';
      case 'update':
        return 'Check';
      case 'delete':
        return 'X';
      case 'export':
        return 'Download';
      case 'error':
        return 'XCircle';
      default:
        return 'FileText';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? '#16a34a' : '#dc2626';
  };

  const getResourceColor = (resource: string) => {
    const colors: { [key: string]: string } = {
      user: '#3b82f6',
      card: '#8b5cf6',
      contact: '#06b6d4',
      system: '#f59e0b',
      department: '#10b981',
      team: '#ef4444',
      meeting: '#8b5cf6',
      subscription: '#f97316',
      payment: '#84cc16',
      email: '#06b6d4'
    };
    return colors[resource] || '#6b7280';
  };

  // Safe access to log properties
  const safeLog = {
    id: log?.id || 'unknown',
    action: log?.action || 'unknown',
    resource: log?.resource || 'unknown',
    userId: log?.userId || 'unknown',
    status: log?.status || 'unknown',
    timestamp: log?.timestamp || new Date().toISOString(),
    details: log?.details || {},
    enterpriseId: log?.enterpriseId || 'unknown'
  };

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px', 
      padding: '1rem', 
      marginBottom: '0.75rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
          {/* Log Icon */}
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginRight: '1rem',
            color: getResourceColor(safeLog.resource)
          }}>
            <IconComponent name={getActionIcon(safeLog.action)} className="icon-small" />
          </div>
          
          {/* Log Content */}
          <div style={{ flex: 1 }}>
            {/* Action and Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: '#1f2937', 
                margin: 0,
                textTransform: 'capitalize'
              }}>
                {safeLog.action}
              </h3>
              
              {/* Status Badge */}
              <span style={{
                backgroundColor: safeLog.status === 'success' ? '#dcfce7' : '#fee2e2',
                color: getStatusColor(safeLog.status),
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '500',
                textTransform: 'uppercase'
              }}>
                {safeLog.status}
              </span>
              
              {/* Resource Badge */}
              <span style={{
                backgroundColor: '#f3f4f6',
                color: getResourceColor(safeLog.resource),
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {safeLog.resource}
              </span>
            </div>
            
            {/* Details */}
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#374151', 
              margin: '0 0 0.5rem 0',
              lineHeight: '1.4'
            }}>
              {safeLog.details.operation || safeLog.details.error || `${safeLog.action} operation on ${safeLog.resource}`}
            </div>
            
            {/* Metadata */}
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <span>User: {safeLog.userId}</span>
              <span>Time: {formatTimestamp(safeLog.timestamp)}</span>
              {safeLog.details.ipAddress && (
                <span>IP: {safeLog.details.ipAddress}</span>
              )}
              {safeLog.details.location && (
                <span>Location: {safeLog.details.location}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified Filter Component
const LogFilters = ({ 
  filters, 
  onFiltersChange 
}: { 
  filters: ActivityLogsFilters; 
  onFiltersChange: (filters: ActivityLogsFilters) => void;
}) => {
  const handleFilterChange = (key: keyof ActivityLogsFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card className="sidebar-card">
      <CardHeader className="card-header-compact">
        <CardTitle className="card-title-small">
          <IconComponent name="Filter" className="icon-small mr-2" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="card-content-compact">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Time Range Filter */}
          <div>
            <label className="form-label">Time Range</label>
            <select 
              value={filters.timeframe || '24h'} 
              onChange={(e) => handleFilterChange('timeframe', e.target.value)}
              className="select-input"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="form-label">Action</label>
            <select 
              value={filters.action || ''} 
              onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
              className="select-input"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="export">Export</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Resource Filter */}
          <div>
            <label className="form-label">Resource</label>
            <select 
              value={filters.resource || ''} 
              onChange={(e) => handleFilterChange('resource', e.target.value || undefined)}
              className="select-input"
            >
              <option value="">All Resources</option>
              <option value="user">User</option>
              <option value="card">Card</option>
              <option value="contact">Contact</option>
              <option value="department">Department</option>
              <option value="team">Team</option>
              <option value="system">System</option>
              <option value="meeting">Meeting</option>
              <option value="subscription">Subscription</option>
              <option value="payment">Payment</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* Success Status Filter */}
          <div>
            <label className="form-label">Status</label>
            <select 
              value={filters.success === undefined ? '' : filters.success ? 'true' : 'false'} 
              onChange={(e) => handleFilterChange('success', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="select-input"
            >
              <option value="">All Status</option>
              <option value="true">Success</option>
              <option value="false">Error</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="form-label">Search</label>
            <div style={{ position: 'relative' }}>
              <IconComponent 
                name="Search" 
                className="icon-small" 
                style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#6b7280' 
                }} 
              />
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Activity Logs Component with better error handling
const AuditLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCount: 0,
    successCount: 0,
    errorCount: 0,
    userCount: 0
  });
  const [filters, setFilters] = useState<ActivityLogsFilters>({
    timeframe: '24h',
    limit: 10,  // Set to 10 for pagination
    action: undefined,
    resource: undefined,
    search: undefined,
    success: undefined
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10); // Fixed at 10
  const [paginationLoading, setPaginationLoading] = useState(false);

  // Fetch logs with current filters and pagination
  const fetchLogs = useCallback(async (page: number = 1, resetLogs: boolean = true) => {
    try {
      if (resetLogs) {
        setLoading(true);
      } else {
        setPaginationLoading(true);
      }
      setError(null);
      
      console.log('Fetching logs with filters:', filters, 'Page:', page);
      
      const response = await activityLogsService.getActivityLogs({
        ...filters,
        limit: itemsPerPage,
        startAfter: page > 1 && lastTimestamp ? lastTimestamp : undefined
      });
      
      console.log('API Response:', response);
      
      if (response.status && response.data) {
        const logsData = response.data.logs || [];
        console.log('Logs data:', logsData);
        
        if (resetLogs || page === 1) {
          setLogs(logsData);
        } else {
          setLogs(prev => [...prev, ...logsData]);
        }
        
        setLastTimestamp(response.data.lastTimestamp || null);
        
        // Calculate pagination
        const totalCount = response.data.totalCount || 0;
        const calculatedTotalPages = Math.ceil(totalCount / itemsPerPage);
        setTotalPages(calculatedTotalPages);
        
        // Calculate stats from current page data
        const successCount = logsData.filter(log => log.status === 'success').length;
        const errorCount = logsData.filter(log => log.status === 'error').length;
        const uniqueUsers = new Set(logsData.map(log => log.userId)).size;
        
        setStats({
          totalCount,
          successCount,
          errorCount,
          userCount: uniqueUsers
        });
      } else {
        console.error('Invalid response format:', response);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }, [filters, itemsPerPage, lastTimestamp]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && !loading && !paginationLoading) {
      setCurrentPage(page);
      fetchLogs(page, true);
    }
  }, [totalPages, loading, paginationLoading, fetchLogs]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    // This function is no longer needed as itemsPerPage is fixed
  }, []);

  // Refresh logs
  const refreshLogs = useCallback(() => {
    setCurrentPage(1);
    fetchLogs(1, true);
  }, [fetchLogs]);

  // Export logs
  const exportLogs = useCallback(() => {
    if (logs.length === 0) return;
    
    const csvContent = [
      ['Action', 'Resource', 'User ID', 'Status', 'Timestamp', 'Details'],
      ...logs.map(log => [
        log.action,
        log.resource,
        log.userId,
        log.status,
        new Date(log.timestamp).toISOString(),
        JSON.stringify(log.details)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [logs]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: ActivityLogsFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // Initial load
  useEffect(() => {
    fetchLogs(1, true);
  }, [fetchLogs]);

  // Handle filter changes
  useEffect(() => {
    if (currentPage === 1) {
      fetchLogs(1, true);
    } else {
      setCurrentPage(1);
    }
  }, [filters, fetchLogs, currentPage]);

  // Debug logging
  useEffect(() => {
    console.log('ActivityLogs component mounted');
    console.log('Current logs:', logs);
    console.log('Current loading:', loading);
    console.log('Current error:', error);
  }, [logs, loading, error]);

  return (
    <div className="activity-logs-container" style={{ backgroundColor: '#f8f8f8', padding: '1rem', borderRadius: '8px', minHeight: '400px' }}>
      {/* Debug Info */}
      <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '0.75rem' }}>
        <strong>Debug:</strong> Logs: {logs.length}, Loading: {loading.toString()}, Error: {error || 'none'}, Page: {currentPage}/{totalPages}
      </div>
      
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <Card className="sidebar-card">
          <CardContent className="card-content-compact">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Total</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{stats.totalCount}</div>
              </div>
              <IconComponent name="FileText" className="icon-small" style={{ color: '#6b7280' }} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sidebar-card">
          <CardContent className="card-content-compact">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '500' }}>Success</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>{stats.successCount}</div>
              </div>
              <IconComponent name="CheckCircle" className="icon-small" style={{ color: '#16a34a' }} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sidebar-card">
          <CardContent className="card-content-compact">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '500' }}>Errors</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.errorCount}</div>
              </div>
              <IconComponent name="AlertTriangle" className="icon-small" style={{ color: '#dc2626' }} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sidebar-card">
          <CardContent className="card-content-compact">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '500' }}>Users</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.userCount}</div>
              </div>
              <IconComponent name="Users" className="icon-small" style={{ color: '#3b82f6' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <LogFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Actions and Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshLogs}
            disabled={loading || paginationLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <IconComponent name="RefreshCw" className="icon-small" />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportLogs}
            disabled={logs.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <IconComponent name="Download" className="icon-small" />
            Export CSV
          </Button>
        </div>

        {/* Items Per Page Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label className="form-label" style={{ margin: 0, fontSize: '0.875rem' }}>Items per page:</label>
          <select 
            value={itemsPerPage} 
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="select-input"
            style={{ width: 'auto', minWidth: '80px' }}
            disabled={loading || paginationLoading}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="logs-list">
        {loading && logs.length === 0 ? (
          <div className="loading-state">Loading activity logs...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : logs.length === 0 ? (
          <div className="no-results">
            <IconComponent name="FileText" className="icon-small" style={{ marginBottom: '0.5rem' }} />
            <p>No activity logs found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            {logs.map((log, index) => (
              <LogItem key={log.id || index} log={log} />
            ))}
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          {/* Pagination Info */}
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, stats.totalCount)} of {stats.totalCount} logs
          </div>
          
          {/* Pagination Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || paginationLoading}
              style={{ padding: '0.5rem 0.75rem' }}
            >
              «
            </Button>
            
            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || paginationLoading}
              style={{ padding: '0.5rem 0.75rem' }}
            >
              ‹
            </Button>
            
            {/* Page Numbers */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {(() => {
                const pages = [];
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, currentPage + 2);
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={i === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i)}
                      disabled={paginationLoading}
                      style={{ 
                        padding: '0.5rem 0.75rem',
                        backgroundColor: i === currentPage ? '#3b82f6' : 'transparent',
                        color: i === currentPage ? 'white' : '#374151',
                        border: i === currentPage ? '1px solid #3b82f6' : '1px solid #d1d5db'
                      }}
                    >
                      {i}
                    </Button>
                  );
                }
                return pages;
              })()}
            </div>
            
            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || paginationLoading}
              style={{ padding: '0.5rem 0.75rem' }}
            >
              ›
            </Button>
            
            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || paginationLoading}
              style={{ padding: '0.5rem 0.75rem' }}
            >
              »
            </Button>
          </div>
          
          {/* Loading indicator */}
          {paginationLoading && (
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Loading...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogs; 