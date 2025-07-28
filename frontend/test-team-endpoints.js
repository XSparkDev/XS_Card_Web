// Test file for Team Management Endpoints
// This file tests the real backend endpoints for team management

const BASE_URL = 'http://localhost:3000'; // Adjust this to your backend URL
const ENTERPRISE_ID = 'your-enterprise-id'; // Replace with actual enterprise ID
const DEPARTMENT_ID = 'your-department-id'; // Replace with actual department ID

// Test data
const testTeam = {
  name: 'Test Team',
  description: 'A test team for API testing',
  leaderId: '' // Optional
};

const testEmployeeId = 'your-employee-id'; // Replace with actual employee ID

// Helper function to make API calls
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token-here', // Replace with actual token
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Request failed:', error);
    return { status: 'error', data: error.message };
  }
}

// Test 1: Create a new team
async function testCreateTeam() {
  console.log('Testing POST /enterprise/{enterpriseId}/departments/{departmentId}/teams');
  
  const url = `${BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${DEPARTMENT_ID}/teams`;
  const result = await makeRequest(url, {
    method: 'POST',
    body: JSON.stringify(testTeam)
  });
  
  console.log('Create Team Result:', result);
  return result.data?.id; // Return team ID for other tests
}

// Test 2: Get all teams in department
async function testGetTeams() {
  console.log('Testing GET /enterprise/{enterpriseId}/departments/{departmentId}/teams');
  
  const url = `${BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${DEPARTMENT_ID}/teams`;
  const result = await makeRequest(url, { method: 'GET' });
  
  console.log('Get Teams Result:', result);
  return result.data;
}

// Test 3: Get specific team
async function testGetTeam(teamId) {
  console.log('Testing GET /enterprise/{enterpriseId}/departments/{departmentId}/teams/{teamId}');
  
  const url = `${BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${DEPARTMENT_ID}/teams/${teamId}`;
  const result = await makeRequest(url, { method: 'GET' });
  
  console.log('Get Team Result:', result);
  return result.data;
}

// Test 4: Update team
async function testUpdateTeam(teamId) {
  console.log('Testing PUT /enterprise/{enterpriseId}/departments/{departmentId}/teams/{teamId}');
  
  const updatedTeam = {
    ...testTeam,
    name: 'Updated Test Team',
    description: 'Updated description'
  };
  
  const url = `${BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${DEPARTMENT_ID}/teams/${teamId}`;
  const result = await makeRequest(url, {
    method: 'PUT',
    body: JSON.stringify(updatedTeam)
  });
  
  console.log('Update Team Result:', result);
  return result.data;
}

// Test 5: Patch team (update leader)
async function testPatchTeam(teamId) {
  console.log('Testing PATCH /enterprise/{enterpriseId}/departments/{departmentId}/teams/{teamId}');
  
  const patchData = {
    leaderId: testEmployeeId
  };
  
  const url = `${BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${DEPARTMENT_ID}/teams/${teamId}`;
  const result = await makeRequest(url, {
    method: 'PATCH',
    body: JSON.stringify(patchData)
  });
  
  console.log('Patch Team Result:', result);
  return result.data;
}

// Test 6: Get team members
async function testGetTeamMembers(teamId) {
  console.log('Testing GET /enterprise/{enterpriseId}/departments/{departmentId}/teams/{teamId}/members');
  
  const url = `${BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${DEPARTMENT_ID}/teams/${teamId}/members`;
  const result = await makeRequest(url, { method: 'GET' });
  
  console.log('Get Team Members Result:', result);
  return result.data;
}

// Test 7: Add employee to team
async function testAddEmployeeToTeam(teamId) {
  console.log('Testing POST /enterprise/{enterpriseId}/departments/{departmentId}/teams/{teamId}/employees');
  
  const url = `${BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${DEPARTMENT_ID}/teams/${teamId}/employees`;
  const result = await makeRequest(url, {
    method: 'POST',
    body: JSON.stringify({ employeeId: testEmployeeId })
  });
  
  console.log('Add Employee to Team Result:', result);
  return result.data;
}

// Test 8: Remove employee from team
async function testRemoveEmployeeFromTeam(teamId) {
  console.log('Testing DELETE /enterprise/{enterpriseId}/departments/{departmentId}/teams/{teamId}/employees/{employeeId}');
  
  const url = `${BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${DEPARTMENT_ID}/teams/${teamId}/employees/${testEmployeeId}`;
  const result = await makeRequest(url, { method: 'DELETE' });
  
  console.log('Remove Employee from Team Result:', result);
  return result.data;
}

// Test 9: Delete team
async function testDeleteTeam(teamId) {
  console.log('Testing DELETE /enterprise/{enterpriseId}/departments/{departmentId}/teams/{teamId}');
  
  const url = `${BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${DEPARTMENT_ID}/teams/${teamId}`;
  const result = await makeRequest(url, { method: 'DELETE' });
  
  console.log('Delete Team Result:', result);
  return result.data;
}

// Run all tests
async function runAllTests() {
  console.log('Starting Team Management API Tests...\n');
  
  try {
    // Test 1: Create team
    const teamId = await testCreateTeam();
    if (!teamId) {
      console.error('Failed to create team, stopping tests');
      return;
    }
    
    console.log('\n--- Team created with ID:', teamId, '---\n');
    
    // Test 2: Get all teams
    await testGetTeams();
    
    // Test 3: Get specific team
    await testGetTeam(teamId);
    
    // Test 4: Update team
    await testUpdateTeam(teamId);
    
    // Test 5: Patch team (assign leader)
    await testPatchTeam(teamId);
    
    // Test 6: Get team members
    await testGetTeamMembers(teamId);
    
    // Test 7: Add employee to team
    await testAddEmployeeToTeam(teamId);
    
    // Test 8: Remove employee from team
    await testRemoveEmployeeFromTeam(teamId);
    
    // Test 9: Delete team
    await testDeleteTeam(teamId);
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testCreateTeam,
    testGetTeams,
    testGetTeam,
    testUpdateTeam,
    testPatchTeam,
    testGetTeamMembers,
    testAddEmployeeToTeam,
    testRemoveEmployeeFromTeam,
    testDeleteTeam,
    runAllTests
  };
} else {
  // Browser environment
  window.TeamManagementTests = {
    testCreateTeam,
    testGetTeams,
    testGetTeam,
    testUpdateTeam,
    testPatchTeam,
    testGetTeamMembers,
    testAddEmployeeToTeam,
    testRemoveEmployeeFromTeam,
    testDeleteTeam,
    runAllTests
  };
}

// Instructions for running tests:
console.log(`
Team Management API Test Instructions:

1. Update the constants at the top of this file:
   - BASE_URL: Your backend server URL
   - ENTERPRISE_ID: Your actual enterprise ID
   - DEPARTMENT_ID: Your actual department ID
   - testEmployeeId: An actual employee ID for testing

2. Update the Authorization header with your actual token

3. Run the tests:
   - In Node.js: node test-team-endpoints.js
   - In browser: Open console and run TeamManagementTests.runAllTests()

4. Check the console output for test results
`); 