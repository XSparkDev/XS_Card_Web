// @ts-ignore
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Dashboard/DashboardLayout';

// Import your pages
import Dashboard from './pages/Dashboard';
import BusinessCards from './components/Dashboard/BusinessCards';
import CreateCard from './components/Dashboard/CreateCard';
import Contacts from './components/Dashboard/Contacts';
import Analytics from './components/Dashboard/Analytics';
import Department from './components/Dashboard/Department';
import Calendar from './components/Dashboard/CalendarMain';
import UserManagement from './components/Dashboard/UserManagement';

// Optional: Import SignIn if you have it
// import SignIn from './path/to/SignIn';

// Dummy pages if needed (delete these once you have real pages)


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/business-cards" />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/business-cards" element={<BusinessCards />} />
          <Route path="/business-cards/create" element={<CreateCard />} />
          <Route path="/business-cards/archived" element={<div>Archived Cards</div>} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/department" element={<Department />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/security" element={<div>Security</div>} />
          <Route path="/integrations" element={<div>Integrations</div>} />
          <Route path="/settings" element={<div>Settings</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
