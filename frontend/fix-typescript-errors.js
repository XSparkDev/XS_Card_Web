const fs = require('fs');
const path = require('path');

// Function to fix TypeScript errors in files
function fixTypeScriptErrors() {
  const fixes = [
    {
      file: 'src/components/Dashboard/SecurityAlerts.tsx',
      search: "import { Badge } from '../UI/badge';",
      replace: "// import { Badge } from '../UI/badge';"
    },
    {
      file: 'src/components/Dashboard/UserManagement.tsx',
      search: "  const navigate = useNavigate();",
      replace: "  // const navigate = useNavigate();"
    },
    {
      file: 'src/components/Dashboard/UserManagement.tsx',
      search: "  const getBadgeVariant = (status: string) => {",
      replace: "  // const getBadgeVariant = (status: string) => {"
    },
    {
      file: 'src/components/Dashboard/UserManagement.tsx',
      search: "    return status === 'active' ? 'default' : 'secondary';",
      replace: "    // return status === 'active' ? 'default' : 'secondary';"
    },
    {
      file: 'src/components/Dashboard/UserManagement.tsx',
      search: "  };",
      replace: "  // };"
    },
    {
      file: 'src/components/UI/calendarWeb.tsx',
      search: "  const goToPreviousMonth = () => {",
      replace: "  // const goToPreviousMonth = () => {"
    },
    {
      file: 'src/components/UI/calendarWeb.tsx',
      search: "    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));",
      replace: "    // setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));"
    },
    {
      file: 'src/components/UI/calendarWeb.tsx',
      search: "  };",
      replace: "  // };"
    },
    {
      file: 'src/components/UI/calendarWeb.tsx',
      search: "  const goToNextMonth = () => {",
      replace: "  // const goToNextMonth = () => {"
    },
    {
      file: 'src/components/UI/calendarWeb.tsx',
      search: "    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));",
      replace: "    // setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));"
    },
    {
      file: 'src/components/UI/calendarWeb.tsx',
      search: "  };",
      replace: "  // };"
    },
    {
      file: 'src/components/UI/calendarWeb.tsx',
      search: "  const formatMonthYear = (date: Date) => {",
      replace: "  // const formatMonthYear = (date: Date) => {"
    },
    {
      file: 'src/components/UI/calendarWeb.tsx',
      search: "    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });",
      replace: "    // return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });"
    },
    {
      file: 'src/components/UI/calendarWeb.tsx',
      search: "  };",
      replace: "  // };"
    },
    {
      file: 'src/components/UI/DepartmentModal.tsx',
      search: "import { Select } from \"./select\";",
      replace: "// import { Select } from \"./select\";"
    },
    {
      file: 'src/components/UI/select.tsx',
      search: "import React, { SelectHTMLAttributes, forwardRef, ReactNode } from \"react\";",
      replace: "import { SelectHTMLAttributes, forwardRef } from \"react\";"
    },
    {
      file: 'src/components/UI/sidebar.tsx',
      search: "  const navigate = useNavigate();",
      replace: "  // const navigate = useNavigate();"
    },
    {
      file: 'src/components/UI/sidebar.tsx',
      search: "  const location = useLocation(); //here",
      replace: "  // const location = useLocation(); //here"
    },
    {
      file: 'src/components/UI/TeamMemberManagement.tsx',
      search: "import { Button } from \"./button\";",
      replace: "// import { Button } from \"./button\";"
    },
    {
      file: 'src/components/UI/TeamMemberManagement.tsx',
      search: "import { FaUsers, FaPlus, FaTimes, FaCrown, FaSave } from \"react-icons/fa\";",
      replace: "import { FaUsers, FaPlus, FaCrown } from \"react-icons/fa\";"
    },
    {
      file: 'src/components/UI/TeamMemberManagement.tsx',
      search: "import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders } from \"../../utils/api\";",
      replace: "import { buildEnterpriseUrl, getEnterpriseHeaders } from \"../../utils/api\";"
    },
    {
      file: 'src/components/UI/TeamModal.tsx',
      search: "import { Button } from \"./button\";",
      replace: "// import { Button } from \"./button\";"
    },
    {
      file: 'src/components/UI/TeamModal.tsx',
      search: "import { FaTimes, FaSave } from \"react-icons/fa\";",
      replace: "import { FaTimes } from \"react-icons/fa\";"
    },
    {
      file: 'src/components/UI/textarea.tsx',
      search: "import React, { TextareaHTMLAttributes, forwardRef } from \"react\";",
      replace: "import { TextareaHTMLAttributes, forwardRef } from \"react\";"
    },
    {
      file: 'src/hooks/useUserContext.ts',
      search: "import { ENDPOINTS, buildUrl, buildEnterpriseUrl, getAuthHeaders, getEnterpriseHeaders } from '../utils/api';",
      replace: "import { ENDPOINTS, buildUrl, buildEnterpriseUrl, getEnterpriseHeaders } from '../utils/api';"
    },
    {
      file: 'src/pages/Dashboard.tsx',
      search: "import { Routes, Route } from \"react-router-dom\";",
      replace: "// import { Routes, Route } from \"react-router-dom\";"
    },
    {
      file: 'src/pages/Dashboard.tsx',
      search: "import Security from \"../components/Dashboard/Security\";",
      replace: "// import Security from \"../components/Dashboard/Security\";"
    },
    {
      file: 'src/services/rolesService.ts',
      search: "  assignUserToRole: async (roleId: string, userId: string): Promise<{ success: boolean }> => {",
      replace: "  assignUserToRole: async (roleId: string, _userId: string): Promise<{ success: boolean }> => {"
    },
    {
      file: 'src/services/rolesService.ts',
      search: "  removeUserFromRole: async (roleId: string, userId: string): Promise<{ success: boolean }> => {",
      replace: "  removeUserFromRole: async (roleId: string, _userId: string): Promise<{ success: boolean }> => {"
    },
    {
      file: 'src/services/sessionService.ts',
      search: "  const roles = ['Administrator', 'Manager', 'Employee'];",
      replace: "  // const roles = ['Administrator', 'Manager', 'Employee'];"
    }
  ];

  fixes.forEach(fix => {
    const filePath = path.join(__dirname, fix.file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${fix.file}`);
      } else {
        console.log(`Search string not found in: ${fix.file}`);
      }
    } else {
      console.log(`File not found: ${fix.file}`);
    }
  });
}

fixTypeScriptErrors();
