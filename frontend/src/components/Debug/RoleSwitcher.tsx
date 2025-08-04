import React from 'react';
import { useUser, UserRole, createUser } from '../../contexts/UserContext';

const RoleSwitcher: React.FC = () => {
  const { user, setUser } = useUser();

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = createUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: role
      });
      setUser(updatedUser);
    }
  };

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
        Debug: Switch Role
      </h4>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', color: '#6b7280' }}>
        Current: <strong>{user.role}</strong>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={() => switchRole('Employee')}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: user.role === 'Employee' ? '#3b82f6' : 'white',
            color: user.role === 'Employee' ? 'white' : '#374151',
            cursor: 'pointer'
          }}
        >
          Employee
        </button>
        <button
          onClick={() => switchRole('Manager')}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: user.role === 'Manager' ? '#3b82f6' : 'white',
            color: user.role === 'Manager' ? 'white' : '#374151',
            cursor: 'pointer'
          }}
        >
          Manager
        </button>
        <button
          onClick={() => switchRole('Administrator')}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: user.role === 'Administrator' ? '#3b82f6' : 'white',
            color: user.role === 'Administrator' ? 'white' : '#374151',
            cursor: 'pointer'
          }}
        >
          Administrator
        </button>
      </div>
    </div>
  );
};

export default RoleSwitcher;