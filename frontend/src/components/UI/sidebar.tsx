import React, { createContext, useContext, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import "../../styles/Sidebar.css";

// Context for sidebar state
type SidebarContextType = {
  isOpen: boolean;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

// Export this hook separately to fix HMR issues
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

// Sidebar Provider
function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Always open for desktop, could be toggled for mobile
  const isOpen = true;
  
  return (
    <SidebarContext.Provider value={{ isOpen }}>
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}

// Sidebar Menu Item
interface SidebarMenuItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  active?: boolean;
  onClick?: () => void;
  subItems?: Array<{
    label: string;
    to: string;
    active?: boolean;
  }>;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  icon,
  label,
  to,
  active = false,
  onClick,
  subItems,
}) => {
  const [expanded, setExpanded] = useState(active || label === "Business Cards");
  const location = useLocation();
  
  // Check if this item or any of its subitems is active
  const isActive = active || location.pathname === to || 
    (subItems?.some(item => location.pathname === item.to));
  
  const handleClick = () => {
    if (subItems && subItems.length > 0) {
      setExpanded(!expanded);
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="sidebar-menu-item-container">
      {to ? (
        <Link 
          to={to} 
          className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
          onClick={handleClick}
        >
          <span className="sidebar-menu-item-icon">{icon}</span>
          <span className="sidebar-menu-item-label">{label}</span>
          {subItems && subItems.length > 0 && (
            <i className={`fas fa-chevron-${expanded ? 'up' : 'down'} sidebar-menu-item-arrow`}></i>
          )}
        </Link>
      ) : (
        <button 
          className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
          onClick={handleClick}
        >
          <span className="sidebar-menu-item-icon">{icon}</span>
          <span className="sidebar-menu-item-label">{label}</span>
          {subItems && subItems.length > 0 && (
            <i className={`fas fa-chevron-${expanded ? 'up' : 'down'} sidebar-menu-item-arrow`}></i>
          )}
        </button>
      )}

      {expanded && subItems && (
        <div className="sidebar-menu-sub-items">
          {subItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className={`sidebar-menu-sub-item ${location.pathname === item.to ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Section Header
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="section-header">{title}</div>
);

// User Profile
const UserProfile: React.FC = () => (
  <div className="user-profile">
    <div className="user-avatar">
      <span className="user-initials">JD</span>
    </div>
    <div className="user-info">
      <p className="user-name">John Doe</p>
      <p className="user-role">Admin</p>
    </div>
  </div>
);

// Main Sidebar Component
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <span className="logo-text">X</span>
          </div>
          <div>
            <h1 className="sidebar-title">XSCard</h1>
            <p className="sidebar-subtitle">Enterprise</p>
          </div>
        </div>
      </div>
      
      <div className="sidebar-content">
        <SectionHeader title="Main" />
        
        <SidebarMenuItem
          icon={<i className="fas fa-tachometer-alt"></i>}
          label="Dashboard"
          to="/dashboard"
        />
        
        <SidebarMenuItem
          icon={<i className="fas fa-id-card"></i>}
          label="Business Cards"
          to="/business-cards"
          subItems={[
            { label: "All Cards", to: "/business-cards" },
            { label: "Create New Card", to: "/business-cards/create" },
            { label: "Archived Cards", to: "/business-cards/archived" },
          ]}
        />
        
        <SidebarMenuItem
          icon={<i className="fas fa-users"></i>}
          label="Contacts"
          to="/contacts"
        />
        
        <SidebarMenuItem
          icon={<i className="fas fa-chart-line"></i>}
          label="Analytics"
          to="/analytics"
        />
        
        <SidebarMenuItem
          icon={<i className="fas fa-building"></i>}
          label="Department"
          to="/department"
        />
        
        <SidebarMenuItem
          icon={<i className="fas fa-calendar"></i>}
          label="Calendar"
          to="/calendar"
        />
        
        <SidebarMenuItem
          icon={<i className="fas fa-user-cog"></i>}
          label="User Management"
          to="/user-management"
        />
        
        <SectionHeader title="Admin" />
        
        <SidebarMenuItem
          icon={<i className="fas fa-shield-alt"></i>}
          label="Security"
          to="/security"
        />
        
        <SidebarMenuItem
          icon={<i className="fas fa-plug"></i>}
          label="Integrations"
          to="/integrations"
        />
        
        <SidebarMenuItem
          icon={<i className="fas fa-cog"></i>}
          label="Settings"
          to="/settings"
        />
      </div>
      
      <div className="sidebar-footer">
        <UserProfile />
        
        <button className="footer-button">
          <i className="fas fa-question-circle"></i>
          <span className="footer-button-text">Help & Support</span>
        </button>
        
        <button 
          className="footer-button logout-button"
          onClick={() => navigate('/sign-in')}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span className="footer-button-text logout-button-text">Log Out</span>
        </button>
      </div>
    </div>
  );
};

// Export components separately to fix HMR issues
export { SidebarProvider };
export default Sidebar; 