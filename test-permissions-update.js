// Focused test for individual permissions update
// Run with: node test-permissions-update.js

const API_BASE_URL = 'http://localhost:8383';
const ENTERPRISE_ID = 'x-spark-test';
const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU3YmZiMmExMWRkZmZjMGFkMmU2ODE0YzY4NzYzYjhjNjg3NTgxZDgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzU1Mjk3MzY0LCJ1c2VyX2lkIjoiQlB4Rm1tRzZTVlh2Ynd3UkowWWpCbnVJOGU3MyIsInN1YiI6IkJQeEZtbUc2U1ZYdmJ3d1JKMFlqQm51SThlNzMiLCJpYXQiOjE3NTUyOTczNjQsImV4cCI6MTc1NTMwMDk2NCwiZW1haWwiOiJ4ZW5hY29oNzQwQHBlcmN5ZnguY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsieGVuYWNvaDc0MEBwZXJjeWZ4LmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.TnQichWBQbgo6whXpnYTwxfiCWPqCqhUYA0-N0k7zd9X2cQIi_rycMZRmjI9zy7xZ6ZjnKgm9xVuF-F2H0nJwhvoP2YfpHKHk7Zxy9IZlGUhC3Om6ZZl0RiWEx4O-LaaMojIQQvTQkbvowrB720ps6CKzoudzhcguSPEmJswSQ_GX7_LSNW-5WVdMKQpJbMLkKSMlOjy3b84n4yZomwj2rS-sEM5Wwflm21FawptZ-FqLET8hfq0mt-nc1E_LacBNL03AveCT41TKhLvlVM5K95XMoyHTy1H-YD3J3EjkUnHIZfJZWoWpdVrFU6T6fT1a_UtPPT0IoPeQQrLuQqXBg";

const headers = {
  'Authorization': `Bearer ${FIREBASE_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testUpdatePermissions(userId, individualPermissions) {
  console.log(`🔧 Testing PUT /api/enterprise/${ENTERPRISE_ID}/users/${userId}/permissions`);
  console.log('Request body:', JSON.stringify({ individualPermissions }, null, 2));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/enterprise/${ENTERPRISE_ID}/users/${userId}/permissions`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ individualPermissions })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Update Permissions Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Update Permissions Error:');
      console.log(JSON.stringify(data, null, 2));
    }
    
    return { success: response.ok, data };
  } catch (error) {
    console.error('❌ Update Permissions failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTest() {
  console.log('🚀 Testing Individual Permissions Update\n');
  
  // First get real employees to use their IDs
  console.log('📋 Getting real employees first...');
  try {
    const employeesResponse = await fetch(`${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/employees`, {
      method: 'GET',
      headers
    });
    
    if (!employeesResponse.ok) {
      throw new Error(`HTTP ${employeesResponse.status}: ${employeesResponse.statusText}`);
    }
    
    const employeesData = await employeesResponse.json();
    console.log(`✅ Found ${employeesData.employees?.length || 0} employees`);
    
    if (!employeesData.employees || employeesData.employees.length === 0) {
      console.log('❌ No employees found to test with');
      return;
    }
    
    // Show first few employees for debugging
    console.log('\n📋 Sample employees:');
    employeesData.employees.slice(0, 3).forEach((emp, index) => {
      const userId = emp.userId?._path?.segments?.[1] || 'N/A';
      console.log(`${index + 1}. ID: ${emp.id}, UserID: ${userId}, Name: ${emp.name} ${emp.surname}, Email: ${emp.email}, Role: ${emp.role}`);
    });
    
    // Try with the first employee using userId from the path
    const firstEmp = employeesData.employees[0];
    const testUserId = firstEmp.userId?._path?.segments?.[1] || firstEmp.id;
    console.log(`\n🧪 Using employee ID: ${testUserId} (${firstEmp.name} ${firstEmp.surname})`);
    
    const testPermissions = {
      removed: ["createCards", "deleteCards"],
      added: ["manageAllCards"]
    };
    
    console.log('='.repeat(60));
    console.log('TEST: Update Individual Permissions');
    console.log('='.repeat(60));
    
    const result = await testUpdatePermissions(testUserId, testPermissions);
    
    // If first user fails, try with a different user
    if (!result.success && result.data?.message?.includes('User not found')) {
      console.log('\n🔄 First user failed, trying with second user...');
      const secondEmp = employeesData.employees[1];
      const secondUserId = secondEmp.userId?._path?.segments?.[1] || secondEmp.id;
      console.log(`🧪 Using employee ID: ${secondUserId} (${secondEmp.name} ${secondEmp.surname})`);
      
      const result2 = await testUpdatePermissions(secondUserId, testPermissions);
      
      if (!result2.success) {
        console.log('\n🔄 Second user also failed, trying with third user...');
        const thirdEmp = employeesData.employees[2];
        const thirdUserId = thirdEmp.userId?._path?.segments?.[1] || thirdEmp.id;
        console.log(`🧪 Using employee ID: ${thirdUserId} (${thirdEmp.name} ${thirdEmp.surname})`);
        
        const result3 = await testUpdatePermissions(thirdUserId, testPermissions);
        return result3;
      }
      
      return result2;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Test completed!');
    console.log('='.repeat(60));
    
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

runTest().catch(console.error);
