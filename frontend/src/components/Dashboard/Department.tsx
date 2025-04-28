// @ts-nocheck
import { useState, FC, useEffect } from "react";
import "../../styles/Department.css";
import EmployeeModal from '../UI/EmployeeModal';
import DepartmentModal from '../UI/DepartmentModal';
import { FaEllipsisV, FaTrash, FaEdit } from "react-icons/fa";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../UI/dropdown-menu";
import { Button } from "../UI/button";
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders } from "../../utils/api";

// Interface for the department data
interface DepartmentData {
  id?: string;
  name: string;
  description: string;
  employeeCount: number; // Will map from memberCount
  parentDepartmentId?: string | null;
  createdAt?: any;
  updatedAt?: any;
  cardCount: number;
  scanCount: number;
  progress: number;
  growthRate: number;
}

// Interface for card data from the API
interface CardData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  occupation: string;
  company: string;
  profileImage: string | null;
  companyLogo: string | null;
  socials: Record<string, string>;
  colorScheme: string;
  createdAt: string;
  userId: string;
  cardIndex: number;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  departmentId: string;
  departmentName: string;
}

// Department Card component
const DepartmentCard = ({ department }: { department: DepartmentData }) => {
  const handleDeleteDepartment = (id: string) => {
    console.log(`Delete department with id: ${id}`);
  };

  const handleEditDepartment = (id: string) => {
    console.log(`Edit department with id: ${id}`);
  };

  return (
    <div className="department-card">
      <div className="card-content">
        <div className="card-header">
          <div>
            <h3 className="card-title">{department.name}</h3>
            <p className="card-description">{department.description}</p>
          </div>
          
          <div className="department-actions">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="more-button">
                  <FaEllipsisV />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dropdown-content">
                <DropdownMenuItem onClick={() => handleEditDepartment(department.id)}>
                  <FaEdit className="action-icon" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteDepartment(department.id)}>
                  <FaTrash className="action-icon" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
            <i className="fas fa-chart-bar"></i>
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Organization Summary Card
const DepartmentsSummaryCard = ({ departments }) => {
  const totalEmployees = departments.reduce((acc, dept) => acc + dept.employeeCount, 0);
  const totalCards = departments.reduce((acc, dept) => acc + dept.cardCount, 0);
  const totalScans = departments.reduce((acc, dept) => acc + dept.scanCount, 0);
  
  // Calculate weighted average coverage based on actual employee counts
  // This gives the true organization-wide coverage percentage
  const weightedCoverage = totalEmployees > 0 ? (totalCards / totalEmployees) * 100 : 0;
  
  // For display purposes, round to 1 decimal place
  const displayCoverage = weightedCoverage.toFixed(1);
  
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
            <p className="summary-stat-value">{displayCoverage}%</p>
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
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch both departments and cards
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch departments
        const deptUrl = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_DEPARTMENTS);
        const headers = getEnterpriseHeaders();
        
        const deptResponse = await fetch(deptUrl, { headers });
        
        if (!deptResponse.ok) {
          throw new Error(`HTTP error for departments! Status: ${deptResponse.status}`);
        }
        
        const deptData = await deptResponse.json();
        console.log('Departments response:', deptData);
        
        if (!deptData.departments || !Array.isArray(deptData.departments)) {
          throw new Error('Invalid departments response format');
        }
        
        // Fetch cards
        const cardsUrl = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CARDS);
        const cardsResponse = await fetch(cardsUrl, { headers });
        
        if (!cardsResponse.ok) {
          throw new Error(`HTTP error for cards! Status: ${cardsResponse.status}`);
        }
        
        const cardsData = await cardsResponse.json();
        console.log('Cards response:', cardsData);
        
        // Store the cards data
        if (cardsData.cards && Array.isArray(cardsData.cards)) {
          setCards(cardsData.cards);
        }
        
        // Calculate card counts for each department
        const cardsByDepartment: Record<string, number> = {};
        
        // Initialize with 0 for all departments
        deptData.departments.forEach(dept => {
          cardsByDepartment[dept.id] = 0;
        });
        
        // Count cards per department
        if (cardsData.cards && Array.isArray(cardsData.cards)) {
          cardsData.cards.forEach(card => {
            if (card.departmentId && cardsByDepartment[card.departmentId] !== undefined) {
              cardsByDepartment[card.departmentId]++;
            }
          });
        }
        
        // Process department data with card counts
        const processedData = deptData.departments.map(dept => {
          // Calculate the progress percentage (card coverage)
          // If there are no employees, set progress to 0 to avoid division by zero
          const progress = dept.memberCount > 0 
            ? Math.round((cardsByDepartment[dept.id] || 0) / dept.memberCount * 100)
            : 0;
            
          return {
            id: dept.id,
            name: dept.name,
            description: dept.description,
            employeeCount: dept.memberCount,
            parentDepartmentId: dept.parentDepartmentId,
            createdAt: dept.createdAt,
            updatedAt: dept.updatedAt,
            // Use actual card count now
            cardCount: cardsByDepartment[dept.id] || 0,
            // Use calculated progress value
            progress: progress,
            // Still using default values for these
            scanCount: 0,
            growthRate: 0
          };
        });
        
        setDepartments(processedData);
        setError(null);
        
        console.log('Processed departments with card counts:', processedData);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const filteredDepartments = departments.filter(department => 
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
      
      {loading ? (
        <div className="loading-state">Loading departments...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <>
          <DepartmentsSummaryCard departments={departments} />
          
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
        </>
      )}
      
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
