import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, UserPermissions, UserRole } from '../../contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof UserPermissions;
  requiredRole?: UserRole | UserRole[];
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallbackPath = '/business-cards',
  showUnauthorized = false
}) => {
  const { user, hasPermission, isRole, loading } = useUser();

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ color: '#6b7280' }}>Loading...</span>
      </div>
    );
  }

  // If no user is found, redirect to login or fallback
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check role-based access
  if (requiredRole && !isRole(requiredRole)) {
    if (showUnauthorized) {
      return <UnauthorizedAccess />;
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (showUnauthorized) {
      return <UnauthorizedAccess />;
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

// Unauthorized access component
const UnauthorizedAccess: React.FC = () => {
  const { user } = useUser();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#fef2f2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          color: '#dc2626'
        }}>
          <i className="fas fa-lock" style={{ fontSize: '20px' }}></i>
        </div>
        
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          Access Denied
        </h2>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          You don't have permission to access this page. Your current role ({user?.role}) doesn't include the required permissions.
        </p>
        
        <button
          onClick={() => window.history.back()}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ProtectedRoute;