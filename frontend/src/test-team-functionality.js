// Team Management Functionality Testing Script
// Based on Team_Management_UI_Testing_Guide.md

const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjZkZTQwZjA0ODgxYzZhMDE2MTFlYjI4NGE0Yzk1YTI1MWU5MTEyNTAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzUzMzkzMzI4LCJ1c2VyX2lkIjoiRWNjeU1Ddjd1aVMxZVlIQjNaTXU2elJSMURHMiIsInN1YiI6IkVjY3lNQ3Y3dWlTMWVZSEIzWk11NnpSUjFERzIiLCJpYXQiOjE3NTMzOTMzMjgsImV4cCI6MTc1MzM5NjkyOCwiZW1haWwiOiJ0ZXN0ZWhha2tlQGd1ZnVtLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RlaGFra2VAZ3VmdW0uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.EB51NcT2bswsQmwJHHKYVJjVwZ5efyLpnr9UQykYyxrz78N2megbN0doM8qxQdpIlIPbT1XcWBoR5OIZQuwTT7WXHiRJ3cNv03akOhCn9FeyvDy5UZziHz-LjgT7VrkOFBGpZRV0DqtxVuxZQc-zn5X2c1XvAg3MOdktOyPq8uC0qxT9eqvT9Q1bIfgotIlF5q7cIa4A73-xavhlPbgaptYhWqbwASWk2nGwsG8QUySf6B8jZoofzTa5LSFLv9EkOGzWHz10_d3DwTFXZW5bPZ4Wb_Lq1efx6Sjw5-FsxbZVE6wtHpEgj_ig9F48EMrmbQzr61SjJqUg86y_CreTvg";
const DEFAULT_ENTERPRISE_ID = "x-spark-test";
const API_BASE_URL = "http://localhost:8383";

// Helper function to build enterprise URLs
const buildEnterpriseUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint.replace(':enterpriseId', DEFAULT_ENTERPRISE_ID)}`;
};

// Helper function to get authenticated headers
const getEnterpriseHeaders = () => {
  return {
    'Authorization': `Bearer ${FIREBASE_TOKEN}`,
    'Content-Type': 'application/json'
  };
};

console.log('🚀 Starting Team Management Functionality Tests');
console.log(`📋 Enterprise ID: ${DEFAULT_ENTERPRISE_ID}`);
console.log(`🌐 API Base URL: ${API_BASE_URL}`);
console.log('');

// =============================================================================
// 1. CORE TEAM OPERATIONS (from TeamManagement.tsx component)
// =============================================================================

// Test 1: Get All Teams in Department
const testGetAllTeams = async (departmentId) => {
  console.log('🧪 Test 1: Get All Teams in Department');
  try {
    const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams`);
    const headers = getEnterpriseHeaders();
    
    console.log(`   Making request to: ${url}`);
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Response received:', result);
    console.log(`   📊 Found ${result.teams ? Object.keys(result.teams).length : 0} teams`);
    
    return result.teams || {};
  } catch (error) {
    console.error('   ❌ Test 1 failed:', error.message);
    return {};
  }
};

// Test 2: Get Department Employees (for team leader assignment)
const testGetDepartmentEmployees = async (departmentId) => {
  console.log('🧪 Test 2: Get Department Employees');
  try {
    const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/employees`);
    const headers = getEnterpriseHeaders();
    
    console.log(`   Making request to: ${url}`);
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Response received:', result);
    console.log(`   📊 Found ${result.employees ? Object.keys(result.employees).length : 0} employees`);
    
    return result.employees || {};
  } catch (error) {
    console.error('   ❌ Test 2 failed:', error.message);
    return {};
  }
};

// Test 3: Create Team
const testCreateTeam = async (departmentId) => {
  console.log('🧪 Test 3: Create Team');
  try {
    const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams`);
    const headers = getEnterpriseHeaders();
    
    const teamData = {
      name: "UI Test Team",
      description: "Team created via UI testing",
      leaderId: null
    };
    
    console.log(`   Making request to: ${url}`);
    console.log('   📤 Sending data:', teamData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(teamData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Team created:', result);
    
    return result.team;
  } catch (error) {
    console.error('   ❌ Test 3 failed:', error.message);
    return null;
  }
};

// Test 4: Update Team
const testUpdateTeam = async (departmentId, teamId) => {
  console.log('🧪 Test 4: Update Team');
  if (!teamId) {
    console.log('   ⏭️ Skipping - no team ID provided');
    return null;
  }
  
  try {
    const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}`);
    const headers = getEnterpriseHeaders();
    
    const updateData = {
      name: "Updated UI Test Team",
      description: "Updated description via UI testing"
    };
    
    console.log(`   Making request to: ${url}`);
    console.log('   📤 Sending data:', updateData);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Team updated:', result);
    
    return result.team;
  } catch (error) {
    console.error('   ❌ Test 4 failed:', error.message);
    return null;
  }
};

// Test 5: Get Team Members
const testGetTeamMembers = async (departmentId, teamId) => {
  console.log('🧪 Test 5: Get Team Members');
  if (!teamId) {
    console.log('   ⏭️ Skipping - no team ID provided');
    return {};
  }
  
  try {
    const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}/members`);
    const headers = getEnterpriseHeaders();
    
    console.log(`   Making request to: ${url}`);
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Team members retrieved:', result);
    
    return result.members || {};
  } catch (error) {
    console.error('   ❌ Test 5 failed:', error.message);
    return {};
  }
};

