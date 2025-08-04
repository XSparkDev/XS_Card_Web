// @ts-ignore
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Security from "./components/Dashboard/Security";
import SecurityDashboard from "./pages/SecurityDashboard";
import { SessionTimeoutProvider } from './providers/SessionTimeoutProvider';
import { UserProvider } from './contexts/UserContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Import your pages
import Dashboard from './pages/Dashboard';
import BusinessCards from './components/Dashboard/BusinessCards';
import CreateCard from './components/Dashboard/CreateCard';
import Contacts from './components/Dashboard/Contacts';
import Analytics from './components/Dashboard/Analytics';
import Department from './components/Dashboard/Department';
import Calendar from './components/Dashboard/CalendarMain';
import UserManagement from './components/Dashboard/UserManagement';
import Integrations from "./components/Dashboard/Integrations";
import Settings from './components/Dashboard/Settings';
import Pricing from "./components/Settings/Pricing";
import ChangePassword from "./components/Settings/ChangePassword";

// Optional: Import SignIn if you have it
// import SignIn from './path/to/SignIn';

// Dummy pages if needed (delete these once you have real pages)


const App = () => {
  return (
    <Router>
      <UserProvider>
        <SessionTimeoutProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/business-cards" />} />
        <Route element={<DashboardLayout />}>
              {/* Dashboard - Analytics (Managers and Admins only) */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requiredPermission="viewAnalytics">
                    <Navigate to="/analytics" />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute requiredPermission="viewAnalytics">
                    <Analytics />
                  </ProtectedRoute>
                } 
              />

              {/* Business Cards - All users can view */}
              <Route 
                path="/business-cards" 
                element={
                  <ProtectedRoute requiredPermission="viewBusinessCards">
                    <BusinessCards />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business-cards/create" 
                element={
                  <ProtectedRoute requiredPermission="createBusinessCards">
                    <CreateCard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business-cards/archived" 
                element={
                  <ProtectedRoute requiredPermission="viewBusinessCards">
                    <div>Archived Cards</div>
                  </ProtectedRoute>
                } 
              />

              {/* Contacts - All users can view */}
              <Route 
                path="/contacts" 
                element={
                  <ProtectedRoute requiredPermission="viewContacts">
                    <Contacts />
                  </ProtectedRoute>
                } 
              />

              {/* Calendar - All users can view */}
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute requiredPermission="viewCalendar">
                    <Calendar />
                  </ProtectedRoute>
                } 
              />

              {/* Department - Managers and Admins only */}
              <Route 
                path="/department" 
                element={
                  <ProtectedRoute requiredPermission="viewDepartments">
                    <Department />
                  </ProtectedRoute>
                } 
              />

              {/* User Management - Managers and Admins only */}
              <Route 
                path="/user-management" 
                element={
                  <ProtectedRoute requiredPermission="viewUserManagement">
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />

              {/* Security - Admins only */}
              <Route 
                path="/security" 
                element={
                  <ProtectedRoute requiredPermission="viewSecurity">
                    <Security />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/security-dashboard" 
                element={
                  <ProtectedRoute requiredPermission="viewSecurity">
                    <SecurityDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Integrations - Managers and Admins only */}
              <Route 
                path="/integrations" 
                element={
                  <ProtectedRoute requiredPermission="viewIntegrations">
                    <Integrations />
                  </ProtectedRoute>
                } 
              />

              {/* Settings - Managers and Admins only */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute requiredPermission="viewSettings">
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="pricing" 
                element={
                  <ProtectedRoute requiredPermission="viewSettings">
                    <Pricing />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="settings/change-password" 
                element={
                  <ProtectedRoute requiredPermission="viewSettings">
                    <ChangePassword />
                  </ProtectedRoute>
                } 
              />
        </Route>
      </Routes>
        </SessionTimeoutProvider>
      </UserProvider>
    </Router>
  );
};

export default App;
