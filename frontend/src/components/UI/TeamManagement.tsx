import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { FaEllipsisV, FaTrash, FaEdit, FaUsers, FaCrown } from "react-icons/fa";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import TeamModal from "./TeamModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import TeamMemberManagement from "./TeamMemberManagement";
import { buildEnterpriseUrl, getEnterpriseHeaders } from "../../utils/api";
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
  name: string;
  surname: string;
  email: string;
  position: string;
  role: string;
  phone: string;
  profileImage: string;
  employeeId: string;
  teamId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: any;
  migratedAt?: any;
  migratedFrom?: string;
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
  const [exportingTeam, setExportingTeam] = useState<string | null>(null);
  const [exportingAll, setExportingAll] = useState(false);
  
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
    if (isOpen) {
      fetchTeamsAndEmployees();
    }
  }, [isOpen, departmentId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.custom-dropdown')) {
        // Reset dropdown state if needed
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      if (editingTeam) {
        // Update existing team
        const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${editingTeam.id}`);
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(teamData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        console.log('Team updated successfully');
      } else {
        // Create new team
        const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams`);
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(teamData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        console.log('Team created successfully');
      }
      
      // Refresh data
      await fetchTeamsAndEmployees();
      
      // Close modal
      setIsTeamModalOpen(false);
      setEditingTeam(null);
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Failed to save team. Please try again.');
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
        if (response.status === 409) {
          // Team has employees - show user-friendly message
          alert(`Cannot delete team "${teamToDelete.name}" because it has ${teamToDelete.memberCount} employee(s). Please reassign or remove all employees from the team before deleting it.`);
          setDeleteConfirmOpen(false);
          setTeamToDelete(null);
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Remove team from state
      setTeams(teams.filter(team => team.id !== teamToDelete.id));
      setDeleteConfirmOpen(false);
      setTeamToDelete(null);
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team. Please try again.');
    }
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setTeamToDelete(null);
  };

  const handleManageMembers = (team: TeamData) => {
    console.log('handleManageMembers called with team:', team);
    setSelectedTeamForMembers(team);
    setIsTeamMemberManagementOpen(true);
  };

  const getLeaderName = (leaderId: string | null) => {
    if (!leaderId) return "No leader assigned";
    const leader = employees.find(emp => emp.id === leaderId);
    return leader ? `${leader.name} ${leader.surname}` : "Unknown leader";
  };

  // CSV Export Function for Individual Team
  const exportTeamCSV = async (team: TeamData) => {
    try {
      setExportingTeam(team.id);
      console.log('📊 Exporting individual team CSV:', team.name);
      
      const apiUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/exports/teams/${team.id}`);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Show downloading state
      console.log('📥 Downloading CSV file...');
      
      const blob = await response.blob();
      const link = document.createElement('a');
      const downloadUrl = URL.createObjectURL(blob);
      link.setAttribute('href', downloadUrl);
      link.setAttribute('download', `${team.name}_team.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Team CSV exported successfully');
    } catch (error) {
      console.error('Error exporting team CSV:', error);
      alert('Failed to export team CSV. Please try again.');
    } finally {
      setExportingTeam(null);
    }
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
            <button 
              className="header-button outline-button" 
              onClick={handleCreateTeam}
            >
              <i className="fas fa-plus"></i>
              New Team
            </button>
            <button 
              className="header-button outline-button" 
              onClick={async () => {
                try {
                  setExportingAll(true);
                  console.log('📊 Exporting enterprise teams CSV');
                  
                  const apiUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/exports/teams`);
                  const headers = getEnterpriseHeaders();
                  
                  const response = await fetch(apiUrl, { headers });
                  
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  
                  // Show downloading state
                  console.log('📥 Downloading CSV file...');
                  
                  const blob = await response.blob();
                  const link = document.createElement('a');
                  const downloadUrl = URL.createObjectURL(blob);
                  link.setAttribute('href', downloadUrl);
                  link.setAttribute('download', 'enterprise_teams.csv');
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  console.log('✅ Enterprise teams CSV exported successfully');
                } catch (error) {
                  console.error('Error exporting enterprise CSV:', error);
                  alert('Failed to export enterprise CSV. Please try again.');
                } finally {
                  setExportingAll(false);
                }
              }}
              disabled={exportingAll}
              title="Export all enterprise teams to CSV"
            >
              <i className="fas fa-download"></i>
              {exportingAll ? 'Exporting...' : 'Export All'}
            </button>
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
                <button 
                  className="header-button outline-button" 
                  onClick={handleCreateTeam}
                >
                  <i className="fas fa-plus"></i>
                  Create Team
                </button>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="more-button">
                              <FaEllipsisV />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="dropdown-content">
                            <DropdownMenuItem onClick={() => handleEditTeam(team)}>
                              <FaEdit className="action-icon" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageMembers(team)}>
                              <FaUsers className="action-icon" />
                              <span>Manage Members</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTeam(team)}>
                              <FaTrash className="action-icon" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                      <button 
                        className="team-export-button"
                        onClick={() => exportTeamCSV(team)}
                        disabled={exportingTeam === team.id}
                        title="Export team data to CSV"
                      >
                        <i className="fas fa-download"></i>
                        {exportingTeam === team.id ? 'Exporting...' : 'Export'}
                      </button>
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
      </div>
    </div>
  );
};

export default TeamManagement; 