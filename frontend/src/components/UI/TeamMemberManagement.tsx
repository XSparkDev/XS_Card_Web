import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { FaUsers, FaPlus, FaTimes, FaCrown } from "react-icons/fa";
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders } from "../../utils/api";
import "../../styles/TeamMemberManagement.css";

interface TeamMemberManagementProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  departmentId: string;
  departmentName: string;
}

interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  teamId?: string;
}

interface TeamMemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  isLeader: boolean;
}

const TeamMemberManagement: React.FC<TeamMemberManagementProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  departmentId,
  departmentName
}) => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningEmployee, setAssigningEmployee] = useState<string | null>(null);
  const [removingEmployee, setRemovingEmployee] = useState<string | null>(null);
  const [assigningLeader, setAssigningLeader] = useState<string | null>(null);

  // Fetch employees and team members
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all department employees
      const employeesUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/employees`);
      const headers = getEnterpriseHeaders();
      
      const employeesResponse = await fetch(employeesUrl, { headers });
      if (!employeesResponse.ok) {
        throw new Error(`Failed to fetch employees: ${employeesResponse.status}`);
      }
      
      const employeesData = await employeesResponse.json();
      console.log('Employees data:', employeesData);
      const employeesArray = employeesData.employees ? Object.values(employeesData.employees) : [];
      setEmployees(employeesArray as EmployeeData[]);

      // Fetch team members
      const membersUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}/members`);
      const membersResponse = await fetch(membersUrl, { headers });
      if (!membersResponse.ok) {
        throw new Error(`Failed to fetch team members: ${membersResponse.status}`);
      }
      
      const membersData = await membersResponse.json();
      console.log('Team members data:', membersData);
      
      // Handle different possible response formats
      let membersArray: TeamMemberData[] = [];
      if (membersData.members) {
        membersArray = Object.values(membersData.members) as TeamMemberData[];
      } else if (Array.isArray(membersData)) {
        membersArray = membersData as TeamMemberData[];
      } else if (membersData.data && Array.isArray(membersData.data)) {
        membersArray = membersData.data as TeamMemberData[];
      }
      
      // Ensure each member has the required fields
      membersArray = membersArray.map(member => {
        const memberAny = member as any;
        return {
          id: memberAny.id || memberAny.employeeId || memberAny._id || '',
          firstName: memberAny.firstName || memberAny.first_name || (memberAny.name?.split(' ')[0] || ''),
          lastName: memberAny.lastName || memberAny.last_name || (memberAny.name?.split(' ').slice(1).join(' ') || ''),
          email: memberAny.email || '',
          position: memberAny.position || memberAny.role || '',
          isLeader: memberAny.isLeader || memberAny.is_leader || memberAny.leader || false
        };
      });
      
      setTeamMembers(membersArray);

    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      console.error("Error fetching team member data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && teamId) {
      fetchData();
    }
  }, [isOpen, teamId, departmentId]);

  const handleAssignEmployee = async (employeeId: string) => {
    try {
      setAssigningEmployee(employeeId);
      setError(null);

      const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}/employees`);
      const headers = getEnterpriseHeaders();
      
      console.log('Assigning employee to team:', { url, employeeId, teamId });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employeeId })
      });

      console.log('Assign employee response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Assign employee error response:', errorText);
        throw new Error(`Failed to assign employee: ${response.status} - ${errorText}`);
      }

      // Refresh the data to get updated team members
      await fetchData();
      
    } catch (err: any) {
      setError(err.message || "Failed to assign employee");
      console.error("Error assigning employee:", err);
    } finally {
      setAssigningEmployee(null);
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    try {
      setRemovingEmployee(employeeId);
      setError(null);

      const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}/employees/${employeeId}`);
      const headers = getEnterpriseHeaders();
      
      console.log('Removing employee from team:', { url, employeeId, teamId });
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });

      console.log('Remove employee response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Remove employee error response:', errorText);
        throw new Error(`Failed to remove employee: ${response.status} - ${errorText}`);
      }

      // Refresh the data to get updated team members
      await fetchData();
      
    } catch (err: any) {
      setError(err.message || "Failed to remove employee");
      console.error("Error removing employee:", err);
    } finally {
      setRemovingEmployee(null);
    }
  };

  const handleAssignLeader = async (employeeId: string) => {
    try {
      setAssigningLeader(employeeId);
      setError(null);

      const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}`);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leaderId: employeeId })
      });

      if (!response.ok) {
        throw new Error(`Failed to assign leader: ${response.status}`);
      }

      // Refresh the data to get updated team members
      await fetchData();
      
    } catch (err: any) {
      setError(err.message || "Failed to assign leader");
      console.error("Error assigning leader:", err);
    } finally {
      setAssigningLeader(null);
    }
  };

  const getAvailableEmployees = () => {
    const assignedEmployeeIds = teamMembers.map(member => member.id);
    console.log('Available employees calculation:', {
      totalEmployees: employees.length,
      assignedEmployeeIds,
      teamMembersCount: teamMembers.length
    });
    return employees.filter(employee => !assignedEmployeeIds.includes(employee.id));
  };

  console.log('TeamMemberManagement render - isOpen:', isOpen, 'teamId:', teamId, 'teamName:', teamName);
  
  if (!isOpen) return null;

  return (
    <div className="team-member-management-overlay">
      <div className="team-member-management-container">
        <div className="team-member-management-header">
          <div>
            <h2 className="team-member-management-title">Team Members - {teamName}</h2>
            <p className="team-member-management-subtitle">Manage team members in {departmentName}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading team members...</div>
        ) : (
          <div className="team-member-content">
            {/* Current Team Members */}
            <div className="team-members-section">
              <h3 className="section-title">
                <FaUsers />
                Current Team Members ({teamMembers.length})
              </h3>
              
              {teamMembers.length === 0 ? (
                <div className="empty-state">
                  <p>No team members assigned yet</p>
                </div>
              ) : (
                <div className="team-members-list">
                  {teamMembers.map(member => (
                    <div key={member.id} className="team-member-item">
                      <div className="member-info">
                        <div className="member-name">
                          {member.firstName} {member.lastName}
                          {member.isLeader && <FaCrown className="leader-icon" title="Team Leader" />}
                        </div>
                        <div className="member-details">
                          <span className="member-position">{member.position}</span>
                          <span className="member-email">{member.email}</span>
                        </div>
                      </div>
                      <div className="member-actions">
                        {!member.isLeader && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignLeader(member.id)}
                            disabled={assigningLeader === member.id}
                            className="assign-leader-button"
                          >
                            {assigningLeader === member.id ? (
                              "Assigning..."
                            ) : (
                              <>
                                <FaCrown />
                                Make Leader
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveEmployee(member.id)}
                          disabled={removingEmployee === member.id}
                          className="remove-member-button"
                        >
                          {removingEmployee === member.id ? (
                            "Removing..."
                          ) : (
                            <>
                              <FaTimes />
                              Remove
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Employees */}
            <div className="available-employees-section">
              <h3 className="section-title">
                <FaPlus />
                Available Employees ({getAvailableEmployees().length})
              </h3>
              
              {getAvailableEmployees().length === 0 ? (
                <div className="empty-state">
                  <p>All employees are already assigned to teams</p>
                </div>
              ) : (
                <div className="available-employees-list">
                  {getAvailableEmployees().map(employee => (
                    <div key={employee.id} className="available-employee-item">
                      <div className="employee-info">
                        <div className="employee-name">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="employee-details">
                          <span className="employee-position">{employee.position}</span>
                          <span className="employee-email">{employee.email}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAssignEmployee(employee.id)}
                        disabled={assigningEmployee === employee.id}
                        className="assign-employee-button"
                      >
                        {assigningEmployee === employee.id ? (
                          "Assigning..."
                        ) : (
                          <>
                            <FaPlus />
                            Add to Team
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberManagement; 