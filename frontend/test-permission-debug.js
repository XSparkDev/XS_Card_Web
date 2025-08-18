// Debug script to test permission updates
const testPermissionUpdate = async () => {
  console.log('🔍 Testing permission update functionality...');
  
  // Test data
  const userId = '1'; // Replace with actual user ID
  const individualPermissions = {
    removed: ['editCards'],
    added: ['exportCards']
  };
  
  console.log('📋 Test data:', {
    userId,
    individualPermissions
  });
  
  // Simulate the API call
  const url = `http://localhost:8383/api/enterprise/x-spark-test/users/${userId}/permissions`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to replace this
  };
  
  console.log('🌐 API URL:', url);
  console.log('📤 Request payload:', JSON.stringify({ individualPermissions }, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ individualPermissions })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ Success:', result);
    } else {
      console.error('❌ Error:', response.status, responseText);
    }
  } catch (error) {
    console.error('❌ Exception:', error);
  }
};

// Run the test
testPermissionUpdate();
