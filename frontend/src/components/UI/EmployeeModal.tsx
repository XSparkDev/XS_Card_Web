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
  jobTitle: string;
  department: string;
  startDate: string;
  employeeId: string;
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
    jobTitle: "",
    department: "",
    startDate: "",
    employeeId: ""
  });

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
          <p className="employee-modal-description">Enter the details of the new employee</p>
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
          
          <div className="employee-modal-form-group">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={employeeData.email}
              onChange={handleChange}
              placeholder="john.doe@company.com"
              required
            />
          </div>
          
          <div className="employee-modal-form-group">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={employeeData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div className="employee-modal-form-group">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              value={employeeData.jobTitle}
              onChange={handleChange}
              placeholder="Software Developer"
              required
            />
          </div>
          
          <div className="employee-modal-form-group">
            <Label htmlFor="department">Department</Label>
            <Select
              id="department"
              name="department"
              value={employeeData.department}
              onChange={handleChange}
              options={departments}
              placeholder="Select a department"
            />
          </div>
          
          
          
          <div className="employee-modal-form-group">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              name="employeeId"
              value={employeeData.employeeId}
              onChange={handleChange}
              placeholder="EMP-001"
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