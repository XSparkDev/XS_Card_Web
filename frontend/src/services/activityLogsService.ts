import { buildEnterpriseUrl, getEnterpriseHeaders } from '../utils/api';

// Types for Activity Logs
export interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  userId: string;
  status: 'success' | 'error';
  timestamp: string;
  details: {
    operation?: string;
    error?: string;
    ipAddress?: string;
    userAgent?: string;
    attemptNumber?: number;
    location?: string;
    [key: string]: any;
  };
  enterpriseId: string;
}

export interface ActivityLogsResponse {
  status: boolean;
  data: {
    logs: ActivityLog[];
    totalCount: number;
    hasMore: boolean;
    lastTimestamp: string;
    filters: {
      timeframe: string;
      userId: string | null;
      action: string | null;
      resource: string | null;
      search: string | null;
      success: boolean | null;
    };
    meta: {
      enterpriseUserCount: number;
      timeRange: {
        start: string;
        end: string;
      };
    };
  };
}

export interface ActivityLogsFilters {
  timeframe?: string;
  limit?: number;
  userId?: string;
  action?: string;
  resource?: string;
  search?: string;
  success?: boolean;
  startAfter?: string;
}

// Activity Logs Service
export class ActivityLogsService {
  private static instance: ActivityLogsService;
  private enterpriseId: string = 'x-spark-test';

  private constructor() {}

  public static getInstance(): ActivityLogsService {
    if (!ActivityLogsService.instance) {
      ActivityLogsService.instance = new ActivityLogsService();
    }
    return ActivityLogsService.instance;
  }

  public setEnterpriseId(enterpriseId: string): void {
    this.enterpriseId = enterpriseId;
  }

  public async getActivityLogs(filters: ActivityLogsFilters = {}): Promise<ActivityLogsResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query parameters
      if (filters.timeframe) params.append('timeframe', filters.timeframe);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.resource) params.append('resource', filters.resource);
      if (filters.search) params.append('search', filters.search);
      if (filters.success !== undefined) params.append('success', filters.success.toString());
      if (filters.startAfter) params.append('startAfter', filters.startAfter);

      const url = buildEnterpriseUrl(`/enterprise/${this.enterpriseId}/security/logs`);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(`${url}?${params}`, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ActivityLogsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  public async getActivityLogsWithPagination(
    filters: ActivityLogsFilters = {},
    startAfter?: string
  ): Promise<ActivityLogsResponse> {
    return this.getActivityLogs({
      ...filters,
      startAfter
    });
  }

  public async getAllActivityLogs(filters: ActivityLogsFilters = {}): Promise<ActivityLog[]> {
    const allLogs: ActivityLog[] = [];
    let hasMore = true;
    let startAfter: string | undefined = undefined;

    while (hasMore) {
      const response = await this.getActivityLogsWithPagination(filters, startAfter);
      
      if (response.status && response.data) {
        allLogs.push(...response.data.logs);
        hasMore = response.data.hasMore;
        startAfter = response.data.lastTimestamp;
      } else {
        hasMore = false;
      }
    }

    return allLogs;
  }

  // Helper method to get logs for specific timeframes
  public async getRecentLogs(hours: number = 24): Promise<ActivityLog[]> {
    const timeframe = hours <= 24 ? '24h' : hours <= 168 ? '7d' : '30d';
    const response = await this.getActivityLogs({ timeframe, limit: 100 });
    return response.status ? response.data.logs : [];
  }

  // Helper method to get failed login attempts
  public async getFailedLogins(timeframe: string = '24h'): Promise<ActivityLog[]> {
    const response = await this.getActivityLogs({
      action: 'login',
      success: false,
      timeframe
    });
    return response.status ? response.data.logs : [];
  }

  // Helper method to get user-specific activity
  public async getUserActivity(userId: string, timeframe: string = '7d'): Promise<ActivityLog[]> {
    const response = await this.getActivityLogs({
      userId,
      timeframe
    });
    return response.status ? response.data.logs : [];
  }

  // Helper method to search logs
  public async searchLogs(searchTerm: string, timeframe: string = '7d'): Promise<ActivityLog[]> {
    const response = await this.getActivityLogs({
      search: searchTerm,
      timeframe
    });
    return response.status ? response.data.logs : [];
  }

  // Helper method to get system errors
  public async getSystemErrors(timeframe: string = '24h'): Promise<ActivityLog[]> {
    const response = await this.getActivityLogs({
      resource: 'system',
      success: false,
      timeframe
    });
    return response.status ? response.data.logs : [];
  }
}

// Export singleton instance
export const activityLogsService = ActivityLogsService.getInstance(); 