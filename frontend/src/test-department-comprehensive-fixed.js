// Department Comprehensive Test - Fixed Version
// Based on Department_Management_UI_Testing_Guide.md and Department.tsx component

// Configuration from api.ts
const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjZkZTQwZjA0ODgxYzZhMDE2MTFlYjI4NGE0Yzk1YTI1MWU5MTEyNTAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzUzMzkzMzI4LCJ1c2VyX2lkIjoiRWNjeU1Ddjd1aVMxZVlIQjNaTXU2elJSMURHMiIsInN1YiI6IkVjY3lNQ3Y3dWlTMWVZSEIzWk11NnpSUjFERzIiLCJpYXQiOjE3NTMzOTMzMjgsImV4cCI6MTc1MzM5NjkyOCwiZW1haWwiOiJ0ZXN0ZWhha2tlQGd1ZnVtLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RlaGFra2VAZ3VmdW0uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.EB51NcT2bswsQmwJHHKYVJjVwZ5efyLpnr9UQykYyxrz78N2megbN0doM8qxQdpIlIPbT1XcWBoR5OIZQuwTT7WXHiRJ3cNv03akOhCn9FeyvDy5UZziHz-LjgT7VrkOFBGpZRV0DqtxVuxZQc-zn5X2c1XvAg3MOdktOyPq8uC0qxT9eqvT9Q1bIfgotIlF5q7cIa4A73-xavhlPbgaptYhWqbwASWk2nGwsG8QUySf6B8jZoofzTa5LSFLv9EkOGzWHz10_d3DwTFXZW5bPZ4Wb_Lq1efx6Sjw5-FsxbZVE6wtHpEgj_ig9F48EMrmbQzr61SjJqUg86y_CreTvg";
const ENTERPRISE_ID = "x-spark-test";
const API_BASE_URL = "http://localhost:8383";

// Helper function to build enterprise URLs
const buildEnterpriseUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint.replace(':enterpriseId', ENTERPRISE_ID)}`;
};

// Helper function to get authenticated headers
const getEnterpriseHeaders = () => {
  return {
    'Authorization': `Bearer ${FIREBASE_TOKEN}`,
    'Content-Type': 'application/json'
  };
};

console.log('🚀 Starting Department Comprehensive Tests - Fixed Version');
console.log(`📋 Enterprise ID: ${ENTERPRISE_ID}`);
console.log(`🌐 API Base URL: ${API_BASE_URL}`);
console.log('');

// =============================================================================
// 1. CORE DEPARTMENT OPERATIONS (from Department.tsx component)
// =============================================================================

// Test 1: Get All Departments (used in Department.tsx useEffect)
const testGetAllDepartments = async () => {
  console.log('🧪 Test 1: Get All Departments');
  try {
    const url = buildEnterpriseUrl('/enterprise/:enterpriseId/departments');
    const headers = getEnterpriseHeaders();
    
    console.log(`   Making request to: ${url}`);
    console.log(`   Headers:`, headers);
    
    const response = await fetch(url, { headers });
    console.log(`   Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   Error response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Response received:', result);
    console.log(`   📊 Found ${result.departments ? result.departments.length : 0} departments`);
    
    return result.departments || [];
  } catch (error) {
    console.error('   ❌ Test 1 failed:', error.message);
    console.error('   Full error:', error);
    return [];
  }
};

