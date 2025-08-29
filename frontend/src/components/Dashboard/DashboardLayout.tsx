import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../UI/sidebar';
import RoleSwitcher from '../Debug/RoleSwitcher';
import "../../styles/DashboardLayout.css";

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      {children || <Outlet />}
      <RoleSwitcher />
    </SidebarProvider>
  );
};

export default DashboardLayout;
