// Simple backend connection test
// Run with: node test-backend-connection.js

const API_BASE_URL = 'http://localhost:8383';

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test basic connectivity
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET'
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Backend is running');
      console.log('Response:', data);
    } else {
      const data = await response.text();
      console.log('⚠️ Backend responded but with error');
      console.log('Response:', data);
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('💡 Make sure the backend server is running on localhost:8383');
  }
}

testBackendConnection();

