import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Select } from "./select";
import { Label } from "./label";
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
    }
  }, [isOpen, departments, prefillTeam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmployeeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(employeeData);
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