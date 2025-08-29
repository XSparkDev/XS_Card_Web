import React, { useState, useEffect } from 'react';
import { Button } from '../UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/card';
import { buildEnterpriseUrl, getEnterpriseHeaders, ENDPOINTS } from '../../utils/api';

// Types
interface SecurityLog {
  id: string;
  action: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  timestamp: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  errorMessage?: string;
}

interface SecurityLogsResponse {
  status: boolean;
  data: {
    logs: SecurityLog[];
    totalCount: number;
    hasMore: boolean;
    lastDoc?: string;
  };
}

// Icon Component matching UserManagement style
type IconName = "Shield" | "Filter" | "Download" | "RefreshCw" | "CheckCircle" | "XCircle";

const IconComponent = ({ 
  name, 
  className = "", 
  ...props 
}: { 
  name: IconName; 
  className?: string; 
} & React.SVGProps<SVGSVGElement>) => {
  const icons = {
    Shield: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Filter: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    Download: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
    RefreshCw: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>,
    CheckCircle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m12 15 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>,
    XCircle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
  };
  
  return icons[name] || null;
};

// Log Row Component matching UserManagement table style
const LogRow = ({ log }: { log: SecurityLog }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="table-row">
      <div className="user-info">
        <div className="user-details">
          <div className="user-name">{log.action}</div>
          <div className="user-email">
            {log.userName ? `${log.userName} (${log.userEmail})` : 'System'}
          </div>
        </div>
      </div>
      
      <div className="user-meta">
        <div className="user-status">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {log.success ? (
              <IconComponent name="CheckCircle" className="icon-tiny mr-1" style={{ color: '#22c55e' }} />
            ) : (
              <IconComponent name="XCircle" className="icon-tiny mr-1" style={{ color: '#ef4444' }} />
            )}
            <span style={{ color: log.success ? '#22c55e' : '#ef4444', fontSize: '0.875rem' }}>
              {log.success ? 'Success' : 'Error'}
            </span>
          </div>
          <div className="last-active">
            {formatTimestamp(log.timestamp)}
          </div>
        </div>
        
        <div className="user-role">
          <div className="role-title">{log.ipAddress || '-'}</div>
        </div>
      </div>
    </div>
  );
};

// Main Security Logs Component
const SecurityLogs = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filters, setFilters] = useState({
    action: 'all',
    success: 'all'
  });

  // Fetch logs from backend
  const fetchLogs = async () => {
    try {
      const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_SECURITY_LOGS);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: SecurityLogsResponse = await response.json();
      setLogs(data.data.logs);
      setError(null);
    } catch (err) {
      console.error('Error fetching security logs:', err);
      setError('Failed to load security logs');
    } finally {
      setLoading(false);
    }
  };

  // Export logs
  const handleExport = async () => {
    try {
      const url = buildEnterpriseUrl('/api/enterprise/:enterpriseId/security/logs/export');
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url2 = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url2;
      a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url2);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting logs:', err);
      alert('Failed to export logs');
    }
  };

  // Filter logs based on current filters
  const getFilteredLogs = () => {
    return logs.filter(log => {
      const searchMatch = !searchTerm || 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const actionMatch = filters.action === 'all' || log.action === filters.action;
      const successMatch = filters.success === 'all' || 
        (filters.success === 'success' && log.success) ||
        (filters.success === 'error' && !log.success);
      
      return searchMatch && actionMatch && successMatch;
    });
  };

  // Set up polling for real-time updates
  useEffect(() => {
    fetchLogs();
    
    // Poll every 30 seconds for new logs
    const interval = setInterval(fetchLogs, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = getFilteredLogs();

  return (
    <div className="alerts-container">
      {/* Search and Filters */}
      <Card className="sidebar-card">
        <CardHeader className="card-header-compact">
          <CardTitle className="card-title-small">
            <IconComponent name="Filter" className="icon-small mr-2" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-compact">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Search */}
            <div>
              <label className="form-label">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="select-input"
              />
            </div>
        
            {/* Date Range */}
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="select-input"
              />
            </div>
        
            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="select-input"
              />
            </div>
        
            {/* Action Filter */}
            <div>
              <label className="form-label">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="select-input"
              >
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        
          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                name="status"
                value="all"
                checked={filters.success === 'all'}
                onChange={(e) => setFilters(prev => ({ ...prev, success: e.target.value }))}
                style={{ marginRight: '0.5rem' }}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>All Status</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                name="status"
                value="success"
                checked={filters.success === 'success'}
                onChange={(e) => setFilters(prev => ({ ...prev, success: e.target.value }))}
                style={{ marginRight: '0.5rem' }}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>Success</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                name="status"
                value="error"
                checked={filters.success === 'error'}
                onChange={(e) => setFilters(prev => ({ ...prev, success: e.target.value }))}
                style={{ marginRight: '0.5rem' }}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>Errors</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="sidebar-card">
        <CardContent className="card-content-compact">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              onClick={fetchLogs}
              variant="outline"
              className="action-button-small"
            >
              <IconComponent name="RefreshCw" className="icon-tiny mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="action-button-small"
            >
              <IconComponent name="Download" className="icon-tiny mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <div className="users-table">
        {loading ? (
          <div className="loading-state">Loading security logs...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <>
            <div className="table-header">
              <div className="select-label">
                {filteredLogs.length > 0 ? `${filteredLogs.length} security logs` : "No logs found"}
              </div>
            </div>
            
            <div className="table-body">
              {filteredLogs.length === 0 ? (
                <div className="no-results">
                  <IconComponent name="Shield" className="icon-small" style={{ marginBottom: '0.5rem' }} />
                  <p>No security logs found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                filteredLogs.map(log => (
                  <LogRow key={log.id} log={log} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SecurityLogs;