// @ts-nocheck
import { useState, FC } from "react";
import "../../styles/Department.css";
import EmployeeModal from '../UI/EmployeeModal';
import DepartmentModal from '../UI/DepartmentModal';

const mockDepartments = [
  {
    id: "1",
    name: "Sales",
    description: "Business development and client acquisition",
    employeeCount: 24,
    cardCount: 22,
    scanCount: 1450,
    progress: 95,
    growthRate: 12.5,
  },
  {
    id: "2",
    name: "Marketing",
    description: "Brand strategy and promotion",
    employeeCount: 18,
    cardCount: 18,
    scanCount: 967,
    progress: 100,
    growthRate: 15.3,
  },
  {
    id: "3",
    name: "Product",
    description: "Product development and research",
    employeeCount: 32,
    cardCount: 28,
    scanCount: 1120,
    progress: 87.5,
    growthRate: 8.7,
  },
  {
    id: "4",
    name: "Engineering",
    description: "Software development and technical operations",
    employeeCount: 45,
    cardCount: 40,
    scanCount: 1230,
    progress: 88.9,
    growthRate: 10.2,
  },
  {
    id: "5",
    name: "Operations",
    description: "Business operations and logistics",
    employeeCount: 15,
    cardCount: 12,
    scanCount: 780,
    progress: 80,
    growthRate: 9.5,
  },
  {
    id: "6",
    name: "Customer Support",
    description: "Customer service and issue resolution",
    employeeCount: 22,
    cardCount: 20,
    scanCount: 980,
    progress: 90.9,
    growthRate: 7.8,
  },
];

// Department Card component
const DepartmentCard = ({ department }: { department: typeof mockDepartments[0] }) => {
  return (
    <div className="department-card">
      <div className="card-content">
        <div className="card-header">
          <div>
            <h3 className="card-title">{department.name}</h3>
            <p className="card-description">{department.description}</p>
          </div>
          <button className="more-button">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
        
        <div className="stats-grid">
          <div className="stat-item">
            <p className="stat-value">{department.employeeCount}</p>
            <p className="stat-label">Employees</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">{department.cardCount}</p>
            <p className="stat-label">Cards Issued</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">{department.scanCount}</p>
            <p className="stat-label">Total Scans</p>
          </div>
        </div>
        
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Card Coverage</span>
            <span className="progress-value">{department.progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${department.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="card-footer">
          <button className="footer-button">
            <i className="fas fa-users"></i>
            Team
          </button>
          <button className="footer-button">
            <i className="fas fa-credit-card"></i>
            Cards
          </button>
          <button className="footer-button">
            <i className="fas fa-chart-bar"></i>
            Stats
          </button>
        </div>
      </div>
    </div>
  );
};

// Organization Summary Card
const DepartmentsSummaryCard = () => {
  const totalEmployees = mockDepartments.reduce((acc, dept) => acc + dept.employeeCount, 0);
  const totalCards = mockDepartments.reduce((acc, dept) => acc + dept.cardCount, 0);
  const totalScans = mockDepartments.reduce((acc, dept) => acc + dept.scanCount, 0);
  const averageCoverage = mockDepartments.reduce((acc, dept) => acc + dept.progress, 0) / mockDepartments.length;
  
  return (
    <div className="summary-card">
      <div className="summary-content">
        <h2 className="summary-title">Organization Summary</h2>
        
        <div className="summary-stats">
          <div className="summary-stat">
            <p className="summary-stat-value">{totalEmployees}</p>
            <p className="summary-stat-label">Total Employees</p>
          </div>
          <div className="summary-stat">
            <p className="summary-stat-value">{totalCards}</p>
            <p className="summary-stat-label">Total Cards</p>
          </div>
          <div className="summary-stat">
            <p className="summary-stat-value">{totalScans.toLocaleString()}</p>
            <p className="summary-stat-label">Total Scans</p>
          </div>
          <div className="summary-stat">
            <p className="summary-stat-value">{averageCoverage.toFixed(1)}%</p>
            <p className="summary-stat-label">Avg. Coverage</p>
          </div>
        </div>
        
        <div className="summary-footer">
          <button className="summary-button">
            <i className="fas fa-building"></i>
            Department Structure
          </button>
          <button className="summary-button">
            <i className="fas fa-file-download"></i>
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

const Department: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  
  const filteredDepartments = mockDepartments.filter(department => 
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddEmployee = (employeeData) => {
    console.log('New employee:', employeeData);
    setIsEmployeeModalOpen(false);
  };
  
  const handleAddDepartment = (departmentData) => {
    console.log('New department:', departmentData);
    setIsDepartmentModalOpen(false);
  };
  
  return (
    <div className="department-container">
      <div className="department-header">
        <div>
          <h1 className="department-title">Departments</h1>
          <p className="department-subtitle">Manage your organization's departments and teams</p>
        </div>
        <div className="header-buttons">
          <button className="header-button outline-button" onClick={() => setIsEmployeeModalOpen(true)}>
            <i className="fas fa-user-plus"></i>
            Add Employee
          </button>
          <button 
            className="header-button primary-button" 
            onClick={() => setIsDepartmentModalOpen(true)}
          >
            <i className="fas fa-plus"></i>
            New Department
          </button>
        </div>
      </div>
      
      <DepartmentsSummaryCard />
      
      <div className="search-container">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          className="search-input"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="departments-grid">
        {filteredDepartments.map(department => (
          <DepartmentCard key={department.id} department={department} />
        ))}
      </div>
      
      <EmployeeModal 
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSubmit={handleAddEmployee}
        departments={[
          { value: "sales", label: "Sales" },
          { value: "engineering", label: "Engineering" },
          { value: "product", label: "Product" },
          { value: "customerSupport", label: "Customer Support" }
        ]}
      />
      
      <DepartmentModal 
        isOpen={isDepartmentModalOpen}
        onClose={() => setIsDepartmentModalOpen(false)}
        onSubmit={handleAddDepartment}
        parentDepartments={[
          { value: "none", label: "None (Top Level)" },
          { value: "sales", label: "Sales" },
          { value: "marketing", label: "Marketing" },
          { value: "operations", label: "Operations" }
        ]}
        managers={[
          { value: "user1", label: "John Doe" },
          { value: "user2", label: "Jane Smith" },
          { value: "user3", label: "Robert Johnson" }
        ]}
      />
    </div>
  );
};

export default Department;
