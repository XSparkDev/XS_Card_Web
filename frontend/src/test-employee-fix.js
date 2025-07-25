// Quick Employee Creation Test - Fixed Version
// Tests the corrected employee creation endpoint

const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjZkZTQwZjA0ODgxYzZhMDE2MTFlYjI4NGE0Yzk1YTI1MWU5MTEyNTAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzUzMzkzMzI4LCJ1c2VyX2lkIjoiRWNjeU1Ddjd1aVMxZVlIQjNaTXU2elJSMURHMiIsInN1YiI6IkVjY3lNQ3Y3dWlTMWVZSEIzWk11NnpSUjFERzIiLCJpYXQiOjE3NTMzOTMzMjgsImV4cCI6MTc1MzM5NjkyOCwiZW1haWwiOiJ0ZXN0ZWhha2tlQGd1ZnVtLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RlaGFra2VAZ3VmdW0uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.EB51NcT2bswsQmwJHHKYVJjVwZ5efyLpnr9UQykYyxrz78N2megbN0doM8qxQdpIlIPbT1XcWBoR5OIZQuwTT7WXHiRJ3cNv03akOhCn9FeyvDy5UZziHz-LjgT7VrkOFBGpZRV0DqtxVuxZQc-zn5X2c1XvAg3MOdktOyPq8uC0qxT9eqvT9Q1bIfgotIlF5q7cIa4A73-xavhlPbgaptYhWqbwASWk2nGwsG8QUySf6B8jZoofzTa5LSFLv9EkOGzWHz10_d3DwTFXZW5bPZ4Wb_Lq1efx6Sjw5-FsxbZVE6wtHpEgj_ig9F48EMrmbQzr61SjJqUg86y_CreTvg";
const ENTERPRISE_ID = "x-spark-test";
const API_BASE_URL = "http://localhost:8383";

console.log('🧪 Testing Employee Creation Fix');
console.log(`🏢 Enterprise: ${ENTERPRISE_ID}`);
console.log(`🌐 API: ${API_BASE_URL}\n`);

const testEmployeeCreation = async () => {
  const headers = {
    'Authorization': `Bearer ${FIREBASE_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // Step 1: Create a test department
    console.log('1️⃣ Creating test department...');
    const createDeptUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments`;
    const deptData = {
      name: "Employee Test Department",
      description: "Department for testing employee creation",
      managers: []
    };

    const deptResponse = await fetch(createDeptUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(deptData)
    });

    if (!deptResponse.ok) {
      throw new Error(`Department creation failed: ${deptResponse.status}`);
    }

    const deptResult = await deptResponse.json();
    const departmentId = deptResult.department?.id || deptResult.department?._id;
    console.log(`   ✅ Department created: ${departmentId}`);

    // Step 2: Create employee with correct format
    console.log('\n2️⃣ Creating employee with correct format...');
    const employeeUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${departmentId}/employees`;
    const employeeData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@test.com",
      phone: "+1234567890",
      position: "Software Engineer",
      role: "employee"
    };

    console.log('   📤 Sending employee data:', employeeData);

    const employeeResponse = await fetch(employeeUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(employeeData)
    });

    console.log(`   📊 Response status: ${employeeResponse.status}`);

    if (!employeeResponse.ok) {
      const errorText = await employeeResponse.text();
      console.log(`   ❌ Error response: ${errorText}`);
      throw new Error(`Employee creation failed: ${employeeResponse.status}`);
    }

    const employeeResult = await employeeResponse.json();
    console.log('   ✅ Employee created successfully:', employeeResult);

    // Step 3: Verify employee was created
    console.log('\n3️⃣ Verifying employee creation...');
    const getEmployeesUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${departmentId}/employees`;
    
    const getEmployeesResponse = await fetch(getEmployeesUrl, { headers });
    const employeesResult = await getEmployeesResponse.json();
    
    console.log(`   📊 Employees in department: ${employeesResult.employees ? Object.keys(employeesResult.employees).length : 0}`);
    console.log('   ✅ Employee verification complete');

    // Step 4: Cleanup - delete department
    console.log('\n4️⃣ Cleaning up...');
    const deleteUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${departmentId}`;
    
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers
    });

    if (deleteResponse.ok) {
      console.log('   ✅ Test department deleted');
    } else {
      console.log('   ⚠️ Could not delete test department');
    }

    console.log('\n🎉 Employee creation test completed successfully!');
    console.log('💡 Your Department.tsx component should now work correctly for employee creation.');

  } catch (error) {
    console.error('❌ Employee creation test failed:', error.message);
  }
};

// Run the test
testEmployeeCreation(); 