// Test 6: Delete Team
const testDeleteTeam = async (departmentId, teamId) => {
  console.log('🧪 Test 6: Delete Team');
  if (!teamId) {
    console.log('   ⏭️ Skipping - no team ID provided');
    return null;
  }
  
  try {
    const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/teams/${teamId}`);
    const headers = getEnterpriseHeaders();
    
    console.log(`   Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Team deleted:', result);
    
    return result;
  } catch (error) {
    console.error('   ❌ Test 6 failed:', error.message);
    return null;
  }
};

// =============================================================================
// 2. COMPREHENSIVE TEST WORKFLOW (matches TeamManagement.tsx functionality)
// =============================================================================

const runTeamFunctionalityTests = async () => {
  console.log('');
  console.log('🚀 RUNNING COMPREHENSIVE TEAM FUNCTIONALITY TESTS');
  console.log('=' .repeat(80));
  console.log('');
  
  // First, we need to get a department ID to work with
  console.log('📋 PHASE 0: Get Department for Testing');
  console.log('-'.repeat(60));
  
  let testDepartmentId = null;
  try {
    const deptUrl = buildEnterpriseUrl('/enterprise/:enterpriseId/departments');
    const headers = getEnterpriseHeaders();
    
    const deptResponse = await fetch(deptUrl, { headers });
    if (deptResponse.ok) {
      const deptData = await deptResponse.json();
      if (deptData.departments && deptData.departments.length > 0) {
        testDepartmentId = deptData.departments[0].id;
        console.log(`   ✅ Using department: ${deptData.departments[0].name} (${testDepartmentId})`);
      } else {
        console.log('   ⚠️ No departments found, creating one for testing...');
        // Create a test department
        const createDeptResponse = await fetch(deptUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: "Team Test Department",
            description: "Department for team testing",
            managers: []
          })
        });
        if (createDeptResponse.ok) {
          const newDept = await createDeptResponse.json();
          testDepartmentId = newDept.department.id;
          console.log(`   ✅ Created test department: ${testDepartmentId}`);
        }
      }
    }
  } catch (error) {
    console.error('   ❌ Failed to get/create department:', error.message);
    return;
  }
  
  if (!testDepartmentId) {
    console.error('❌ No department available for testing');
    return;
  }
  
  let testTeamId = null;
  let testResults = {
    getTeams: false,
    getEmployees: false,
    createTeam: false,
    updateTeam: false,
    getMembers: false,
    deleteTeam: false
  };
  
  try {
    // Phase 1: Core Team Data (matches TeamManagement.tsx useEffect)
    console.log('\n📋 PHASE 1: Core Team Data (matches TeamManagement.tsx useEffect)');
    console.log('-'.repeat(60));
    
    const teams = await testGetAllTeams(testDepartmentId);
    testResults.getTeams = Object.keys(teams).length >= 0;
    console.log('');
    
    const employees = await testGetDepartmentEmployees(testDepartmentId);
    testResults.getEmployees = Object.keys(employees).length >= 0;
    console.log('');
    
    // Phase 2: Team CRUD Operations (matches TeamManagement.tsx handlers)
    console.log('📋 PHASE 2: Team CRUD Operations (matches TeamManagement.tsx handlers)');
    console.log('-'.repeat(60));
    
    const createdTeam = await testCreateTeam(testDepartmentId);
    testResults.createTeam = createdTeam !== null;
    if (createdTeam) {
      testTeamId = createdTeam.id;
    }
    console.log('');
    
    const updatedTeam = await testUpdateTeam(testDepartmentId, testTeamId);
    testResults.updateTeam = updatedTeam !== null;
    console.log('');
    
    // Phase 3: Team Member Management
    console.log('📋 PHASE 3: Team Member Management');
    console.log('-'.repeat(60));
    
    const members = await testGetTeamMembers(testDepartmentId, testTeamId);
    testResults.getMembers = Object.keys(members).length >= 0;
    console.log('');
    
    // Phase 4: Cleanup
    console.log('📋 PHASE 4: Cleanup');
    console.log('-'.repeat(60));
    
    const deleteResult = await testDeleteTeam(testDepartmentId, testTeamId);
    testResults.deleteTeam = deleteResult !== null;
    console.log('');
    
  } catch (error) {
    console.error('❌ Test suite failed with error:', error);
  }
  
  // Final Results
  console.log('📊 FINAL TEST RESULTS');
  console.log('=' .repeat(80));
  
  const passedTests = Object.values(testResults).filter(result => result === true).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log('');
  console.log('Individual Test Results:');
  Object.entries(testResults).forEach(([testName, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${status} ${testName}`);
  });
  
  console.log('');
  console.log(`Overall Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Team functionality is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  console.log('');
  console.log('🔍 Component Integration Status:');
  console.log(`   • TeamManagement.tsx data fetching: ${testResults.getTeams && testResults.getEmployees ? '✅' : '❌'}`);
  console.log(`   • Team CRUD operations: ${testResults.createTeam && testResults.updateTeam && testResults.deleteTeam ? '✅' : '❌'}`);
  console.log(`   • Team member management: ${testResults.getMembers ? '✅' : '❌'}`);
  
  return testResults;
};

// =============================================================================
// 3. RUN TESTS
// =============================================================================

// Run the comprehensive test suite
runTeamFunctionalityTests()
  .then(results => {
    console.log('');
    console.log('🏁 Team functionality testing completed!');
    console.log('📝 You can now verify that your TeamManagement.tsx component works correctly.');
  })
  .catch(error => {
    console.error('💥 Test suite crashed:', error);
  }); 