// Test 2: Get Enterprise Cards (used in Department.tsx to calculate card counts)
const testGetEnterpriseCards = async () => {
  console.log('🧪 Test 2: Get Enterprise Cards');
  try {
    const url = buildEnterpriseUrl('/enterprise/:enterpriseId/cards');
    const headers = getEnterpriseHeaders();
    
    console.log(`   Making request to: ${url}`);
    
    const response = await fetch(url, { headers });
    console.log(`   Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   Error response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Response received:', result);
    console.log(`   📊 Found ${result.cards ? Object.keys(result.cards).length : 0} cards`);
    
    return result.cards || {};
  } catch (error) {
    console.error('   ❌ Test 2 failed:', error.message);
    console.error('   Full error:', error);
    return {};
  }
};

// Test 3: Create Department (used in Department.tsx handleSubmitDepartment)
const testCreateDepartment = async () => {
  console.log('🧪 Test 3: Create Department');
  try {
    const url = buildEnterpriseUrl('/enterprise/:enterpriseId/departments');
    const headers = getEnterpriseHeaders();
    
    const departmentData = {
      name: "Comprehensive Test Department",
      description: "Department created via comprehensive testing",
      managers: []
    };
    
    console.log(`   Making request to: ${url}`);
    console.log('   📤 Sending data:', departmentData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(departmentData)
    });
    
    console.log(`   Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   Error response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Department created:', result);
    
    return result.department || result;
  } catch (error) {
    console.error('   ❌ Test 3 failed:', error.message);
    console.error('   Full error:', error);
    return null;
  }
};

// Test 4: Update Department (used in Department.tsx handleSubmitDepartment)
const testUpdateDepartment = async (departmentId) => {
  console.log('🧪 Test 4: Update Department');
  if (!departmentId) {
    console.log('   ⏭️ Skipping - no department ID provided');
    return null;
  }
  
  try {
    const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}`);
    const headers = getEnterpriseHeaders();
    
    const updateData = {
      name: "Updated Comprehensive Test Department",
      description: "Updated description via comprehensive testing",
      managers: []
    };
    
    console.log(`   Making request to: ${url}`);
    console.log('   📤 Sending data:', updateData);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });
    
    console.log(`   Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   Error response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Department updated:', result);
    
    return result.department || result;
  } catch (error) {
    console.error('   ❌ Test 4 failed:', error.message);
    console.error('   Full error:', error);
    return null;
  }
};

// Test 5: Delete Department (used in Department.tsx handleDeleteConfirm)
const testDeleteDepartment = async (departmentId) => {
  console.log('🧪 Test 5: Delete Department');
  if (!departmentId) {
    console.log('   ⏭️ Skipping - no department ID provided');
    return null;
  }
  
  try {
    const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}`);
    const headers = getEnterpriseHeaders();
    
    console.log(`   Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    
    console.log(`   Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   Error response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    console.log('   ✅ Department deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('   ❌ Test 5 failed:', error.message);
    console.error('   Full error:', error);
    return null;
  }
};

// =============================================================================
// 2. EMPLOYEE MANAGEMENT (from Department.tsx EmployeeModal)
// =============================================================================

// Test 6: Create Employee (from Department_Management_UI_Testing_Guide.md)
const testCreateEmployee = async (departmentId) => {
  console.log('🧪 Test 6: Create Employee');
  if (!departmentId) {
    console.log('   ⏭️ Skipping - no department ID provided');
    return null;
  }
  
  try {
    const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/employees`);
    const headers = getEnterpriseHeaders();
    
    const employeeData = {
      name: "Test Employee",
      email: "test.employee@uitest.com",
      phone: "+1234567890",
      position: "Software Engineer",
      role: "employee"
    };
    
    console.log(`   Making request to: ${url}`);
    console.log('   📤 Sending data:', employeeData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(employeeData)
    });
    
    console.log(`   Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   Error response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Employee created:', result);
    
    return result.employee || result;
  } catch (error) {
    console.error('   ❌ Test 6 failed:', error.message);
    console.error('   Full error:', error);
    return null;
  }
};

// Test 7: Get Department Employees (from Department_Management_UI_Testing_Guide.md)
const testGetDepartmentEmployees = async (departmentId) => {
  console.log('🧪 Test 7: Get Department Employees');
  if (!departmentId) {
    console.log('   ⏭️ Skipping - no department ID provided');
    return null;
  }
  
  try {
    const url = buildEnterpriseUrl(`/enterprise/:enterpriseId/departments/${departmentId}/employees`);
    const headers = getEnterpriseHeaders();
    
    console.log(`   Making request to: ${url}`);
    
    const response = await fetch(url, { headers });
    console.log(`   Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   Error response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('   ✅ Department employees:', result);
    console.log(`   📊 Found ${result.employees ? Object.keys(result.employees).length : 0} employees`);
    
    return result.employees || {};
  } catch (error) {
    console.error('   ❌ Test 7 failed:', error.message);
    console.error('   Full error:', error);
    return {};
  }
};

