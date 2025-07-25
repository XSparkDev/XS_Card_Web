// Quick Department Component Test
// Verifies the core requests made by Department.tsx

const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjZkZTQwZjA0ODgxYzZhMDE2MTFlYjI4NGE0Yzk1YTI1MWU5MTEyNTAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzUzMzkzMzI4LCJ1c2VyX2lkIjoiRWNjeU1Ddjd1aVMxZVlIQjNaTXU2elJSMURHMiIsInN1YiI6IkVjY3lNQ3Y3dWlTMWVZSEIzWk11NnpSUjFERzIiLCJpYXQiOjE3NTMzOTMzMjgsImV4cCI6MTc1MzM5NjkyOCwiZW1haWwiOiJ0ZXN0ZWhha2tlQGd1ZnVtLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RlaGFra2VAZ3VmdW0uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.EB51NcT2bswsQmwJHHKYVJjVwZ5efyLpnr9UQykYyxrz78N2megbN0doM8qxQdpIlIPbT1XcWBoR5OIZQuwTT7WXHiRJ3cNv03akOhCn9FeyvDy5UZziHz-LjgT7VrkOFBGpZRV0DqtxVuxZQc-zn5X2c1XvAg3MOdktOyPq8uC0qxT9eqvT9Q1bIfgotIlF5q7cIa4A73-xavhlPbgaptYhWqbwASWk2nGwsG8QUySf6B8jZoofzTa5LSFLv9EkOGzWHz10_d3DwTFXZW5bPZ4Wb_Lq1efx6Sjw5-FsxbZVE6wtHpEgj_ig9F48EMrmbQzr61SjJqUg86y_CreTvg";
const ENTERPRISE_ID = "x-spark-test";
const API_BASE_URL = "http://localhost:8383";

console.log('🚀 Quick Department Component Test');
console.log(`🏢 Enterprise: ${ENTERPRISE_ID}`);
console.log(`🌐 API: ${API_BASE_URL}\n`);

// Test the exact requests made by Department.tsx
const quickTest = async () => {
  const headers = {
    'Authorization': `Bearer ${FIREBASE_TOKEN}`,
    'Content-Type': 'application/json'
  };

  console.log('1️⃣ Testing Department.tsx useEffect() - Get Departments');
  try {
    const deptUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments`;
    console.log(`   → ${deptUrl}`);
    
    const deptResponse = await fetch(deptUrl, { headers });
    const deptData = await deptResponse.json();
    
    console.log(`   ✅ Status: ${deptResponse.status}`);
    console.log(`   📊 Departments: ${deptData.departments ? deptData.departments.length : 0}`);
    console.log(`   📝 Sample:`, deptData.departments?.[0]?.name || 'None');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n2️⃣ Testing Department.tsx useEffect() - Get Cards');
  try {
    const cardsUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/cards`;
    console.log(`   → ${cardsUrl}`);
    
    const cardsResponse = await fetch(cardsUrl, { headers });
    const cardsData = await cardsResponse.json();
    
    console.log(`   ✅ Status: ${cardsResponse.status}`);
    console.log(`   📊 Cards: ${cardsData.cards ? Object.keys(cardsData.cards).length : 0}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n3️⃣ Testing Department.tsx Create Department');
  let testDeptId = null;
  try {
    const createUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments`;
    console.log(`   → POST ${createUrl}`);
    
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: "Quick Test Dept",
        description: "Created by quick test",
        managers: []
      })
    });
    
    const createData = await createResponse.json();
    testDeptId = createData.department?.id;
    
    console.log(`   ✅ Status: ${createResponse.status}`);
    console.log(`   🆔 Created: ${testDeptId}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  if (testDeptId) {
    console.log('\n4️⃣ Testing Department.tsx Delete Department');
    try {
      const deleteUrl = `${API_BASE_URL}/enterprise/${ENTERPRISE_ID}/departments/${testDeptId}`;
      console.log(`   → DELETE ${deleteUrl}`);
      
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers
      });
      
      console.log(`   ✅ Status: ${deleteResponse.status}`);
      console.log(`   🗑️ Deleted: ${testDeptId}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎯 Quick Test Complete!');
  console.log('💡 If all status codes are 200-299, your Department.tsx should work!');
};

quickTest(); 