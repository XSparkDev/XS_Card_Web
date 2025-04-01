import React, { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Select } from "./select";
import { Label } from "./label";
import "../../styles/DepartmentModal.css";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (departmentData: DepartmentData) => void;
  parentDepartments: { value: string; label: string }[];
  managers: { value: string; label: string }[];
}

export interface DepartmentData {
  name: string;
  description: string;
  parentDepartment: string;
  manager: string;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentDepartments,
  managers
}) => {
  const [departmentData, setDepartmentData] = useState<DepartmentData>({
    name: "",
    description: "",
    parentDepartment: "",
    manager: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDepartmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(departmentData);
  };

  if (!isOpen) return null;

  return (
    <div className="department-modal-overlay">
      <div className="department-modal-container">
        <div className="department-modal-header">
          <h2 className="department-modal-title">Create New Department</h2>
          <p className="department-modal-description">Add a new department to your organization</p>
          <button 
            className="department-modal-close" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="department-modal-form">
          <div className="department-modal-form-group">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              name="name"
              value={departmentData.name}
              onChange={handleChange}
              placeholder="Human Resources"
              required
            />
          </div>
          
          <div className="department-modal-form-group">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={departmentData.description}
              onChange={handleChange}
              placeholder="Department description..."
              className="department-description-input"
              rows={4}
            ></textarea>
          </div>
          
          <div className="department-modal-form-group">
            <Label htmlFor="parentDepartment">Parent Department</Label>
            <Select
              id="parentDepartment"
              name="parentDepartment"
              value={departmentData.parentDepartment}
              onChange={handleChange}
              options={parentDepartments}
              placeholder="Select a parent department"
            />
          </div>
          
          <div className="department-modal-form-group">
            <Label htmlFor="manager">Department Manager</Label>
            <Select
              id="manager"
              name="manager"
              value={departmentData.manager}
              onChange={handleChange}
              options={managers}
              placeholder="Select a manager"
            />
          </div>
          
          <div className="department-modal-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Department
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal; 