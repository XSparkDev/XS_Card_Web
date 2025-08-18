// Script to get a fresh Firebase token
// Run with: node get-token.js

const API_BASE_URL = 'http://localhost:8383';

async function getToken() {
  console.log('🔐 Getting fresh Firebase token...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/SignIn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'xenacoh740@percyfx.com',
        password: 'Password.10'
      })
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('Token:', data.token || data.idToken || data.accessToken);
      console.log('Full response:', JSON.stringify(data, null, 2));
      return data.token || data.idToken || data.accessToken;
    } else {
      const errorData = await response.text();
      console.log('❌ Login failed:');
      console.log(errorData);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Login request failed:', error.message);
    return null;
  }
}

getToken();

