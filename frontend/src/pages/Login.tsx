import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaSignInAlt, FaCode, FaUser, FaLock } from 'react-icons/fa';

// Import API utilities to get the correct base URL
import { API_BASE_URL, buildEnterpriseUrl, getEnterpriseHeaders } from '../utils/api';

interface LoginProps {
  onLogin: (token: string, userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  console.log('🎨 Login component rendered');
  
  // Form login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Token login state
  const [token, setToken] = useState('');
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');

  // Developer mode toggle
  const [showDeveloperMode, setShowDeveloperMode] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  // Test credentials for quick login
  const testCredentials = [
    { label: 'Select Test User...', email: '', password: '' },
    { label: '🔧 Admin User', email: 'xenacoh740@percyfx.com', password: 'Password.10' },
    { label: '👔 Manager User', email: 'xapayi9567@coursora.com', password: 'Password.10' },
    { label: '👤 Employee 1', email: 'higenaw972@fursee.com', password: 'Password.10' },
    { label: '👤 Employee 2', email: 'xicepo4195@futebr.com', password: 'Password.10' },
    { label: '🧪 Test User 1', email: 'tshehlap@gmail.com', password: 'P.zzle$0' },
    { label: '🧪 Test User 2', email: 'devel66949@ahanim.com', password: '123456' },
    { label: '🧪 Test User 3', email: 'sibef28831@aperiol.com', password: '123456' },
    { label: '👤 Individual User', email: 'testehakke@gufum.com', password: '123456' }
  ];

  const handleTestUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value);
    if (selectedIndex > 0) { // Skip the first "Select Test User..." option
      const selectedUser = testCredentials[selectedIndex];
      setEmail(selectedUser.email);
      setPassword(selectedUser.password);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login with:', { email: email.trim() });
      
      const response = await fetch(`${API_BASE_URL}/SignIn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is empty
      const responseText = await response.text();
      console.log('📡 Raw response:', responseText);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📡 Parsed response data:', data);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Login failed`);
      }

      // Check for either 'success' field or 'message' field indicating success
      const isSuccess = data.success === true || data.message === 'Sign in successful';
      
