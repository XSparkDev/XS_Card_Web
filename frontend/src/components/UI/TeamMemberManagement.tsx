import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { FaUsers, FaPlus, FaTimes, FaCrown, FaSave } from "react-icons/fa";
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
  userId: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
  position: string;
  profileImage: string;
  employeeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teamRef?: any;
  teamEmployeeRef?: any;
}

interface TeamMemberData {
  id: string; // Team employee ID (from teamEmployeeRef)
  mainEmployeeId: string; // Main employee ID (from employees collection)
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  isLeader: boolean;
}

interface PendingChange {
  type: 'add' | 'remove' | 'assign-leader';
  employeeId: string;
  employeeName?: string;
}

const TeamMemberManagement: React.FC<TeamMemberManagementProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  departmentId,
  departmentName
}) => {
  const [unassignedEmployees, setUnassignedEmployees] = useState<EmployeeData[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch all employees and team members
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getEnterpriseHeaders();

      // Fetch all employees in the department (not just unassigned)
      const allEmployeesUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/employees`);
      const allEmployeesResponse = await fetch(allEmployeesUrl, { headers });
      
      if (!allEmployeesResponse.ok) {
        throw new Error(`Failed to fetch employees: ${allEmployeesResponse.status}`);
      }
      
      const allEmployeesData = await allEmployeesResponse.json();
      console.log('All employees data:', allEmployeesData);
      const allEmployees = allEmployeesData.employees || [];

      // Fetch unassigned employees for the "available employees" section
      const unassignedUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/employees/unassigned`);
      const unassignedResponse = await fetch(unassignedUrl, { headers });
      
      if (!unassignedResponse.ok) {
        throw new Error(`Failed to fetch unassigned employees: ${unassignedResponse.status}`);
      }
      
      const unassignedData = await unassignedResponse.json();
      console.log('Unassigned employees data:', unassignedData);
      setUnassignedEmployees(unassignedData.employees || []);

      // Fetch team members
      const membersUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}/members`);
      const membersResponse = await fetch(membersUrl, { headers });
      
      if (!membersResponse.ok) {
        throw new Error(`Failed to fetch team members: ${membersResponse.status}`);
      }
      
      const membersData = await membersResponse.json();
      console.log('Team members data:', membersData);
      
      // Fetch team information to get the leader ID
      const teamUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}`);
      const teamResponse = await fetch(teamUrl, { headers });
      
      if (!teamResponse.ok) {
        throw new Error(`Failed to fetch team information: ${teamResponse.status}`);
      }
      
      const teamData = await teamResponse.json();
      console.log('Team data:', teamData);
      const teamInfo = teamData.team || teamData;
      const leaderId = teamInfo.leaderId;
      
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
        
        // Find the corresponding employee to get the main employee ID and details
        const correspondingEmployee = allEmployees.find((emp: any) => 
          emp.teamEmployeeRef?._path?.segments?.includes(memberAny.id)
        );
        
        const processedMember = {
          id: memberAny.id || memberAny.employeeId || memberAny._id || '',
          mainEmployeeId: correspondingEmployee?.id || memberAny.mainEmployeeId || memberAny.employeeId || '',
          firstName: correspondingEmployee?.name || '',
          lastName: correspondingEmployee?.surname || '',
          email: correspondingEmployee?.email || '',
          position: correspondingEmployee?.position || '',
          isLeader: correspondingEmployee?.id === leaderId
        };
        
        // Debug: Log the original member data and processed ID
        console.log('Processing team member:', {
          original: memberAny,
          processedId: processedMember.id,
          mainEmployeeId: processedMember.mainEmployeeId,
          correspondingEmployee: correspondingEmployee,
          leaderId: leaderId,
          isLeader: processedMember.isLeader,
          processedName: `${processedMember.firstName} ${processedMember.lastName}`
        });
        
        return processedMember;
      });
      
      console.log('Final processed team members:', membersArray);
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
      // Reset pending changes when opening
      setPendingChanges([]);
      setHasUnsavedChanges(false);
    }
  }, [isOpen, teamId, departmentId]);

  // Update hasUnsavedChanges when pendingChanges changes
  useEffect(() => {
    setHasUnsavedChanges(pendingChanges.length > 0);
  }, [pendingChanges]);

  const handleAssignEmployee = (employeeId: string) => {
    const employee = unassignedEmployees.find(emp => emp.id === employeeId);
    const employeeName = employee ? `${employee.name} ${employee.surname}` : '';
    
    setPendingChanges(prev => [
      ...prev,
      {
        type: 'add',
        employeeId,
        employeeName
      }
    ]);
  };

  const handleRemoveEmployee = (employeeId: string) => {
    const employee = teamMembers.find(member => member.id === employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : '';
    
    setPendingChanges(prev => [
      ...prev,
      {
        type: 'remove',
        employeeId,
        employeeName
      }
    ]);
  };

  const handleAssignLeader = (employeeId: string) => {
    const employee = teamMembers.find(member => member.id === employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : '';
    
    setPendingChanges(prev => [
      ...prev,
      {
        type: 'assign-leader',
        employeeId,
        employeeName
      }
    ]);
  };

  const handleSaveChanges = async () => {
    if (pendingChanges.length === 0) return;

    try {
      setSaving(true);
      setError(null);

      const headers = getEnterpriseHeaders();

      // Group changes by type
      const addChanges = pendingChanges.filter(change => change.type === 'add');
      const removeChanges = pendingChanges.filter(change => change.type === 'remove');
      const leaderChanges = pendingChanges.filter(change => change.type === 'assign-leader');

      // Process bulk add
      if (addChanges.length > 0) {
        const bulkAddUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}/members/bulk-add`);
        const addPayload = {
          employeeIds: addChanges.map(change => change.employeeId)
        };

        console.log('Sending bulk add payload:', addPayload);
        
        const addResponse = await fetch(bulkAddUrl, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(addPayload)
        });

        if (!addResponse.ok) {
          const errorText = await addResponse.text();
          throw new Error(`Failed to add employees: ${addResponse.status} - ${errorText}`);
        }

        const addResult = await addResponse.json();
        console.log('Bulk add result:', addResult);
        
        // Show success/failure details
        if (addResult.data?.summary?.failed > 0) {
          console.warn('Some employees failed to add:', addResult.data.results.failed);
        }
      }

      // Process bulk remove
      if (removeChanges.length > 0) {
        const bulkRemoveUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}/members/bulk-remove`);
        
        // Use mainEmployeeId for removal
        const removePayload = {
          employeeIds: removeChanges.map(change => {
            const teamMember = teamMembers.find(member => member.id === change.employeeId);
            return teamMember?.mainEmployeeId || change.employeeId;
          })
        };

        console.log('Sending bulk remove payload:', removePayload);
        console.log('Remove changes details:', removeChanges);
        console.log('Team members being removed:', teamMembers.filter(member => 
          removeChanges.some(change => change.employeeId === member.id)
        ));
        
        const removeResponse = await fetch(bulkRemoveUrl, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(removePayload)
        });

        if (!removeResponse.ok) {
          const errorText = await removeResponse.text();
          throw new Error(`Failed to remove employees: ${removeResponse.status} - ${errorText}`);
        }

        const removeResult = await removeResponse.json();
        console.log('Bulk remove result:', removeResult);
        
        // Show success/failure details
        if (removeResult.data?.summary?.failed > 0) {
          console.warn('Some employees failed to remove:', removeResult.data.results.failed);
        }
      }

      // Process leader assignments (individual requests for now)
      for (const leaderChange of leaderChanges) {
        const teamMember = teamMembers.find(member => member.id === leaderChange.employeeId);
        const mainEmployeeId = teamMember?.mainEmployeeId || leaderChange.employeeId;
        
        const leaderUrl = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}`);
        const leaderResponse = await fetch(leaderUrl, {
          method: 'PUT',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ leaderId: mainEmployeeId })
        });

        if (!leaderResponse.ok) {
          const errorText = await leaderResponse.text();
          throw new Error(`Failed to assign leader: ${leaderResponse.status} - ${errorText}`);
        }

        const leaderResult = await leaderResponse.json();
        console.log('Leader assignment result:', leaderResult);
      }

      // Clear pending changes and refresh data
      setPendingChanges([]);
      setHasUnsavedChanges(false);
      await fetchData();
      
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
      console.error("Error saving changes:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setPendingChanges([]);
    setHasUnsavedChanges(false);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getAvailableEmployees = () => {
    const pendingRemovals = pendingChanges
      .filter(change => change.type === 'remove')
      .map(change => change.employeeId);
    const pendingAdditions = pendingChanges
      .filter(change => change.type === 'add')
      .map(change => change.employeeId);
    
    // Filter out employees that are pending addition
    return unassignedEmployees.filter(employee => !pendingAdditions.includes(employee.id));
  };

  const getEffectiveTeamMembers = () => {
    const pendingRemovals = pendingChanges
      .filter(change => change.type === 'remove')
      .map(change => change.employeeId);
    const pendingAdditions = pendingChanges
      .filter(change => change.type === 'add')
      .map(change => change.employeeId);
    
    // Remove pending removals
    let effectiveMembers = teamMembers.filter(member => !pendingRemovals.includes(member.id));
    
    // Add pending additions
    const pendingEmployees = unassignedEmployees.filter(emp => pendingAdditions.includes(emp.id));
    const pendingMembers = pendingEmployees.map(emp => ({
      id: emp.id,
      mainEmployeeId: emp.id, // Use the main employee ID for pending additions
      firstName: emp.name,
      lastName: emp.surname,
      email: emp.email,
      position: emp.position,
      isLeader: false
    }));
    
    return [...effectiveMembers, ...pendingMembers];
  };

  const getPendingChangeForEmployee = (employeeId: string) => {
    return pendingChanges.find(change => change.employeeId === employeeId);
  };

  console.log('TeamMemberManagement render - isOpen:', isOpen, 'teamId:', teamId, 'teamName:', teamName);
  
  if (!isOpen) return null;

  const effectiveTeamMembers = getEffectiveTeamMembers();

  return (
    <div className="team-member-management-overlay">
      <div className="team-member-management-container">
        <div className="team-member-management-header">
          <div>
            <h2 className="team-member-management-title">Team Members - {teamName}</h2>
            <p className="team-member-management-subtitle">Manage team members in {departmentName}</p>
            {hasUnsavedChanges && (
              <div className="backend-notice">
                <span>⚠️ You have unsaved changes. Click "Save Changes" to apply them.</span>
              </div>
            )}
          </div>
          <button className="close-button" onClick={handleClose}>
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
          <>
            <div className="team-member-content">
              {/* Current Team Members */}
              <div className="team-members-section">
                <h3 className="section-title">
                  <FaUsers />
                  Current Team Members ({effectiveTeamMembers.length})
                </h3>
                
                {effectiveTeamMembers.length === 0 ? (
                  <div className="empty-state">
                    <p>No team members assigned yet</p>
                  </div>
                ) : (
                  <div className="team-members-list">
                    {effectiveTeamMembers.map(member => {
                      const pendingChange = getPendingChangeForEmployee(member.id);
                      return (
                        <div key={member.id} className="team-member-item">
                          <div className="member-info">
                            <div className="member-name">
                              {member.firstName} {member.lastName}
                              {member.isLeader && <FaCrown className="leader-icon" title="Team Leader" />}
                              {pendingChange && (
                                <span className="pending-indicator">
                                  {pendingChange.type === 'remove' && ' (Will be removed)'}
                                  {pendingChange.type === 'assign-leader' && ' (Will be leader)'}
                                </span>
                              )}
                            </div>
                            <div className="member-details">
                              <span className="member-position">{member.position}</span>
                              <span className="member-email">{member.email}</span>
                            </div>
                          </div>
                          <div className="member-actions">
                            {!member.isLeader && !pendingChange && (
                              <button
                                className="header-button outline-button"
                                onClick={() => handleAssignLeader(member.id)}
                              >
                                <i className="fas fa-crown"></i>
                                Make Leader
                              </button>
                            )}
                            {!pendingChange && (
                              <button
                                className="header-button outline-button"
                                onClick={() => handleRemoveEmployee(member.id)}
                              >
                                <i className="fas fa-times"></i>
                                Remove
                              </button>
                            )}
                            {pendingChange && (
                              <button
                                className="header-button outline-button"
                                onClick={() => {
                                  setPendingChanges(prev => prev.filter(change => 
                                    !(change.employeeId === member.id && change.type === pendingChange.type)
                                  ));
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Available Unassigned Employees */}
              <div className="available-employees-section">
                <h3 className="section-title">
                  <FaPlus />
                  Unassigned Employees ({getAvailableEmployees().length})
                </h3>
                
                {getAvailableEmployees().length === 0 ? (
                  <div className="empty-state">
                    <p>No unassigned employees available</p>
                  </div>
                ) : (
                  <div className="available-employees-list">
                    {getAvailableEmployees().map(employee => {
                      const pendingChange = getPendingChangeForEmployee(employee.id);
                      return (
                        <div key={employee.id} className="available-employee-item">
                          <div className="employee-info">
                            <div className="employee-name">
                              {employee.name} {employee.surname}
                              {pendingChange && (
                                <span className="pending-indicator">
                                  {pendingChange.type === 'add' && ' (Will be added)'}
                                </span>
                              )}
                            </div>
                            <div className="employee-details">
                              <span className="employee-position">{employee.position}</span>
                              <span className="employee-email">{employee.email}</span>
                            </div>
                          </div>
                          {!pendingChange ? (
                            <button
                              className="header-button outline-button"
                              onClick={() => handleAssignEmployee(employee.id)}
                            >
                              <i className="fas fa-plus"></i>
                              Add to Team
                            </button>
                          ) : (
                            <button
                              className="header-button outline-button"
                              onClick={() => {
                                setPendingChanges(prev => prev.filter(change => 
                                  !(change.employeeId === employee.id && change.type === 'add')
                                ));
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {hasUnsavedChanges && (
              <div className="team-member-actions">
                <div className="action-buttons">
                  <button
                    className="header-button outline-button"
                    onClick={handleDiscardChanges}
                    disabled={saving}
                  >
                    Discard Changes
                  </button>
                  <button
                    className="header-button primary-button"
                    onClick={handleSaveChanges}
                    disabled={saving}
                  >
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Save Changes ({pendingChanges.length})
                      </>
                    )}
                  </button>
                </div>
                <div className="changes-indicator">
                  <span>📝 {pendingChanges.length} change{pendingChanges.length !== 1 ? 's' : ''} pending</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeamMemberManagement; 