import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Select } from "./select";
import { Label } from "./label";
import { getAvailableTemplatesForDepartment, Template, fetchAllEmployees, searchEmployees, Employee } from "../../utils/api";
import "../../styles/EmployeeModal.css";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employeeData: EmployeeData) => void;
  departments: { value: string; label: string }[];
  prefillTeam?: { id: string; name: string } | null;
}

export interface EmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  team: string;
  title: string;
  role: string;
  selectedTemplate?: Template;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  departments,
  prefillTeam = null
}) => {
  const teams = [
    { value: "engineering", label: "Engineering Team" },
    { value: "design", label: "Design Team" },
    { value: "marketing", label: "Marketing Team" },
    { value: "sales", label: "Sales Team" },
    { value: "support", label: "Customer Support" },
    { value: "product", label: "Product Management" }
  ];

  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    team: "",
    title: "",
    role: ""
  });

  // Employee search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [availableTemplates, setAvailableTemplates] = useState<{
    departmentTemplates: Template[];
    enterpriseTemplates: Template[];
    defaultTemplate: Template;
  }>({
    departmentTemplates: [],
    enterpriseTemplates: [],
    defaultTemplate: {
      id: 'default',
      name: 'Default Template',
      description: 'Default card template with standard styling',
      colorScheme: '#1B2B5B',
      companyLogo: null,
      departmentId: null,
      isEnterprise: false
    }
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [isSelectingEmployee, setIsSelectingEmployee] = useState(false);

  const roleOptions = [
    { value: "employee", label: "Employee" },
    { value: "manager", label: "Manager" },
    { value: "admin", label: "Admin" }
  ];

  // Reset form when modal opens/closes or prefillTeam changes
  useEffect(() => {
    if (isOpen) {
      const initialData: EmployeeData = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "",
        department: departments.length > 0 ? departments[0].value : "",
        team: prefillTeam ? prefillTeam.id : "",
        title: "",
        role: "employee"
      };
      setEmployeeData(initialData);
      setSelectedTemplate(null);
      setTemplateError(null);
      setSearchTerm("");
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchError(null);
    }
  }, [isOpen, departments, prefillTeam]);

  // Fetch templates when department changes
  useEffect(() => {
    if (isOpen && employeeData.department && !isSelectingEmployee) {
      fetchTemplatesForDepartment(employeeData.department);
    }
  }, [isOpen, employeeData.department, isSelectingEmployee]);

  // Employee search with debouncing
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim().length === 0) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      if (searchTerm.trim().length < 2) {
        return; // Don't search until at least 2 characters
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const response = await searchEmployees(searchTerm);
        if (response.success) {
          setSearchResults(response.data.employees);
          setShowSearchResults(true);
        } else {
          setSearchError(response.message || 'Search failed');
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching employees:', error);
        setSearchError('Failed to search employees');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // 300ms debounce
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchTemplatesForDepartment = async (departmentId: string) => {
    setIsLoadingTemplates(true);
    setTemplateError(null);
    
    try {
      const templates = await getAvailableTemplatesForDepartment(departmentId);
      setAvailableTemplates(templates);
      
      // Check if current selected template is still valid for this department
      const allTemplates = [
        ...templates.departmentTemplates,
        ...templates.enterpriseTemplates,
        templates.defaultTemplate
      ];
      
      const currentTemplateStillValid = selectedTemplate && 
        allTemplates.some(t => t.id === selectedTemplate.id);
      
      if (currentTemplateStillValid) {
        // Keep the current template if it's still valid
      } else {
        // Auto-select the first available template (prefer department template, then enterprise, then default)
        let autoSelectedTemplate: Template | null = null;
        
        if (templates.departmentTemplates.length > 0) {
          autoSelectedTemplate = templates.departmentTemplates[0];
        } else if (templates.enterpriseTemplates.length > 0) {
          autoSelectedTemplate = templates.enterpriseTemplates[0];
        } else {
          autoSelectedTemplate = templates.defaultTemplate;
        }
        
        setSelectedTemplate(autoSelectedTemplate);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplateError('Failed to load templates. Using default template.');
      setSelectedTemplate(availableTemplates.defaultTemplate);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmployeeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setIsSelectingEmployee(true);
    
    setEmployeeData(prev => ({
      ...prev,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || "",
      position: employee.position || "",
      title: employee.title || "",
      department: employee.departmentId || prev.department
    }));
    
    // Set search term with proper handling of undefined values
    const fullName = [employee.firstName, employee.lastName]
      .filter(name => name && name.trim())
      .join(' ');
    setSearchTerm(fullName || '');
    setShowSearchResults(false);
    
    // Reset the flag after a short delay to allow state updates to complete
    setTimeout(() => setIsSelectingEmployee(false), 100);
  };

  const handleTemplateChange = (templateId: string) => {
    const allTemplates = [
      ...availableTemplates.departmentTemplates,
      ...availableTemplates.enterpriseTemplates,
      availableTemplates.defaultTemplate
    ];
    
    const selected = allTemplates.find(t => t.id === templateId);
    setSelectedTemplate(selected || availableTemplates.defaultTemplate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employeeDataWithTemplate = {
      ...employeeData,
      selectedTemplate: selectedTemplate || availableTemplates.defaultTemplate
    };
    onSubmit(employeeDataWithTemplate);
  };

  // Create template options for dropdown
  const getTemplateOptions = () => {
    const options: { value: string; label: string; group?: string }[] = [];
    
    // Department templates
    if (availableTemplates.departmentTemplates.length > 0) {
      options.push({ value: 'dept-header', label: '── Department Templates ──', group: 'department' });
      availableTemplates.departmentTemplates.forEach(template => {
        options.push({ 
          value: template.id, 
          label: `${template.name} (Department Template)`,
          group: 'department'
        });
      });
    }
    
    // Enterprise templates
    if (availableTemplates.enterpriseTemplates.length > 0) {
      options.push({ value: 'enterprise-header', label: '── Enterprise Templates ──', group: 'enterprise' });
      availableTemplates.enterpriseTemplates.forEach(template => {
        options.push({ 
          value: template.id, 
          label: `${template.name} (Enterprise Template)`,
          group: 'enterprise'
        });
      });
    }
    
    // Default template
    options.push({ value: 'default-header', label: '── Default ──', group: 'default' });
    options.push({ 
      value: availableTemplates.defaultTemplate.id, 
      label: `${availableTemplates.defaultTemplate.name} (Fallback)`,
      group: 'default'
    });
    
    return options;
  };

  if (!isOpen) return null;

  return (
    <div className="employee-modal-overlay">
      <div className="employee-modal-container">
        <div className="employee-modal-header">
          <h2 className="employee-modal-title">
            {prefillTeam ? `Add Employee to ${prefillTeam.name}` : "Add New Employee"}
          </h2>
          <p className="employee-modal-description">
            {prefillTeam ? `Add a new employee to the ${prefillTeam.name} team` : "Enter employee information"}
          </p>
          <button 
            className="employee-modal-close" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="employee-modal-form">
          {/* Employee Search Section */}
          <div className="employee-modal-form-group">
            <Label htmlFor="employeeSearch">Search Existing Employees</Label>
            <div className="employee-search-container">
              <Input
                id="employeeSearch"
                name="employeeSearch"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name or employee number..."
                disabled={isSearching}
              />
              {isSearching && (
                <div className="search-loading">
                  <span>Searching...</span>
                </div>
              )}
              {searchError && (
                <div className="search-error">
                  <span>{searchError}</span>
                </div>
              )}
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((employee) => (
                    <div
                      key={employee.id}
                      className="search-result-item"
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <div className="employee-info">
                        <span className="employee-name">
                          {employee.firstName} {employee.lastName}
                        </span>
                        <span className="employee-details">
                          {employee.email} • {employee.employeeNumber || 'No ID'} • {employee.departmentName || 'No Department'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="employee-modal-form-grid">
            <div className="employee-modal-form-group">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={employeeData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
              />
            </div>
            
            <div className="employee-modal-form-group">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={employeeData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>
          </div>
          
          <div className="employee-modal-form-grid">
            <div className="employee-modal-form-group">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={employeeData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                required
              />
            </div>
            
            <div className="employee-modal-form-group">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={employeeData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          <div className="employee-modal-form-grid">
            <div className="employee-modal-form-group">
              <Label htmlFor="department">Department</Label>
              <Select
                id="department"
                name="department"
                value={employeeData.department}
                onChange={handleChange}
                options={departments}
                placeholder="Select department"
                required
                disabled={departments.length === 1} // Disable if only one department
              />
            </div>
            
            <div className="employee-modal-form-group">
              <Label htmlFor="team">Team</Label>
              <Select
                id="team"
                name="team"
                value={employeeData.team}
                onChange={handleChange}
                options={teams}
                placeholder="Select a team"
                disabled={!!prefillTeam} // Disable if team is pre-filled
              />
            </div>
          </div>
          
          <div className="employee-modal-form-group">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              name="title"
              value={employeeData.title}
              onChange={handleChange}
              placeholder="Software Engineer"
              required
            />
          </div>
          
          <div className="employee-modal-form-group">
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              name="role"
              value={employeeData.role}
              onChange={handleChange}
              options={roleOptions}
              placeholder="Select role"
              required
            />
          </div>

          {/* Template Selection Section */}
          <div className="employee-modal-form-group">
            <Label htmlFor="template">Card Template</Label>
            <div className="template-selection-container">
              {isLoadingTemplates ? (
                <div className="template-loading">
                  <span>Loading templates...</span>
                </div>
              ) : (
                <Select
                  id="template"
                  name="template"
                  value={selectedTemplate?.id ?? ''}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  options={getTemplateOptions()}
                  placeholder="Select template"
                  disabled={isLoadingTemplates}
                />
              )}
              {templateError && (
                <div className="template-error">
                  <span>{templateError}</span>
                </div>
              )}
              {selectedTemplate && (
                <div className="template-preview">
                  <div 
                    className="template-color-preview"
                    style={{ backgroundColor: selectedTemplate.colorScheme }}
                  ></div>
                  <span className="template-name">{selectedTemplate.name}</span>
                  {selectedTemplate.description && (
                    <span className="template-description">{selectedTemplate.description}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="employee-modal-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {prefillTeam ? `Add to ${prefillTeam.name}` : "Add Employee"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal; 