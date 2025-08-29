# Security Feature API Endpoints Documentation

This document outlines all API endpoints used in the Security feature implementation. All endpoints currently use dummy data and need to be implemented on the backend.

## Session Management Endpoints

### 1. Get Active Sessions
- **Endpoint**: `GET /api/sessions/active`
- **Description**: Retrieves all currently active user sessions
- **Response**:
  ```json
  {
    "totalSessions": 8,
    "sessionsByRole": {
      "Administrator": 2,
      "Manager": 3,
      "Employee": 3
    },
    "activeSessions": [
      {
        "userId": "string",
        "userRole": "string",
        "email": "string",
        "lastActivity": "Date",
        "ipAddress": "string",
        "deviceInfo": "string"
      }
    ]
  }
  ```

### 2. Force Logout All Users
- **Endpoint**: `POST /api/sessions/force-logout`
- **Description**: Immediately terminates all active user sessions
- **Response**:
  ```json
  {
    "success": true,
    "message": "All users have been logged out successfully",
    "loggedOutCount": 8
  }
  ```
- **Actions**:
  - Revoke all Firebase refresh tokens
  - Clear all active sessions in database
  - Send real-time notification to connected clients
  - Create audit log entry

### 3. Get Timeout Settings
- **Endpoint**: `GET /api/sessions/timeout-settings`
- **Description**: Retrieves current session timeout configuration
- **Response**:
  ```json
  {
    "timeoutMinutes": 30,
    "concurrentSessions": 2
  }
  ```

### 4. Update Timeout Settings
- **Endpoint**: `PUT /api/sessions/timeout-settings`
- **Description**: Updates session timeout configuration
- **Request Body**:
  ```json
  {
    "timeoutMinutes": 60,
    "concurrentSessions": 3
  }
  ```
- **Response**:
  ```json
  {
    "success": true
  }
  ```

### 5. Log Security Action
- **Endpoint**: `POST /api/sessions/audit-log`
- **Description**: Records security-related actions in audit log
- **Request Body**:
  ```json
  {
    "type": "FORCE_LOGOUT | SETTINGS_CHANGE | ROLE_CHANGE",
    "description": "string",
    "metadata": {}
  }
  ```
- **Response**:
  ```json
  {
    "success": true
  }
  ```

## Role Management Endpoints

### 1. Get All Roles
- **Endpoint**: `GET /api/roles`
- **Description**: Retrieves all system roles with permissions
- **Response**:
  ```json
  {
    "roles": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "userCount": 0,
        "permissions": {
          "viewCards": true,
          "createCards": true,
          "editCards": true,
          "deleteCards": true,
          "manageUsers": true,
          "viewReports": true,
          "systemSettings": true,
          "auditLogs": true
        },
        "createdAt": "Date",
        "updatedAt": "Date"
      }
    ],
    "totalUsers": 55
  }
  ```

### 2. Get Single Role
- **Endpoint**: `GET /api/roles/:roleId`
- **Description**: Retrieves details of a specific role
- **Response**: Single role object (same structure as above)

### 3. Update Role
- **Endpoint**: `PUT /api/roles/:roleId`
- **Description**: Updates role permissions or details
- **Request Body**: Partial role object with fields to update
- **Response**: Updated role object

### 4. Get Role Users
- **Endpoint**: `GET /api/roles/:roleId/users`
- **Description**: Retrieves all users assigned to a specific role
- **Response**:
  ```json
  {
    "users": [
      {
        "id": "string",
        "email": "string",
        "name": "string",
        "role": "string",
        "lastActive": "Date"
      }
    ],
    "count": 12
  }
  ```

### 5. Assign User to Role
- **Endpoint**: `POST /api/roles/:roleId/users/:userId`
- **Description**: Assigns a user to a specific role
- **Response**:
  ```json
  {
    "success": true
  }
  ```

### 6. Remove User from Role
- **Endpoint**: `DELETE /api/roles/:roleId/users/:userId`
- **Description**: Removes a user from a specific role
- **Response**:
  ```json
  {
    "success": true
  }
  ```

## Implementation Status

### Completed Features:
- ✅ Role-Based Access Control UI
- ✅ Manage Roles Modal with permissions display
- ✅ Session Management UI
- ✅ Session Timeout configuration (15 min, 1 hour, 24 hours, 14 days)
- ✅ Force Logout functionality
- ✅ Active Sessions display with role breakdown
- ✅ Session Timeout Hook with activity tracking
- ✅ Session Timeout Warning Modal
- ✅ SessionTimeoutProvider context
- ✅ Dummy API service implementations

### Backend Requirements:
1. **Firebase Integration**:
   - Implement token validation for session counting
   - Implement refresh token revocation for force logout
   - Add Firebase Admin SDK for user management

2. **Firestore Collections Needed**:
   - `roles` - Store role definitions and permissions
   - `users` - Add role assignment field
   - `settings` - Store system-wide settings (timeout, etc.)
   - `auditLogs` - Store security action logs
   - `sessions` - Track active user sessions (optional for better accuracy)

3. **Real-time Updates**:
   - WebSocket or Firebase Realtime Database for force logout notifications
   - Session count updates

4. **Security Considerations**:
   - Role changes should require admin privileges
   - Force logout should be restricted to administrators
   - Audit all security-related actions
   - Implement rate limiting on sensitive endpoints 