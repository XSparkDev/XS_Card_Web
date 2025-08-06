import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { FaEllipsisV, FaTrash, FaEdit, FaPlus, FaUsers, FaCrown, FaUserPlus } from "react-icons/fa";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import TeamModal from "./TeamModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import TeamMemberManagement from "./TeamMemberManagement";
import EmployeeModal from "./EmployeeModal";
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders, API_BASE_URL, FIREBASE_TOKEN } from "../../utils/api";
import "../../styles/TeamManagement.css";

interface TeamManagementProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: string;
  departmentName: string;
}

interface TeamData {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  createdAt: any;
  updatedAt: any;
  leaderId: string | null;
  leaderRef: any;
  memberCount: number;
}

interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({
  isOpen,
  onClose,
  departmentId,
  departmentName
}) => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<TeamData | null>(null);
  const [isTeamMemberManagementOpen, setIsTeamMemberManagementOpen] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<TeamData | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Add employee modal state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedTeamForEmployee, setSelectedTeamForEmployee] = useState<TeamData | null>(null);
  const [employeeCreating, setEmployeeCreating] = useState(false);

  // Fetch teams and employees for this department
  const fetchTeamsAndEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch teams
      const teamsUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams`);
      const headers = getEnterpriseHeaders();
      
      const teamsResponse = await fetch(teamsUrl, { headers });
      if (!teamsResponse.ok) {
        throw new Error(`Failed to fetch teams: ${teamsResponse.status}`);
      }
      
      const teamsData = await teamsResponse.json();
      const teamsArray = teamsData.teams ? Object.values(teamsData.teams) : [];
      setTeams(teamsArray as TeamData[]);

      // Fetch employees
      const employeesUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/employees`);
      const employeesResponse = await fetch(employeesUrl, { headers });
      if (!employeesResponse.ok) {
        throw new Error(`Failed to fetch employees: ${employeesResponse.status}`);
      }
      
      const employeesData = await employeesResponse.json();
      const employeesArray = employeesData.employees ? Object.values(employeesData.employees) : [];
      setEmployees(employeesArray as EmployeeData[]);

    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      console.error("Error fetching teams and employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && departmentId) {
      fetchTeamsAndEmployees();
    }
  }, [isOpen, departmentId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.custom-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setIsTeamModalOpen(true);
  };

  const handleEditTeam = (team: TeamData) => {
    setEditingTeam(team);
    setIsTeamModalOpen(true);
  };

  const handleDeleteTeam = (team: TeamData) => {
    setTeamToDelete(team);
    setDeleteConfirmOpen(true);
  };

  const handleSubmitTeam = async (teamData: any) => {
    try {
      const headers = getEnterpriseHeaders();
      
      if (editingTeam) {
        // Update existing team
        const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${editingTeam.id}`);
        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(teamData)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update team: ${response.status}`);
        }
      } else {
        // Create new team
        const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams`);
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(teamData)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create team: ${response.status}`);
        }
      }

      // Refresh the teams list
      await fetchTeamsAndEmployees();
      setIsTeamModalOpen(false);
      setEditingTeam(null);
    } catch (err: any) {
      throw new Error(err.message || "Failed to save team");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return;

    try {
      const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamToDelete.id}`);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to delete team: ${response.status}`);
      }

      // Remove the team from state
      setTeams(teams.filter(team => team.id !== teamToDelete.id));
      setDeleteConfirmOpen(false);
      setTeamToDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete team");
      console.error("Error deleting team:", err);
    }
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setTeamToDelete(null);
  };

  const handleManageMembers = (team: TeamData) => {
    console.log('handleManageMembers called with team:', team);
    alert(`Opening team member management for: ${team.name}`);
    setSelectedTeamForMembers(team);
    setIsTeamMemberManagementOpen(true);
    console.log('State updated - selectedTeamForMembers:', team, 'isTeamMemberManagementOpen: true');
  };

  // Add employee to team functionality
  const handleAddEmployeeToTeam = (team: TeamData) => {
    setSelectedTeamForEmployee(team);
    setIsEmployeeModalOpen(true);
  };

  // Helper function to fetch effective template for a department
  const fetchEffectiveTemplate = async (departmentId: string) => {
    try {
      const enterpriseId = localStorage.getItem('enterpriseId') || 'x-spark-test';
      const templateUrl = `${API_BASE_URL}/api/templates/${enterpriseId}/${departmentId}/effective`;
      
      console.log('Fetching effective template:', templateUrl);
      
      const response = await fetch(templateUrl, {
        headers: {
          'Authorization': `Bearer ${FIREBASE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn('Template fetch failed, using defaults:', response.status);
        return {
          colorScheme: '#1B2B5B',
          companyLogo: null
        };
      }
      
      const result = await response.json();
      console.log('Template response:', result);
      
      if (result.success && result.data && result.data.template) {
        return {
          colorScheme: result.data.template.colorScheme,
          companyLogo: result.data.template.companyLogo,
          templateId: result.data.template.id,
          templateName: result.data.template.name,
          templateSource: result.data.source
        };
      } else if (result.fallback) {
        return {
          colorScheme: result.fallback.colorScheme,
          companyLogo: result.fallback.companyLogo
        };
      } else {
        return {
          colorScheme: '#1B2B5B',
          companyLogo: null
        };
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      return {
        colorScheme: '#1B2B5B',
        companyLogo: null
      };
    }
  };

  const handleAddEmployee = async (employeeData: any) => {
    try {
      setEmployeeCreating(true);
      console.log('Employee modal submitted with data:', employeeData);
      
      // Use the selected template from the modal, or fetch the effective template as fallback
      let templateData;
      if (employeeData.selectedTemplate) {
        console.log('🎨 Using selected template:', employeeData.selectedTemplate.name);
        templateData = {
          colorScheme: employeeData.selectedTemplate.colorScheme,
          companyLogo: employeeData.selectedTemplate.companyLogo,
          templateId: employeeData.selectedTemplate.id,
          templateName: employeeData.selectedTemplate.name,
          templateSource: employeeData.selectedTemplate.isEnterprise ? 'enterprise' : 'department'
        };
      } else {
        // Fallback to fetching effective template
        console.log('🎨 Fetching effective template for department:', departmentId);
        templateData = await fetchEffectiveTemplate(departmentId);
        console.log('Template data for employee:', templateData);
      }
      
      // Use the same endpoint as the main department page
      const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/employees`);
      const headers = getEnterpriseHeaders();
      
      // Create the employee object to send to the server (matching the backend API format)
      const employeeToCreate = {
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        phone: employeeData.phone,
        position: employeeData.position || employeeData.title,
        role: employeeData.role || "employee",
        teamId: selectedTeamForEmployee?.id, // Add the team ID
        // Include template data for automatic card creation
        template: templateData
      };
      
      console.log('Sending employee data with template:', employeeToCreate);
      
      // Make the POST request to create an employee
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(employeeToCreate)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const newEmployee = await response.json();
      console.log('New employee created:', newEmployee);
      
      // Refresh the data
      await fetchTeamsAndEmployees();
      
      // Close the modal
      setIsEmployeeModalOpen(false);
      setSelectedTeamForEmployee(null);
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Failed to create employee. Please try again.');
    } finally {
      setEmployeeCreating(false);
    }
  };

  const getLeaderName = (leaderId: string | null) => {
    if (!leaderId) return "No leader assigned";
    const leader = employees.find(emp => emp.id === leaderId);
    return leader ? `${leader.firstName} ${leader.lastName}` : "Unknown leader";
  };

  if (!isOpen) return null;

  return (
    <div className="team-management-overlay">
      <div className="team-management-container">
        <div className="team-management-header">
          <div>
            <h2 className="team-management-title">Teams in {departmentName}</h2>
            <p className="team-management-subtitle">Manage teams and assign employees</p>
          </div>
          <div className="team-management-actions">
            <Button onClick={handleCreateTeam} className="create-team-button">
              <FaPlus />
              New Team
            </Button>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading teams...</div>
        ) : (
          <div className="teams-content">
            {teams.length === 0 ? (
              <div className="empty-state">
                <FaUsers className="empty-icon" />
                <h3>No teams yet</h3>
                <p>Create your first team to get started</p>
                <Button onClick={handleCreateTeam}>
                  <FaPlus />
                  Create Team
                </Button>
              </div>
            ) : (
              <div className="teams-grid">
                {teams.map(team => (
                  <div key={team.id} className="team-card">
                    <div className="team-card-header">
                      <div>
                        <h3 className="team-name">{team.name}</h3>
                        <p className="team-description">{team.description}</p>
                      </div>
                      <div className="team-actions">
                        <div className="custom-dropdown">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="more-button"
                            onClick={() => setOpenDropdown(openDropdown === team.id ? null : team.id)}
                          >
                            <FaEllipsisV />
                          </Button>
                          
                          <div className={`dropdown-menu ${openDropdown === team.id ? 'show' : ''}`}>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleEditTeam(team)}
                            >
                              <FaEdit className="action-icon" />
                              <span>Edit</span>
                            </button>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleAddEmployeeToTeam(team)}
                            >
                              <FaUserPlus className="action-icon" />
                              <span>Add Employee</span>
                            </button>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleManageMembers(team)}
                            >
                              <FaUsers className="action-icon" />
                              <span>Manage Members</span>
                            </button>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleDeleteTeam(team)}
                            >
                              <FaTrash className="action-icon" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="team-stats">
                      <div className="team-stat">
                        <FaUsers className="stat-icon" />
                        <span>{team.memberCount} members</span>
                      </div>
                      <div className="team-stat">
                        <FaCrown className="stat-icon" />
                        <span>{getLeaderName(team.leaderId)}</span>
                      </div>
                    </div>
                    
                    <div className="team-footer">
                      <span className="team-created">
                        Created {new Date(team.createdAt?.toDate?.() || team.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <TeamModal
          isOpen={isTeamModalOpen}
          onClose={() => {
            setIsTeamModalOpen(false);
            setEditingTeam(null);
          }}
          onSubmit={handleSubmitTeam}
          departmentId={departmentId}
          departmentName={departmentName}
          team={editingTeam}
          employees={employees}
        />

        <DeleteConfirmationModal
          isOpen={deleteConfirmOpen}
          onClose={closeDeleteConfirm}
          onConfirm={handleDeleteConfirm}
          title="Delete Team"
          message="Are you sure you want to delete this team? This action cannot be undone."
          itemName={teamToDelete?.name}
        />

        <TeamMemberManagement
          isOpen={isTeamMemberManagementOpen}
          onClose={() => {
            setIsTeamMemberManagementOpen(false);
            setSelectedTeamForMembers(null);
          }}
          teamId={selectedTeamForMembers?.id || ""}
          teamName={selectedTeamForMembers?.name || ""}
          departmentId={departmentId}
          departmentName={departmentName}
        />

        {/* Add Employee Modal */}
        <EmployeeModal 
          isOpen={isEmployeeModalOpen}
          onClose={() => {
            setIsEmployeeModalOpen(false);
            setSelectedTeamForEmployee(null);
          }}
          onSubmit={handleAddEmployee}
          departments={[{ value: departmentId, label: departmentName }]}
          prefillTeam={selectedTeamForEmployee}
          isLoading={employeeCreating}
        />
      </div>
    </div>
  );
};

export default TeamManagement; 