      if (isSuccess && data.token) {
        console.log('✅ Login successful, storing auth data');
        console.log('📋 Response data:', data);
        
        // Store authentication data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Debug: Log the user data being stored
        console.log('🔍 User data from backend:', data.user);
        console.log('🔍 User type analysis:', {
          plan: data.user.plan,
          isEmployee: data.user.isEmployee,
          role: data.user.role,
          email: data.user.email
        });
        
        console.log('🔐 Calling onLogin callback with token and user data');
        // Call the onLogin callback
        onLogin(data.token, data.user);
        
        console.log('✅ Login process completed');
        
        // Small delay to ensure state updates properly
        setTimeout(() => {
          console.log('🔄 Login state update completed');
        }, 100);
      } else {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTokenLoading(true);
    setTokenError('');

    try {
      if (!token.trim()) {
        throw new Error('Please enter a token');
      }

      console.log('🔑 Attempting token verification...');

      // For token login, we'll assume the token is valid if it's not empty
      // This is mainly for development/testing purposes
      const trimmedToken = token.trim();
      
      if (!trimmedToken) {
        throw new Error('Please enter a valid token');
      }

      // Try to decode the JWT token to verify it's valid
      try {
        const tokenParts = trimmedToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT token format');
        }

        // Decode the payload (second part)
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('🔍 Token payload:', payload);

        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          throw new Error('Token has expired');
        }

        // Create a basic user object from the token payload
        // Determine user type based on token payload or email domain
        const email = payload.email || 'unknown@example.com';
        const role = payload.role || 'Employee';
        
        // Check if this is an enterprise user based on email domain or role
        // Enterprise users typically have company email domains or specific roles
        const isEnterpriseUser = email.includes('@company.com') || 
                                email.includes('@enterprise.com') ||
                                email.includes('@corp.com') ||
                                role === 'Administrator' ||
                                role === 'Admin' ||
                                role === 'Manager';
        
        const userData = {
          id: payload.user_id || payload.sub || 'unknown',
          email: email,
          name: payload.name || payload.email || 'Unknown User',
          role: role,
          plan: isEnterpriseUser ? 'enterprise' : 'individual',
          isEmployee: isEnterpriseUser
        };

        console.log('✅ Token verification successful, storing auth data');
        console.log('📋 User data created from token:', userData);
        
        // Store authentication data
        localStorage.setItem('authToken', trimmedToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        console.log('🔐 Calling onLogin callback with token and user data');
        // Call the onLogin callback
        onLogin(trimmedToken, userData);
        
        console.log('✅ Token login process completed');
        
        // Small delay to ensure state updates properly
        setTimeout(() => {
          console.log('🔄 Token login state update completed');
        }, 100);
      } catch (decodeError) {
        console.error('❌ Token decode error:', decodeError);
        throw new Error('Invalid token format or token has expired');
      }
    } catch (error) {
      console.error('❌ Token login error:', error);
      setTokenError(error instanceof Error ? error.message : 'Invalid token. Please try again.');
    } finally {
      setIsTokenLoading(false);
    }
  };

  const toggleDeveloperMode = () => {
    setShowDeveloperMode(!showDeveloperMode);
    // Clear errors when switching modes
    setError('');
    setTokenError('');
  };

  return (
    <div className="login-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '500px',
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.5rem 0' }}>
            XS Card
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>Digital Business Cards</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', margin: '0 0 0.5rem 0' }}>
            Welcome Back
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>Sign in to your account to continue</p>
        </div>

        {/* Test User Selector */}
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          borderRadius: '0.5rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            marginBottom: '0.75rem' 
          }}>
            <span style={{ fontSize: '1.25rem' }}>🧪</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#0c4a6e' }}>
                Quick Test Login
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#0369a1' }}>
                Select a test user to auto-fill credentials
              </p>
            </div>
          </div>
          <select
            onChange={handleTestUserSelect}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #bae6fd',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              backgroundColor: 'white',
              color: '#374151'
            }}
          >
            {testCredentials.map((credential, index) => (
              <option key={index} value={index}>
                {credential.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <button 
            style={{ 
              padding: '0.5rem 1rem', 
              marginRight: '0.5rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.375rem',
              background: activeTab === 'form' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'form' ? 'white' : '#374151',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('form')}
          >
            Login Form
          </button>
          <button 
            style={{ 
              padding: '0.5rem 1rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.375rem',
              background: activeTab === 'token' ? '#3b82f6' : '#f3f4f6',
              color: activeTab === 'token' ? 'white' : '#374151',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('token')}
          >
            Token Login
          </button>
        </div>

        {activeTab === 'form' ? (
          <form onSubmit={handleFormLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
                disabled={isLoading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '2.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#6b7280'
                  }}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca', 
                color: '#dc2626', 
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                opacity: (isLoading || !email.trim() || !password.trim()) ? 0.5 : 1
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #bae6fd', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🔧</span>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#0c4a6e' }}>
                  Developer Token Access
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#0369a1' }}>
                  Use a JWT token obtained from Postman or API testing
                </p>
              </div>
            </div>

            <form onSubmit={handleTokenLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  JWT Token
                </label>
                <textarea
                  placeholder="Paste your JWT token here..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontFamily: 'Courier New, monospace',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  disabled={isTokenLoading}
                  rows={4}
                />
              </div>

              {tokenError && (
                <div style={{ 
                  padding: '0.75rem', 
                  backgroundColor: '#fef2f2', 
                  border: '1px solid #fecaca', 
                  color: '#dc2626', 
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}>
                  {tokenError}
                </div>
              )}

              <button
                type="submit"
                disabled={isTokenLoading || !token.trim()}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  opacity: (isTokenLoading || !token.trim()) ? 0.5 : 1
                }}
              >
                {isTokenLoading ? 'Verifying Token...' : 'Login with Token'}
              </button>
            </form>

            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                How to get a token:
              </h5>
              <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>Open Postman or your API client</li>
                <li>POST to <code style={{ backgroundColor: '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>/api/auth/signin</code> with your credentials</li>
                <li>Copy the <code style={{ backgroundColor: '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>token</code> from the response</li>
                <li>Paste it above and click "Login with Token"</li>
              </ol>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
          <p>&copy; 2024 XS Card. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
