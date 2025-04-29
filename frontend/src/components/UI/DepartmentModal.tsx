import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Select } from "./select";
import { Label } from "./label";
import "../../styles/DepartmentModal.css";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (departmentData: DepartmentData) => void;
  managers: { value: string; label: string }[];
  department?: DepartmentData | null;
  onChange?: () => void;
}

export interface DepartmentData {
  name: string;
  description: string;
  manager: string;
  teamName: string;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  managers,
  department = null,
  onChange
}) => {
  const [departmentData, setDepartmentData] = useState<DepartmentData>({
    name: "",
    description: "",
    manager: "",
    teamName: ""
  });
  
  const [initialData, setInitialData] = useState<DepartmentData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    if (department) {
      const data = {
        name: department.name || "",
        description: department.description || "",
        manager: department.manager || "",
        teamName: department.teamName || ""
      };
      setDepartmentData(data);
      setInitialData(data);
      setHasChanges(false);
    } else {
      setDepartmentData({
        name: "",
        description: "",
        manager: "",
        teamName: ""
      });
      setInitialData(null);
      setHasChanges(false);
    }
  }, [department, isOpen]);
  
  useEffect(() => {
    if (initialData) {
      const changed = 
        initialData.name !== departmentData.name ||
        initialData.description !== departmentData.description ||
        initialData.manager !== departmentData.manager ||
        initialData.teamName !== departmentData.teamName;
      
      setHasChanges(changed);
      if (changed && onChange) {
        onChange();
      }
    }
  }, [departmentData, initialData, onChange]);

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

  const isEditMode = !!department;
  const buttonDisabled = isEditMode && !hasChanges;

  return (
    <div className="department-modal-overlay">
      <div className="department-modal-container">
        <div className="department-modal-header">
          <h2 className="department-modal-title">
            {isEditMode ? "Edit Department" : "Create New Department"}
          </h2>
          <p className="department-modal-description">
            {isEditMode ? "Update department information" : "Add a new department to your organization"}
          </p>
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
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              name="teamName"
              value={departmentData.teamName}
              onChange={handleChange}
              placeholder="Team Name"
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
            <Button type="submit" disabled={buttonDisabled}>
              {isEditMode ? "Save Changes" : "Create Department"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal; 