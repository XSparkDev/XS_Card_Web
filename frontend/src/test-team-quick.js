// Quick Team Management Test
// Verifies the core team endpoints are accessible

const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjZkZTQwZjA0ODgxYzZhMDE2MTFlYjI4NGE0Yzk1YTI1MWU5MTEyNTAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzUzMzkzMzI4LCJ1c2VyX2lkIjoiRWNjeU1Ddjd1aVMxZVlIQjNaTXU2elJSMURHMiIsInN1YiI6IkVjY3lNQ3Y3dWlTMWVZSEIzWk11NnpSUjFERzIiLCJpYXQiOjE3NTMzOTMzMjgsImV4cCI6MTc1MzM5NjkyOCwiZW1haWwiOiJ0ZXN0ZWhha2tlQGd1ZnVtLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RlaGFra2VAZ3VmdW0uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.EB51NcT2bswsQmwJHHKYVJjVwZ5efyLpnr9UQykYyxrz78N2megbN0doM8qxQdpIlIPbT1XcWBoR5OIZQuwTT7WXHiRJ3cNv03akOhCn9FeyvDy5UZziHz-LjgT7VrkOFBGpZRV0DqtxVuxZQc-zn5X2c1XvAg3MOdktOyPq8uC0qxT9eqvT9Q1bIfgotIlF5q7cIa4A73-xavhlPbgaptYhWqbwASWk2nGwsG8QUySf6B8jZoofzTa5LSFLv9EkOGzWHz10_d3DwTFXZW5bPZ4Wb_Lq1efx6Sjw5-FsxbZVE6wtHpEgj_ig9F48EMrmbQzr61SjJqUg86y_CreTvg";
const ENTERPRISE_ID = "x-spark-test";
const API_BASE_URL = "http://localhost:8383";

console.log('🚀 Quick Team Management Test');
console.log(`🏢 Enterprise: ${ENTERPRISE_ID}`);
console.log(`🌐 API: ${API_BASE_URL}\n`);

// Test the exact requests made by TeamManagement.tsx
const quickTest = async () => {
  const headers = {
    'Authorization': `Bearer ${FIREBASE_TOKEN}`,
    'Content-Type': 'application/json'
  };

  console.log('1️⃣ Testing TeamManagement.tsx useEffect() - Get Departments');
  try {
    const deptUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments`;
    console.log(`   → ${deptUrl}`);
    
    const deptResponse = await fetch(deptUrl, { headers });
    const deptData = await deptResponse.json();
    
    console.log(`   ✅ Status: ${deptResponse.status}`);
    console.log(`   📊 Departments: ${deptData.departments ? deptData.departments.length : 0}`);
    
    if (deptData.departments && deptData.departments.length > 0) {
      const testDeptId = deptData.departments[0].id;
      console.log(`   📝 Using department: ${deptData.departments[0].name} (${testDeptId})`);
      
      console.log('\n2️⃣ Testing TeamManagement.tsx useEffect() - Get Teams');
      try {
        const teamsUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${testDeptId}/teams`;
        console.log(`   → ${teamsUrl}`);
        
        const teamsResponse = await fetch(teamsUrl, { headers });
        const teamsData = await teamsResponse.json();
        
        console.log(`   ✅ Status: ${teamsResponse.status}`);
        console.log(`   📊 Teams: ${teamsData.teams ? Object.keys(teamsData.teams).length : 0}`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }

      console.log('\n3️⃣ Testing TeamManagement.tsx useEffect() - Get Employees');
      try {
        const employeesUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${testDeptId}/employees`;
        console.log(`   → ${employeesUrl}`);
        
        const employeesResponse = await fetch(employeesUrl, { headers });
        const employeesData = await employeesResponse.json();
        
        console.log(`   ✅ Status: ${employeesResponse.status}`);
        console.log(`   📊 Employees: ${employeesData.employees ? Object.keys(employeesData.employees).length : 0}`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }

      console.log('\n4️⃣ Testing TeamManagement.tsx Create Team');
      try {
        const createUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${testDeptId}/teams`;
        console.log(`   → POST ${createUrl}`);
        
        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: "Quick Test Team",
            description: "Created by quick test",
            leaderId: null
          })
        });
        
        const createData = await createResponse.json();
        const testTeamId = createData.team?.id;
        
        console.log(`   ✅ Status: ${createResponse.status}`);
        console.log(`   🆔 Created: ${testTeamId}`);
        
        if (testTeamId) {
          console.log('\n5️⃣ Testing TeamManagement.tsx Delete Team');
          try {
            const deleteUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${testDeptId}/teams/${testTeamId}`;
            console.log(`   → DELETE ${deleteUrl}`);
            
            const deleteResponse = await fetch(deleteUrl, {
              method: 'DELETE',
              headers
            });
            
            console.log(`   ✅ Status: ${deleteResponse.status}`);
            console.log(`   🗑️ Deleted: ${testTeamId}`);
          } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🎯 Quick Test Complete!');
  console.log('💡 If all status codes are 200-299, your TeamManagement.tsx should work!');
};

quickTest(); 