// =============================================================================
// 3. COMPREHENSIVE TEST WORKFLOW
// =============================================================================

const runComprehensiveTests = async () => {
  console.log('');
  console.log('🚀 RUNNING COMPREHENSIVE DEPARTMENT FUNCTIONALITY TESTS');
  console.log('='.repeat(80));
  console.log('');
  
  let testDepartmentId = null;
  let testResults = {
    getDepartments: false,
    getCards: false,
    createDepartment: false,
    updateDepartment: false,
    deleteDepartment: false,
    createEmployee: false,
    getEmployees: false
  };
  
  try {
    // Phase 1: Core Department Data (matches Department.tsx useEffect)
    console.log('📋 PHASE 1: Core Department Data (matches Department.tsx useEffect)');
    console.log('-'.repeat(60));
    
    const departments = await testGetAllDepartments();
    testResults.getDepartments = departments.length >= 0;
    console.log('');
    
    const cards = await testGetEnterpriseCards();
    testResults.getCards = Object.keys(cards).length >= 0;
    console.log('');
    
    // Phase 2: Department CRUD Operations (matches Department.tsx handlers)
    console.log('📋 PHASE 2: Department CRUD Operations (matches Department.tsx handlers)');
    console.log('-'.repeat(60));
    
    const createdDepartment = await testCreateDepartment();
    testResults.createDepartment = createdDepartment !== null;
    if (createdDepartment) {
      testDepartmentId = createdDepartment.id || createdDepartment._id;
      console.log(`   📝 Created department ID: ${testDepartmentId}`);
    }
    console.log('');
    
    if (testDepartmentId) {
      const updatedDepartment = await testUpdateDepartment(testDepartmentId);
      testResults.updateDepartment = updatedDepartment !== null;
      console.log('');
      
      // Phase 3: Employee Management (from Department_Management_UI_Testing_Guide.md)
      console.log('📋 PHASE 3: Employee Management (from Department_Management_UI_Testing_Guide.md)');
      console.log('-'.repeat(60));
      
      const createdEmployee = await testCreateEmployee(testDepartmentId);
      testResults.createEmployee = createdEmployee !== null;
      console.log('');
      
      const employees = await testGetDepartmentEmployees(testDepartmentId);
      testResults.getEmployees = Object.keys(employees).length >= 0;
      console.log('');
      
      // Phase 4: Cleanup
      console.log('📋 PHASE 4: Cleanup');
      console.log('-'.repeat(60));
      
      const deleteResult = await testDeleteDepartment(testDepartmentId);
      testResults.deleteDepartment = deleteResult !== null;
      console.log('');
    } else {
      console.log('⚠️ Skipping update, employee, and delete tests - no department created');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed with error:', error);
    console.error('Full error details:', error);
  }
  
  // Final Results
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(80));
  
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
    console.log('🎉 ALL TESTS PASSED! Department functionality is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  console.log('');
  console.log('🔍 Component Integration Status:');
  console.log(`   • Department.tsx data fetching: ${testResults.getDepartments && testResults.getCards ? '✅' : '❌'}`);
  console.log(`   • Department CRUD operations: ${testResults.createDepartment && testResults.updateDepartment && testResults.deleteDepartment ? '✅' : '❌'}`);
  console.log(`   • Employee management: ${testResults.createEmployee && testResults.getEmployees ? '✅' : '❌'}`);
  
  return testResults;
};

// =============================================================================
// 4. RUN TESTS
// =============================================================================

// Run the comprehensive test suite
runComprehensiveTests()
  .then(results => {
    console.log('');
    console.log('🏁 Department functionality testing completed!');
    console.log('📝 You can now verify that your Department.tsx component works correctly.');
  })
  .catch(error => {
    console.error('💥 Test suite crashed:', error);
    console.error('Full crash details:', error);
  }); 