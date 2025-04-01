import React, { useState } from "react";
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
}

export interface EmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  title: string;
  role: string;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  departments
}) => {
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    title: "",
    role: ""
  });

  const roleOptions = [
    { value: "employee", label: "Employee" },
    { value: "manager", label: "Manager" },
    { value: "admin", label: "Admin" }
  ];

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
          <h2 className="employee-modal-title">Add New Employee</h2>
          <p className="employee-modal-description">Enter employee information</p>
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
              />
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
              Add Employee
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal; 