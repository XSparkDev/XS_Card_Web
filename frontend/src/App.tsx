// @ts-ignore
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Security from "./components/Dashboard/Security";
import SecurityDashboard from "./pages/SecurityDashboard";
import Login from './pages/Login';
import { SessionTimeoutProvider } from './providers/SessionTimeoutProvider';
import { UserProvider, useUser } from './contexts/UserContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Import your pages
// import Dashboard from './pages/Dashboard';
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

// Main App Content Component (needs to be inside UserProvider to access context)
const AppContent = () => {
  const { isAuthenticated, loading, login } = useUser();

  if (loading) {
    console.log('⏳ AppContent: Loading state, showing loading screen');
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid rgba(255,255,255,0.3)', 
            borderTop: '4px solid white', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔐 AppContent: User not authenticated, showing Login page');
    return <Login onLogin={login} />;
  }

  console.log('🏠 AppContent: User authenticated, showing dashboard');
  return (
    <SessionTimeoutProvider>
      <Routes>
        <Route path="/login" element={<Navigate to="/business-cards" />} />
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
                  <ProtectedRoute requiredPermission="viewCards">
                    <BusinessCards />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business-cards/create" 
                element={
                  <ProtectedRoute requiredPermission="createCards">
                    <CreateCard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business-cards/archived" 
                element={
                  <ProtectedRoute requiredPermission="viewCards">
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
  );
};

const App = () => {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <Router>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </Router>
    </>
  );
};

export default App;
