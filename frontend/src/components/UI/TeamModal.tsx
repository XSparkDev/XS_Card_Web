import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./selectRadix";
import { FaTimes, FaSave } from "react-icons/fa";
import "../../styles/TeamModal.css";

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamData: any) => Promise<void>;
  departmentId: string;
  departmentName: string;
  team?: any;
  employees: any[];
}

interface TeamFormData {
  name: string;
  description: string;
  leaderId: string; // Can be "none" for no leader, or employee ID
}

const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  departmentId,
  departmentName,
  team,
  employees
}) => {
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    description: "",
    leaderId: "none"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when team prop changes
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || "",
        description: team.description || "",
        leaderId: team.leaderId || "none"
      });
    } else {
      setFormData({
        name: "",
        description: "",
        leaderId: "none"
      });
    }
    setError(null);
  }, [team]);

  const handleInputChange = (field: keyof TeamFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Team name is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Team description is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Convert "none" to empty string for backend
      const submitData = {
        ...formData,
        leaderId: formData.leaderId === "none" ? "" : formData.leaderId
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save team");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="team-modal-overlay">
      <div className="team-modal-container">
        <div className="team-modal-header">
          <h2 className="team-modal-title">
            {team ? "Edit Team" : "Create New Team"}
          </h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="team-modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <Label htmlFor="teamName">Team Name *</Label>
            <Input
              id="teamName"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter team name"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="teamDescription">Description *</Label>
            <textarea
              id="teamDescription"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter team description"
              disabled={loading}
              required
              rows={3}
              className="team-description-input"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="teamLeader">Team Leader</Label>
            <Select
              value={formData.leaderId}
              onValueChange={(value: string) => handleInputChange("leaderId", value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team leader (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No leader assigned</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} - {employee.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="team-modal-info">
            <p><strong>Department:</strong> {departmentName}</p>
            <p><strong>Department ID:</strong> {departmentId}</p>
          </div>

          <div className="team-modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="save-button"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <FaSave />
                  {team ? "Update Team" : "Create Team"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal; 