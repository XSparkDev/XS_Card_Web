// Roles Service - Dummy implementation for role management
// These endpoints will be implemented on the backend later

export interface Permission {
  viewCards: boolean;
  createCards: boolean;
  editCards: boolean;
  deleteCards: boolean;
  manageUsers: boolean;
  viewReports: boolean;
  systemSettings: boolean;
  auditLogs: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: Permission;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleSummary {
  roles: Role[];
  totalUsers: number;
}

// Dummy data
const defaultRoles: Role[] = [
  {
    id: 'admin_role',
    name: 'Administrator',
    description: 'Full system access and permissions',
    userCount: 5,
    permissions: {
      viewCards: true,
      createCards: true,
      editCards: true,
      deleteCards: true,
      manageUsers: true,
      viewReports: true,
      systemSettings: true,
      auditLogs: true,
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 'manager_role',
    name: 'Manager',
    description: 'Can manage cards and departments',
    userCount: 12,
    permissions: {
      viewCards: true,
      createCards: true,
      editCards: true,
      deleteCards: false,
      manageUsers: false,
      viewReports: true,
      systemSettings: false,
      auditLogs: false,
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 'employee_role',
    name: 'Employee',
    description: 'View only their own cards',
    userCount: 38,
    permissions: {
      viewCards: true,
      createCards: false,
      editCards: false,
      deleteCards: false,
      manageUsers: false,
      viewReports: false,
      systemSettings: false,
      auditLogs: false,
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];

// API Endpoints (to be implemented on backend)
export const rolesService = {
  // GET /api/roles
  getRoles: async (): Promise<RoleSummary> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const roles = [...defaultRoles];
    const totalUsers = roles.reduce((sum, role) => sum + role.userCount, 0);
    
    return {
      roles,
      totalUsers,
    };
  },
  
  // GET /api/roles/:roleId
  getRole: async (roleId: string): Promise<Role> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const role = defaultRoles.find(r => r.id === roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    
    return role;
  },
  
  // PUT /api/roles/:roleId
  updateRole: async (roleId: string, updates: Partial<Role>): Promise<Role> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const roleIndex = defaultRoles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }
    
    // In real implementation, this would update Firestore
    const updatedRole = {
      ...defaultRoles[roleIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    defaultRoles[roleIndex] = updatedRole;
    
    return updatedRole;
  },
  
  // GET /api/roles/:roleId/users
  getRoleUsers: async (roleId: string): Promise<{ users: any[]; count: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const role = defaultRoles.find(r => r.id === roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    
    // In real implementation, this would fetch actual users
    const dummyUsers = Array.from({ length: role.userCount }, (_, i) => ({
      id: `user_${roleId}_${i}`,
      email: `user${i}@company.com`,
      name: `User ${i + 1}`,
      role: role.name,
      lastActive: new Date(Date.now() - Math.random() * 86400000),
    }));
    
    return {
      users: dummyUsers,
      count: dummyUsers.length,
    };
  },
  
  // POST /api/roles/:roleId/users/:userId
  assignUserToRole: async (roleId: string, _userId: string): Promise<{ success: boolean }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const role = defaultRoles.find(r => r.id === roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    
    // In real implementation, this would update user's role in Firestore
    role.userCount += 1;
    
    return { success: true };
  },
  
  // DELETE /api/roles/:roleId/users/:userId
  removeUserFromRole: async (roleId: string, _userId: string): Promise<{ success: boolean }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const role = defaultRoles.find(r => r.id === roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    
    // In real implementation, this would update user's role in Firestore
    role.userCount = Math.max(0, role.userCount - 1);
    
    return { success: true };
  },
}; 