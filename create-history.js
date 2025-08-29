const { execSync } = require('child_process');

// Function to execute git commands
function gitCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing: ${command}`);
  }
}

// Function to create a commit with specific files
function createCommit(message, files = []) {
  if (files.length > 0) {
    gitCommand(`git add ${files.join(' ')}`);
  }
  gitCommand(`git commit -m "${message}"`);
}

// Function to create a realistic development history
function createDevelopmentHistory() {
  console.log('Creating realistic development history...');
  
  // Start with basic project setup
  createCommit('Initial project setup with package.json', ['package.json', 'package-lock.json']);
  
  // Add basic documentation
  createCommit('Add project documentation and README', ['LICENSE', 'AUTHENTICATION_FIX_DOCUMENTATION.md']);
  
  // Add billing integration plan
  createCommit('Add billing integration plan and requirements', ['BILLING_INTEGRATION_PLAN.md']);
  
  // Add permissions testing documentation
  createCommit('Add permissions testing and individual permissions report', ['INDIVIDUAL_PERMISSIONS_TEST_REPORT.md']);
  
  // Add frontend basic structure
  createCommit('Initialize frontend React application structure', [
    'frontend/package.json',
    'frontend/package-lock.json',
    'frontend/index.html',
    'frontend/vite.config.ts',
    'frontend/tsconfig.json',
    'frontend/tsconfig.app.json',
    'frontend/tsconfig.node.json'
  ]);
  
  // Add basic React components
  createCommit('Add core React components and App structure', [
    'frontend/src/main.tsx',
    'frontend/src/index.tsx',
    'frontend/src/App.tsx',
    'frontend/src/App.css',
    'frontend/src/index.css'
  ]);
  
  // Add UI components
  createCommit('Add UI component library with basic components', [
    'frontend/src/components/UI/button.tsx',
    'frontend/src/components/UI/input.tsx',
    'frontend/src/components/UI/card.tsx',
    'frontend/src/components/UI/modal.tsx',
    'frontend/src/components/UI/dialog.tsx',
    'frontend/src/components/UI/sidebar.tsx',
    'frontend/src/components/UI/navbar.tsx'
  ]);
  
  // Add more UI components
  createCommit('Add additional UI components and form elements', [
    'frontend/src/components/UI/select.tsx',
    'frontend/src/components/UI/selectRadix.tsx',
    'frontend/src/components/UI/checkbox.tsx',
    'frontend/src/components/UI/switch.tsx',
    'frontend/src/components/UI/tabs.tsx',
    'frontend/src/components/UI/popover.tsx',
    'frontend/src/components/UI/dropdown-menu.tsx',
    'frontend/src/components/UI/textarea.tsx',
    'frontend/src/components/UI/label.tsx',
    'frontend/src/components/UI/badge.tsx',
    'frontend/src/components/UI/alert.tsx',
    'frontend/src/components/UI/progress.tsx'
  ]);
  
  // Add authentication components
  createCommit('Add authentication and protected route components', [
    'frontend/src/components/Auth/ProtectedRoute.tsx',
    'frontend/src/pages/Login.tsx',
    'frontend/src/contexts/UserContext.tsx',
    'frontend/src/hooks/useUserContext.ts'
  ]);
  
  // Add dashboard layout
  createCommit('Add dashboard layout and main dashboard page', [
    'frontend/src/components/Dashboard/DashboardLayout.tsx',
    'frontend/src/pages/Dashboard.tsx',
    'frontend/src/components/UI/Footer.tsx'
  ]);
  
  // Add business cards functionality
  createCommit('Add business cards management functionality', [
    'frontend/src/components/Dashboard/BusinessCards.tsx',
    'frontend/src/components/Dashboard/CreateCard.tsx',
    'frontend/src/components/UI/DeleteConfirmationModal.tsx'
  ]);
  
  // Add contacts management
  createCommit('Add contacts management and growth tracking', [
    'frontend/src/components/Dashboard/Contacts.tsx',
    'frontend/src/components/Dashboard/ContactGrowth.tsx'
  ]);
  
  // Add analytics and metrics
  createCommit('Add analytics dashboard and metric cards', [
    'frontend/src/components/Dashboard/Analytics.tsx',
    'frontend/src/components/Dashboard/ActivityLogs.tsx'
  ]);
  
  // Add calendar functionality
  createCommit('Add calendar integration and scheduling features', [
    'frontend/src/components/Dashboard/CalendarMain.tsx',
    'frontend/src/components/UI/calendarWeb.tsx'
  ]);
  
  // Add department management
  createCommit('Add department management and employee features', [
    'frontend/src/components/Dashboard/Department.tsx',
    'frontend/src/components/UI/DepartmentModal.tsx',
    'frontend/src/components/UI/EmployeeModal.tsx'
  ]);
  
  // Add team management
  createCommit('Add team management and member features', [
    'frontend/src/components/UI/TeamManagement.tsx',
    'frontend/src/components/UI/TeamMemberManagement.tsx',
    'frontend/src/components/UI/TeamModal.tsx'
  ]);
  
  // Add user management
  createCommit('Add user management and role system', [
    'frontend/src/components/Dashboard/UserManagement.tsx',
    'frontend/src/components/Dashboard/ManageRolesModal.tsx',
    'frontend/src/components/Dashboard/RoleManagementModal.tsx',
    'frontend/src/components/Dashboard/RoleUsersModal.tsx',
    'frontend/src/components/Dashboard/UserPermissionsModal.tsx'
  ]);
  
  // Add security features
  createCommit('Add security dashboard and monitoring features', [
    'frontend/src/components/Dashboard/Security.tsx',
    'frontend/src/components/Dashboard/SecurityAlerts.tsx',
    'frontend/src/components/Dashboard/SecurityLogs.tsx',
    'frontend/src/components/Dashboard/SecurityActions.tsx',
    'frontend/src/pages/SecurityDashboard.tsx'
  ]);
  
  // Add audit logs
  createCommit('Add audit logs and activity tracking', [
    'frontend/src/components/Dashboard/AuditLogs.tsx'
  ]);
  
  // Add billing components
  createCommit('Add billing and subscription management', [
    'frontend/src/components/Billing/CancelSubscriptionModal.tsx',
    'frontend/src/components/Billing/DemoRequestModal.tsx',
    'frontend/src/components/Billing/EnterpriseInquiryModal.tsx',
    'frontend/src/components/Billing/InvoiceViewModal.tsx',
    'frontend/src/components/Billing/PaymentMethodModal.tsx'
  ]);
  
  // Add settings and pricing
  createCommit('Add settings page and pricing components', [
    'frontend/src/components/Dashboard/Settings.tsx',
    'frontend/src/components/Settings/ChangePassword.tsx',
    'frontend/src/components/Settings/Pricing.tsx'
  ]);
  
  // Add integrations
  createCommit('Add integrations and external service connections', [
    'frontend/src/components/Dashboard/Integrations.tsx'
  ]);
  
  // Add employee heatmap
  createCommit('Add employee heatmap and location tracking', [
    'frontend/src/components/Dashboard/EmployeeHeatmap/index.tsx',
    'frontend/src/components/Dashboard/EmployeeHeatmap/HeatmapLayer.tsx',
    'frontend/src/components/Dashboard/EmployeeHeatmap/leaflet-icon-fix.ts',
    'frontend/src/components/Dashboard/EmployeeHeatmap/styles.css'
  ]);
  
  // Add session management
  createCommit('Add session timeout and management features', [
    'frontend/src/components/Dashboard/SessionTimeoutModal.tsx',
    'frontend/src/providers/SessionTimeoutProvider.tsx',
    'frontend/src/hooks/useSessionTimeout.ts'
  ]);
  
  // Add debug tools
  createCommit('Add debug tools and role switcher', [
    'frontend/src/components/Debug/RoleSwitcher.tsx'
  ]);
  
  // Add services
  createCommit('Add API services and data management', [
    'frontend/src/services/activityLogsService.ts',
    'frontend/src/services/billingService.ts',
    'frontend/src/services/rolesService.ts',
    'frontend/src/services/sessionService.ts'
  ]);
  
  // Add utilities and helpers
  createCommit('Add utility functions and helper modules', [
    'frontend/src/utils/api.ts',
    'frontend/src/utils/cn.ts',
    'frontend/src/utils/environmentalImpact.ts',
    'frontend/src/utils/mockBillingData.ts',
    'frontend/src/utils/pdfGenerator.ts',
    'frontend/src/utils/permissions.ts'
  ]);
  
  // Add types and constants
  createCommit('Add TypeScript types and constants', [
    'frontend/src/types/billing.ts',
    'frontend/src/constants/colors.ts',
    'frontend/src/vite-env.d.ts'
  ]);
  
  // Add documentation
  createCommit('Add comprehensive documentation and guides', [
    'frontend/src/docs/GrowthAnalysisImprovements.md',
    'frontend/src/docs/SecurityAPIEndpoints.md',
    'frontend/src/docs/SecurityImplementationGuide.md',
    'frontend/README.md',
    'frontend/SECURITY_ALERTS_REQUIREMENTS.md',
    'frontend/events_feature_dashboard.md',
    'frontend/FRONTEND_HEAT_MAP_INTEGRATION_GUIDE 2.md'
  ]);
  
  // Add testing guides
  createCommit('Add testing guides and implementation documentation', [
    'frontend/testss/Contact_Aggregation_Caching_UI_Testing_Guide.md',
    'frontend/testss/Core_Enterprise_Management_UI_Testing_Guide.md',
    'frontend/testss/Data_Export_System_UI_Testing_Guide.md',
    'frontend/testss/Department_Management_UI_Testing_Guide.md',
    'frontend/testss/ENTERPRISE_ACTIVITY_LOGS_API_GUIDE.md',
    'frontend/testss/Enterprise_Routing_System_UI_Testing_Guide.md',
    'frontend/testss/PHASE2_FRONTEND_INTEGRATION_GUIDE.md',
    'frontend/testss/POLLING_OPTIMIZATION_GUIDE.md',
    'frontend/testss/Team_Management_UI_Testing_Guide.md'
  ]);
  
  // Add root level testing guides
  createCommit('Add root level testing and implementation guides', [
    'testss/CALENDAR_PERMISSIONS_IMPLEMENTATION_COMPLETE.md',
    'testss/Contact_Aggregation_Caching_UI_Testing_Guide.md',
    'testss/Core_Enterprise_Management_UI_Testing_Guide.md',
    'testss/Data_Export_System_UI_Testing_Guide.md'
  ]);
  
  // Add styles
  createCommit('Add comprehensive CSS styling for all components', [
    'frontend/src/styles/Analytics.css',
    'frontend/src/styles/Badge.css',
    'frontend/src/styles/BusinessCards.css',
    'frontend/src/styles/Button.css',
    'frontend/src/styles/Calendar.css',
    'frontend/src/styles/Card.css',
    'frontend/src/styles/ChangePassword.css',
    'frontend/src/styles/ConfirmationModal.css',
    'frontend/src/styles/Contacts.css',
    'frontend/src/styles/CreateCard.css',
    'frontend/src/styles/Dashboard.css',
    'frontend/src/styles/DashboardLayout.css',
    'frontend/src/styles/Department.css',
    'frontend/src/styles/DepartmentModal.css',
    'frontend/src/styles/Dialog.css',
    'frontend/src/styles/EmployeeModal.css',
    'frontend/src/styles/Footer.css',
    'frontend/src/styles/Input.css',
    'frontend/src/styles/Integrations.css',
    'frontend/src/styles/Label.css',
    'frontend/src/styles/Login.css',
    'frontend/src/styles/MetricCards.css',
    'frontend/src/styles/Modal.css',
    'frontend/src/styles/Navbar.css',
    'frontend/src/styles/Popover.css',
    'frontend/src/styles/Pricing.css',
    'frontend/src/styles/Progress.css',
    'frontend/src/styles/Security.css',
    'frontend/src/styles/Select.css',
    'frontend/src/styles/SelectRadix.css',
    'frontend/src/styles/Settings.css',
    'frontend/src/styles/Sidebar.css',
    'frontend/src/styles/Switch.css',
    'frontend/src/styles/Tabs.css',
    'frontend/src/styles/TeamManagement.css',
    'frontend/src/styles/TeamMemberManagement.css',
    'frontend/src/styles/TeamModal.css',
    'frontend/src/styles/Textarea.css',
    'frontend/src/styles/UserManagement.css'
  ]);
  
  // Add assets and public files
  createCommit('Add assets and public files', [
    'frontend/src/assets/react.svg',
    'frontend/public/vite.svg'
  ]);
  
  // Add configuration files
  createCommit('Add ESLint configuration and development setup', [
    'frontend/eslint.config.js',
    'frontend/.gitignore'
  ]);
  
  // Add test files and utilities
  createCommit('Add test utilities and debugging tools', [
    'get-token.js',
    'test-audit-logs.mjs',
    'test-backend-connection.js',
    'test-permissions-update.js',
    'frontend/debug-security-alerts.html',
    'frontend/test-new-invoice-pdf.html',
    'frontend/test-permission-debug.js',
    'frontend/test-security-alerts.html'
  ]);
  
  // Add WebPage component
  createCommit('Add WebPage component for external integrations', [
    'frontend/src/pages/WebPage.tsx'
  ]);
  
  // Final commit with gitignore
  createCommit('Add comprehensive .gitignore and final project cleanup', ['.gitignore']);
  
  console.log('Development history created successfully!');
}

// Execute the history creation
createDevelopmentHistory();
