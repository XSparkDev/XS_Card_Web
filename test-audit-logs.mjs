import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:8383';
const ENTERPRISE_ID = 'x-spark-test';
const FIREBASE_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjkyZTg4M2NjNDY2M2E2MzMyYWRhNmJjMWU0N2YzZmY1ZTRjOGI1ZDciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzU1NjM4OTY2LCJ1c2VyX2lkIjoieXk5cHJuVThzTVdzam9RVmFIaVpTUXJ3S0ZKMiIsInN1YiI6Inl5OXByblU4c01Xc2pvUVZhSGlaU1Fyd0tGSjIiLCJpYXQiOjE3NTU2Mzg5NjYsImV4cCI6MTc1NTY0MjU2NiwiZW1haWwiOiJoaWdlbmF3OTcyQGZ1cnNlZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJoaWdlbmF3OTcyQGZ1cnNlZS5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.jTL6i6znaIugriEb1kPdoXE4y3ugvggh34rhPUQDgvABGXj79EmREpbpiO7216abYoBd9m_4My2mEVBJDGeJyutcmS0-TyX7RDKM69M2lUiqJHrlYFIiVDo5Dpbkkrw4SxWGhKEtmEXebyCPYGZmVAr2sy9rO7C5Vjab-MNMD2VkNGIdGW6zBocXOLW1arh25SxY--WbHtcuSlC4j5YO5sDAQg1ow-5C87Nr1k_aSdI8H9iIfuTuuVzAZocib6dn18mv0aHIs7znoIuQpqUO27s_-TuVXnir8vMY2639CiC_qrgiaB5x40TqT9eWST1_WxRSS5OUYEGbTuY8zVOSaA";

async function testAuditLogs() {
  try {
    console.log('🔍 Testing Audit Logs API...');
    
    const url = `${API_BASE_URL}/api/enterprise/${ENTERPRISE_ID}/security/logs?timeframe=24h&limit=10`;
    const headers = {
      'Authorization': `Bearer ${FIREBASE_TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    console.log('📡 Making request to:', url);
    console.log('🔑 Using token:', FIREBASE_TOKEN.substring(0, 50) + '...');
    
    const response = await fetch(url, { headers });
    
    console.log('📥 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Success! Response data:', JSON.stringify(data, null, 2));
    
    if (data.status && data.data) {
      console.log('📊 Logs found:', data.data.logs?.length || 0);
      console.log('📈 Total count:', data.data.totalCount);
      console.log('🔄 Has more:', data.data.hasMore);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuditLogs();

