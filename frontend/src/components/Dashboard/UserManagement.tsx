import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "../UI/card";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../UI/dialog";
import { Badge } from "../UI/badge";
import { Checkbox } from "../UI/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/UI/dropdown-menu";
import "../../styles/UserManagement.css";

// Define a type for icon names
type IconName = 
  | "Search"
  | "UserPlus" 
  | "MoreVertical" 
  | "UserCheck"
  | "UserX"
  | "Mail"
  | "Shield"
  | "Clock"
  | "RefreshCw"
  | "Filter"
  | "Download"
  | "AlertTriangle"
  | "LogOut";

// Custom icons to replace lucide-react
const IconComponent = ({ 
  name, 
  className = "", 
  ...props 
}: { 
  name: IconName; 
  className?: string; 
} & React.SVGProps<SVGSVGElement>) => {
  const icons = {
    Search: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    UserPlus: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>,
    MoreVertical: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
    UserCheck: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
    UserX: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>,
    Mail: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
    Shield: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Clock: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    RefreshCw: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>,
    Filter: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    Download: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
    AlertTriangle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>,
    LogOut: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
  };

  return icons[name] || null;
};

// Mock user data
const mockUsers = [
  // Keep your existing mock data
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@xscard.com",
    role: "Administrator",
    department: "Executive",
    status: "Active",
    lastActive: "Today, 10:23 AM",
  },
  // ...rest of your mock data
];

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Keep all your existing functions and state handlers

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleUserSelection = (id: number) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Inactive": return "secondary";
      case "Pending": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-description">Manage users and their permissions</p>
        </div>
        <Button onClick={() => setIsAddUserOpen(true)} className="add-user-button">
          <IconComponent name="UserPlus" className="icon-small mr-2" />
          Add User
        </Button>
      </div>

      <div className="user-management-layout">
        {/* Sidebar */}
        <div className="user-management-sidebar">
          <div className="search-container">
            <IconComponent name="Search" className="search-icon" />
            <Input
              placeholder="Search users..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Quick Filters Card */}
          <Card className="sidebar-card">
            <CardHeader className="card-header-compact">
              <CardTitle className="card-title-small">Quick Filters</CardTitle>
            </CardHeader>
            <CardContent className="card-content-compact">
              <button className="filter-button filter-active">All Users (6)</button>
              <button className="filter-button">Administrators (1)</button>
              <button className="filter-button">Managers (2)</button>
              <button className="filter-button">Regular Employees (3)</button>
              <hr className="divider" />
              <button className="filter-button">Active (5)</button>
              <button className="filter-button">Inactive (1)</button>
              <button className="filter-button">Pending Activation (1)</button>
            </CardContent>
          </Card>
          
          {/* Bulk Actions Card */}
          <Card className="sidebar-card">
            <CardHeader className="card-header-compact">
              <CardTitle className="card-title-small">Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent className="card-content-compact">
              <Button 
                variant="outline" 
                className="action-button"
                disabled={selectedUsers.length === 0}
              >
                <IconComponent name="Mail" className="icon-small mr-2" />
                Send Email
              </Button>
              <Button 
                variant="outline" 
                className="action-button"
                disabled={selectedUsers.length === 0}
              >
                <IconComponent name="Shield" className="icon-small mr-2" />
                Change Role
              </Button>
              <Button 
                variant="outline" 
                className="action-button"
                disabled={selectedUsers.length === 0}
              >
                <IconComponent name="RefreshCw" className="icon-small mr-2" />
                Reset Password
              </Button>
              <Button 
                variant="outline" 
                className="action-button action-destructive"
                disabled={selectedUsers.length === 0}
              >
                <IconComponent name="UserX" className="icon-small mr-2" />
                Deactivate
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="user-management-content">
          {/* User Accounts Card */}
          <Card className="content-card">
            <CardHeader className="card-header">
              <div className="card-header-content">
                <CardTitle>User Accounts</CardTitle>
                <div className="card-actions">
                  <Button variant="outline" size="sm" className="action-button-small">
                    <IconComponent name="Filter" className="icon-tiny mr-2" />
                    Filters
                  </Button>
                  <Button variant="outline" size="sm" className="action-button-small">
                    <IconComponent name="Download" className="icon-tiny mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="card-content">
              <div className="users-table">
                <div className="table-header">
                  <div className="select-all">
                    <Checkbox 
                      id="selectAll" 
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="selectAll" className="select-label">
                      {selectedUsers.length > 0 ? `${selectedUsers.length} selected` : "Select all"}
                    </label>
                  </div>
                </div>
                
                <div className="table-body">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="table-row">
                      <div className="user-info">
                        <Checkbox 
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)} 
                        />
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                      
                      <div className="user-meta">
                        <div className="user-status">
                          <Badge variant={getBadgeVariant(user.status)}>{user.status}</Badge>
                          <div className="last-active">
                            <IconComponent name="Clock" className="icon-tiny mr-1" />
                            {user.lastActive}
                          </div>
                        </div>
                        
                        <div className="user-role">
                          <div className="role-title">{user.role}</div>
                          <div className="department">{user.department}</div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="icon-button">
                              <IconComponent name="MoreVertical" className="icon-small" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <IconComponent name="UserCheck" className="icon-small mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <IconComponent name="Shield" className="icon-small mr-2" />
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <IconComponent name="Mail" className="icon-small mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <IconComponent name="RefreshCw" className="icon-small mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="dropdown-destructive">
                              <IconComponent name="UserX" className="icon-small mr-2" />
                              Deactivate Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="no-results">
                      <p>No users found. Try adjusting your search.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="card-footer">
              <div className="pagination-info">
                Showing {filteredUsers.length} of {mockUsers.length} users
              </div>
              <div className="pagination-controls">
                <Button variant="outline" size="sm" disabled className="pagination-button">
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled className="pagination-button">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* Security Alerts Card */}
          <Card className="content-card">
            <CardHeader className="card-header">
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Users requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              <div className="alerts-container">
                <div className="alert alert-warning">
                  <IconComponent name="AlertTriangle" className="alert-icon" />
                  <div className="alert-content">
                    <h4 className="alert-title">Inactive Admin Account</h4>
                    <p className="alert-description">Emily Davis has admin privileges but hasn't logged in for over 30 days</p>
                    <Button size="sm" variant="outline" className="alert-action">Review Account</Button>
                  </div>
                </div>
                
                <div className="alert alert-danger">
                  <IconComponent name="LogOut" className="alert-icon" />
                  <div className="alert-content">
                    <h4 className="alert-title">Failed Login Attempts</h4>
                    <p className="alert-description">Multiple failed login attempts for account: michael.brown@xscard.com</p>
                    <Button size="sm" variant="outline" className="alert-action">View Details</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account for XSCard system.
            </DialogDescription>
          </DialogHeader>
          <div className="dialog-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <Input id="firstName" placeholder="First name" />
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <Input id="lastName" placeholder="Last name" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <Input id="email" placeholder="Email address" type="email" />
            </div>
            <div className="form-group">
              <label htmlFor="role" className="form-label">Role</label>
              <select id="role" className="select-input">
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="department" className="form-label">Department</label>
              <select id="department" className="select-input">
                <option value="executive">Executive</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="product">Product</option>
                <option value="engineering">Engineering</option>
                <option value="support">Customer Support</option>
              </select>
            </div>
            <div className="checkbox-group">
              <Checkbox id="sendInvite" />
              <label htmlFor="sendInvite" className="checkbox-label">
                Send invitation email
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsAddUserOpen(false)}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
