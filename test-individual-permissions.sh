#!/bin/bash

# Test script for Individual Permissions Integration using curl
# Run with: bash test-individual-permissions.sh

API_BASE_URL="http://localhost:8383"
ENTERPRISE_ID="x-spark-test"
FIREBASE_TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjU3YmZiMmExMWRkZmZjMGFkMmU2ODE0YzY4NzYzYjhjNjg3NTgxZDgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzU1MjkxNjg0LCJ1c2VyX2lkIjoiQlB4Rm1tRzZTVlh2Ynd3UkowWWpCbnVJOGU3MyIsInN1YiI6IkJQeEZtbUc2U1ZYdmJ3d1JKMFlqQm51SThlNzMiLCJpYXQiOjE3NTUyOTE2ODQsImV4cCI6MTc1NTI5NTI4NCwiZW1haWwiOiJ4ZW5hY29oNzQwQHBlcmN5ZnguY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsieGVuYWNvaDc0MEBwZXJjeWZ4LmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.NDaVE7VRZe4-SBVt7ekvtCDltQhfWg9h4o30Jjs_3nZkc47Wkmf7T-FHF0eqNQL_SBfAaVy_VVHZUbekbj9Tqaf_ZD23Fxga4RZnZ4g8YZGmUpkautwhs5fL_eHxKy1cbrjzjWMGm-O0lPkvVeIeQUjqgb_-xt3irFr2D_alH4zvJZHX3FOU09lYPXNq60-z-JgU5a6WDOHqLWwahM6Q43XlPaCkYgYnuj_ZMbqjF9HkECCDQEM801CA88x6qEvpRqXq7cTJ5RUtRA5NZwI_NXWIJ0UCUaLxn5Lnjhh7rU0ave99Te5egnRONJcCGiSTYy-UxNBASpvEm3zANdPk5Q"

echo "🚀 Starting Individual Permissions Integration Tests with curl"
echo "================================================================"

# Test 1: Get employees with individual permissions
echo ""
echo "TEST 1: Get Employees with Individual Permissions"
echo "=================================================="
curl -X GET \
  "${API_BASE_URL}/api/enterprises/${ENTERPRISE_ID}/employees" \
  -H "Authorization: Bearer ${FIREBASE_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  | jq '.' 2>/dev/null || cat

# Test 2: Update John Doe (Manager) permissions
echo ""
echo "TEST 2: Update John Doe (Manager) Permissions"
echo "=============================================="
curl -X PUT \
  "${API_BASE_URL}/api/enterprises/${ENTERPRISE_ID}/users/user-001/permissions" \
  -H "Authorization: Bearer ${FIREBASE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "individualPermissions": {
      "removed": ["createCards", "deleteCards"],
      "added": ["manageAllCards"]
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  | jq '.' 2>/dev/null || cat

# Test 3: Update Jane Smith (Employee) permissions
echo ""
echo "TEST 3: Update Jane Smith (Employee) Permissions"
echo "================================================"
curl -X PUT \
  "${API_BASE_URL}/api/enterprises/${ENTERPRISE_ID}/users/user-002/permissions" \
  -H "Authorization: Bearer ${FIREBASE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "individualPermissions": {
      "removed": [],
      "added": ["deleteCards", "exportCards"]
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  | jq '.' 2>/dev/null || cat

# Test 4: Update Bob Wilson (Administrator) permissions
echo ""
echo "TEST 4: Update Bob Wilson (Administrator) Permissions"
echo "====================================================="
curl -X PUT \
  "${API_BASE_URL}/api/enterprises/${ENTERPRISE_ID}/users/user-003/permissions" \
  -H "Authorization: Bearer ${FIREBASE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "individualPermissions": {
      "removed": ["deleteCards", "manageAllCards"],
      "added": []
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  | jq '.' 2>/dev/null || cat

# Test 5: Test invalid permissions (should fail)
echo ""
echo "TEST 5: Invalid Permissions Error Handling"
echo "=========================================="
curl -X PUT \
  "${API_BASE_URL}/api/enterprises/${ENTERPRISE_ID}/users/user-001/permissions" \
  -H "Authorization: Bearer ${FIREBASE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "individualPermissions": {
      "removed": ["invalidPermission"],
      "added": ["anotherInvalidPermission"]
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  | jq '.' 2>/dev/null || cat

# Test 6: Verify updated data
echo ""
echo "TEST 6: Verify Updated Data"
echo "==========================="
curl -X GET \
  "${API_BASE_URL}/api/enterprises/${ENTERPRISE_ID}/employees" \
  -H "Authorization: Bearer ${FIREBASE_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  | jq '.' 2>/dev/null || cat

echo ""
echo "🎉 All curl tests completed!"
echo "============================"
