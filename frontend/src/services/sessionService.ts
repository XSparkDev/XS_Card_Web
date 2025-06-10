// Session Service - Dummy implementation for session management
// These endpoints will be implemented on the backend later

interface SessionData {
  userId: string;
  userRole: string;
  email: string;
  lastActivity: Date;
  ipAddress: string;
  deviceInfo: string;
}

interface SessionSummary {
  totalSessions: number;
  sessionsByRole: {
    Administrator: number;
    Manager: number;
    Employee: number;
  };
  activeSessions: SessionData[];
}

// Dummy data generator
const generateDummySessions = (): SessionData[] => {
  const roles = ['Administrator', 'Manager', 'Employee'];
  const sessions: SessionData[] = [];
  
  // Generate random sessions
  const adminCount = 2;
  const managerCount = 3;
  const employeeCount = 3;
  
  // Administrators
  for (let i = 0; i < adminCount; i++) {
    sessions.push({
      userId: `admin_${i + 1}`,
      userRole: 'Administrator',
      email: `admin${i + 1}@company.com`,
      lastActivity: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
      ipAddress: `192.168.1.${10 + i}`,
      deviceInfo: 'Chrome on Windows'
    });
  }
  
  // Managers
  for (let i = 0; i < managerCount; i++) {
    sessions.push({
      userId: `manager_${i + 1}`,
      userRole: 'Manager',
      email: `manager${i + 1}@company.com`,
      lastActivity: new Date(Date.now() - Math.random() * 3600000),
      ipAddress: `192.168.1.${20 + i}`,
      deviceInfo: 'Safari on macOS'
    });
  }
  
  // Employees
  for (let i = 0; i < employeeCount; i++) {
    sessions.push({
      userId: `employee_${i + 1}`,
      userRole: 'Employee',
      email: `employee${i + 1}@company.com`,
      lastActivity: new Date(Date.now() - Math.random() * 3600000),
      ipAddress: `192.168.1.${30 + i}`,
      deviceInfo: 'Firefox on Linux'
    });
  }
  
  return sessions;
};

// API Endpoints (to be implemented on backend)
export const sessionService = {
  // GET /api/sessions/active
  getActiveSessions: async (): Promise<SessionSummary> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const sessions = generateDummySessions();
    
    return {
      totalSessions: sessions.length,
      sessionsByRole: {
        Administrator: sessions.filter(s => s.userRole === 'Administrator').length,
        Manager: sessions.filter(s => s.userRole === 'Manager').length,
        Employee: sessions.filter(s => s.userRole === 'Employee').length,
      },
      activeSessions: sessions
    };
  },
  
  // POST /api/sessions/force-logout
  forceLogoutAllUsers: async (): Promise<{ success: boolean; message: string; loggedOutCount: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, this would:
    // 1. Revoke all Firebase refresh tokens
    // 2. Clear all active sessions in database
    // 3. Send real-time notification to all connected clients
    // 4. Create audit log entry
    
    const currentSessions = generateDummySessions();
    
    // Clear local storage to simulate logout
    localStorage.removeItem('sessionTimeout');
    
    return {
      success: true,
      message: 'All users have been logged out successfully',
      loggedOutCount: currentSessions.length
    };
  },
  
  // GET /api/sessions/timeout-settings
  getTimeoutSettings: async (): Promise<{ timeoutMinutes: number; concurrentSessions: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const savedTimeout = localStorage.getItem('sessionTimeout');
    const timeoutMap: { [key: string]: number } = {
      "15 minutes": 15,
      "1 hour": 60,
      "24 hours": 1440,
      "14 days": 20160,
    };
    
    return {
      timeoutMinutes: savedTimeout ? (timeoutMap[savedTimeout] || 30) : 30,
      concurrentSessions: 2
    };
  },
  
  // PUT /api/sessions/timeout-settings
  updateTimeoutSettings: async (settings: { 
    timeoutMinutes?: number; 
    concurrentSessions?: number 
  }): Promise<{ success: boolean }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // In real implementation, save to Firestore
    if (settings.timeoutMinutes) {
      const timeoutString = 
        settings.timeoutMinutes === 15 ? "15 minutes" :
        settings.timeoutMinutes === 60 ? "1 hour" :
        settings.timeoutMinutes === 1440 ? "24 hours" :
        settings.timeoutMinutes === 20160 ? "14 days" : "30 minutes";
      localStorage.setItem("sessionTimeout", timeoutString);
    }
    
    if (settings.concurrentSessions !== undefined) {
      localStorage.setItem("concurrentSessions", settings.concurrentSessions.toString());
    }
    
    return { success: true };
  },
  
  // POST /api/sessions/audit-log
  logSecurityAction: async (action: {
    type: 'FORCE_LOGOUT' | 'SETTINGS_CHANGE' | 'ROLE_CHANGE';
    description: string;
    metadata?: any;
  }): Promise<{ success: boolean }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In real implementation, save to audit log collection
    console.log('Security audit log:', action);
    
    return { success: true };
  }
}; 