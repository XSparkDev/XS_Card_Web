// Test script to check which team management endpoints are available
const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjZkZTQwZjA0ODgxYzZhMDE2MTFlYjI4NGE0Yzk1YTI1MWU5MTEyNTAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzUzNTY4MTkwLCJ1c2VyX2lkIjoiRWNjeU1Ddjd1aVMxZVlIQjNaTXU2elJSMURHMiIsInN1YiI6IkVjY3lNQ3Y3dWlTMWVZSEIzWk11NnpSUjFERzIiLCJpYXQiOjE3NTM1NjgxOTAsImV4cCI6MTc1MzU3MTc5MCwiZW1haWwiOiJ0ZXN0ZWhha2tlQGd1ZnVtLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RlaGFra2VAZ3VmdW0uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.CEPtaTiX-rwt51wFoeFhiezoFhqVWFItwe9VoHrao-nQPTvo3-ug9iSyEEGG_bFis-zjf74l55DRAxlN7eySmStZS7iQmFuC9gzuVTxHuIHRtBIoBaTLw3GemqmUq9vwmJz4BS9R8Vld4E_LQqe4QdYDf-CvwNy5xJQUzhEZQ0PJ2uCzJaZrxmgCIgJcPY7IRFAzoEig241fjK7Uxfa6T9q9uNfX6xOm997stsAZWPfQXPXz_y8E8jzb1rEsVIobvscTUw-ciOnLSeDWbgKeY9ZN28J-cWVj4AVkpgeghnUT8FhvUs3ZaMV4z_W0--BlVp-XCP6ET7s0sdyrgkYVrg";
const ENTERPRISE_ID = "x-spark-test";
const API_BASE_URL = "http://localhost:8383";

console.log('🔍 Testing Team Management Endpoints Availability');
console.log(`🏢 Enterprise: ${ENTERPRISE_ID}`);
console.log(`🌐 API: ${API_BASE_URL}\n`);

const headers = {
  'Authorization': `Bearer ${FIREBASE_TOKEN}`,
  'Content-Type': 'application/json'
};

// Test all team management endpoints
const testTeamEndpoints = async () => {
  const results = {};
  
  // Get a department first
  console.log('1️⃣ Getting departments...');
  try {
    const deptResponse = await fetch(`${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments`, { headers });
    const deptData = await deptResponse.json();
    const departments = deptData.departments || {};
    const departmentId = Object.keys(departments)[0];
    
    if (!departmentId) {
      console.log('❌ No departments found');
      return;
    }
    
    console.log(`✅ Found department: ${departmentId}`);
    results.departmentId = departmentId;
    
    // Test team endpoints
    console.log('\n2️⃣ Testing team endpoints...');
    
    // GET teams
    try {
      const teamsResponse = await fetch(`${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${departmentId}/teams`, { headers });
      console.log(`   GET /teams: ${teamsResponse.status}`);
      results.getTeams = teamsResponse.status;
      
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        const teams = teamsData.teams || {};
        const teamId = Object.keys(teams)[0];
        results.teamId = teamId;
        
        if (teamId) {
          console.log(`   ✅ Found team: ${teamId}`);
          
          // Test team member endpoints
          console.log('\n3️⃣ Testing team member endpoints...');
          
          // GET team members
          try {
            const membersResponse = await fetch(`${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${departmentId}/teams/${teamId}/members`, { headers });
            console.log(`   GET /teams/${teamId}/members: ${membersResponse.status}`);
            results.getMembers = membersResponse.status;
          } catch (error) {
            console.log(`   ❌ GET /teams/${teamId}/members: Error`);
            results.getMembers = 'Error';
          }
          
          // POST team member (add employee)
          try {
            const addMemberResponse = await fetch(`${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${departmentId}/teams/${teamId}/members/test-employee`, {
              method: 'POST',
              headers
            });
            console.log(`   POST /teams/${teamId}/members/{employeeId}: ${addMemberResponse.status}`);
            results.addMember = addMemberResponse.status;
          } catch (error) {
            console.log(`   ❌ POST /teams/${teamId}/members/{employeeId}: Error`);
            results.addMember = 'Error';
          }
          
          // DELETE team member (remove employee)
          try {
            const removeMemberResponse = await fetch(`${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${departmentId}/teams/${teamId}/members/test-employee`, {
              method: 'DELETE',
              headers
            });
            console.log(`   DELETE /teams/${teamId}/members/{employeeId}: ${removeMemberResponse.status}`);
            results.removeMember = removeMemberResponse.status;
          } catch (error) {
            console.log(`   ❌ DELETE /teams/${teamId}/members/{employeeId}: Error`);
            results.removeMember = 'Error';
          }
          
          // PUT team (assign leader)
          try {
            const assignLeaderResponse = await fetch(`${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${departmentId}/teams/${teamId}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({ leaderId: 'test-employee' })
            });
            console.log(`   PUT /teams/${teamId} (assign leader): ${assignLeaderResponse.status}`);
            results.assignLeader = assignLeaderResponse.status;
          } catch (error) {
            console.log(`   ❌ PUT /teams/${teamId} (assign leader): Error`);
            results.assignLeader = 'Error';
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ GET /teams: Error`);
      results.getTeams = 'Error';
    }
    
  } catch (error) {
    console.log('❌ Failed to get departments');
    results.departments = 'Error';
  }
  
  return results;
};

// Run the test
testTeamEndpoints().then(results => {
  console.log('\n📊 Endpoint Availability Results:');
  console.log('=' .repeat(50));
  
  Object.entries(results).forEach(([endpoint, status]) => {
    if (endpoint === 'departmentId' || endpoint === 'teamId') {
      console.log(`   ${endpoint}: ${status}`);
    } else {
      const statusIcon = status === 200 || status === 201 || status === 204 ? '✅' : '❌';
      console.log(`   ${statusIcon} ${endpoint}: ${status}`);
    }
  });
  
  console.log('\n💡 Summary:');
  if (results.getTeams === 200) {
    console.log('   ✅ Team CRUD operations are available');
  } else {
    console.log('   ❌ Team CRUD operations are NOT available');
  }
  
  if (results.getMembers === 200) {
    console.log('   ✅ Get team members is available');
  } else {
    console.log('   ❌ Get team members is NOT available');
  }
  
  if (results.addMember === 200 || results.addMember === 201) {
    console.log('   ✅ Add team member is available');
  } else {
    console.log('   ❌ Add team member is NOT available');
  }
  
  if (results.removeMember === 200 || results.removeMember === 204) {
    console.log('   ✅ Remove team member is available');
  } else {
    console.log('   ❌ Remove team member is NOT available');
  }
  
  if (results.assignLeader === 200) {
    console.log('   ✅ Assign team leader is available');
  } else {
    console.log('   ❌ Assign team leader is NOT available');
  }
}); 