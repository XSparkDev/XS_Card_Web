import React, { useState, useRef, useEffect } from 'react';
import { useUser, UserRole, createUser } from '../../contexts/UserContext';

const RoleSwitcher: React.FC = () => {
  const { user, setUser } = useUser();
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('roleSwitcherPosition');
    const savedMinimized = localStorage.getItem('roleSwitcherMinimized');
    
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
    if (savedMinimized) {
      setIsMinimized(JSON.parse(savedMinimized));
    }
  }, []);

  // Save position and minimized state to localStorage
  useEffect(() => {
    localStorage.setItem('roleSwitcherPosition', JSON.stringify(position));
    localStorage.setItem('roleSwitcherMinimized', JSON.stringify(isMinimized));
  }, [position, isMinimized]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - (containerRef.current.offsetWidth || 200);
      const maxY = window.innerHeight - (containerRef.current.offsetHeight || 150);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    // Reset to default position
    setPosition({ x: 10, y: 10 });
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!user) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: isMinimized ? '0.5rem' : '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        minWidth: isMinimized ? 'auto' : '200px',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Drag Handle */}
      <div 
        className="drag-handle"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMinimized ? '0' : '0.5rem',
          cursor: 'grab',
          padding: '0.25rem 0',
          borderBottom: isMinimized ? 'none' : '1px solid #f3f4f6'
        }}
      >
        <h4 style={{ 
          margin: '0', 
          fontSize: '0.875rem', 
          fontWeight: '600',
          color: '#374151'
        }}>
          {isMinimized ? 'Debug' : 'Debug: Switch Role'}
        </h4>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={toggleMinimize}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.125rem',
              borderRadius: '2px',
              fontSize: '0.75rem',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? '□' : '−'}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
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
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (user.role !== 'Employee') {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (user.role !== 'Employee') {
                  e.currentTarget.style.background = 'white';
                }
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
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (user.role !== 'Manager') {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (user.role !== 'Manager') {
                  e.currentTarget.style.background = 'white';
                }
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
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (user.role !== 'Administrator') {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (user.role !== 'Administrator') {
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              Administrator
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleSwitcher;