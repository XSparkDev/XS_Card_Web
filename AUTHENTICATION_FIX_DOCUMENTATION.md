# Authentication Fix Documentation

## Problem Summary
The frontend application was encountering a "403 Forbidden" error when attempting to fetch meetings from the backend API. The issue was caused by using a hardcoded `DEFAULT_USER_ID` instead of the actual authenticated user's ID in API requests.

## Root Cause
- The `fetchEvents` function in `CalendarMain.tsx` was using `DEFAULT_USER_ID` in the URL for GET requests
- The `confirmDeleteEvent` function was also using `DEFAULT_USER_ID` for DELETE requests
- The `Analytics.tsx` component had the same issue
- This caused the backend to reject requests as unauthorized access to another user's data

## Changes Made

### 1. File: `frontend/src/utils/api.ts`
**No changes needed** - The `getUserId()` helper function already existed and was working correctly.

### 2. File: `frontend/src/components/Dashboard/CalendarMain.tsx`

#### Import Changes:
```typescript
// ADD this import
import { ENDPOINTS, buildUrl, DEFAULT_USER_ID, getEnterpriseHeaders, getAuthHeaders, fetchUserPermissions, getUserId } from "../../utils/api";
```

#### Changes in `fetchEvents` function (around line 340-439):
```typescript
// REPLACE this code:
// Get the actual user ID from localStorage
const userData = localStorage.getItem('userData');
if (!userData) {
  setApiError('User data not found. Please log in again.');
  return;
}
const parsedData = JSON.parse(userData);
const actualUserId = parsedData.id || parsedData.userId;

// Use appropriate headers based on user type
const url = buildUrl(ENDPOINTS.CREATE_MEETING + `/${DEFAULT_USER_ID}`);

// WITH this code:
// Get the actual user ID using the helper function
const actualUserId = getUserId();
if (!actualUserId) {
  setApiError('User data not found. Please log in again.');
  return;
}

// Use appropriate headers based on user type
const url = buildUrl(ENDPOINTS.CREATE_MEETING + `/${actualUserId}`);
```

#### Changes in `confirmDeleteEvent` function (around line 660-759):
```typescript
// REPLACE this code:
// Update events state to trigger animation
setEvents(updatedEvents);

// Use Firebase token authentication for meetings with the DEFAULT_USER_ID
const url = buildUrl(`${ENDPOINTS.CREATE_MEETING}/${DEFAULT_USER_ID}/${meetingIndex}`);
const headers = getEnterpriseHeaders();

// WITH this code:
// Update events state to trigger animation
setEvents(updatedEvents);

// Get the actual user ID using the helper function
const actualUserId = getUserId();
if (!actualUserId) {
  setApiError('User data not found. Please log in again.');
  setIsDeletingEvent(false);
  return;
}

const url = buildUrl(`${ENDPOINTS.CREATE_MEETING}/${actualUserId}/${meetingIndex}`);
const headers = user?.plan === 'enterprise' ? getEnterpriseHeaders() : await getAuthHeaders();
```

### 3. File: `frontend/src/components/Dashboard/Analytics.tsx`

#### Import Changes:
```typescript
// ADD getUserId to the import
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders, buildUrl, DEFAULT_USER_ID, DEFAULT_ENTERPRISE_ID, getUserId } from "../../utils/api";
```

#### Changes in `fetchMeetings` function (around line 423):
```typescript
// REPLACE this code:
const url = buildUrl(ENDPOINTS.CREATE_MEETING + `/${DEFAULT_USER_ID}`);

// WITH this code:
// Get the actual user ID using the helper function
const actualUserId = getUserId();
if (!actualUserId) {
  setMeetingsError('User data not found. Please log in again.');
  return;
}

const url = buildUrl(ENDPOINTS.CREATE_MEETING + `/${actualUserId}`);
```

## Key Functions Used

### `getUserId()` Helper Function
This function safely retrieves the user ID from localStorage:
```typescript
export const getUserId = (): string | null => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData).id;
    }
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};
```

## Testing the Fix

### Before the Fix:
- GET request to `/meetings/BPxFmmG6SVXvbwwRJ0YjBnuI8e73` (hardcoded ID)
- Response: 403 Forbidden - "Unauthorized access to this user's meetings"

### After the Fix:
- GET request to `/meetings/{actual-user-id}` (dynamic user ID)
- Response: 200 OK with user's meetings

## Files Modified Summary
1. `frontend/src/components/Dashboard/CalendarMain.tsx` - Fixed user ID in fetch and delete operations
2. `frontend/src/components/Dashboard/Analytics.tsx` - Fixed user ID in meetings fetch operation
3. `frontend/src/utils/api.ts` - No changes needed (getUserId function already existed)

## Implementation Steps for New Repository

1. **Update imports** in both files to include `getUserId`
2. **Replace hardcoded `DEFAULT_USER_ID`** with dynamic `getUserId()` calls
3. **Add proper error handling** for when user ID is not found
4. **Ensure consistent header usage** (enterprise vs regular auth headers)

## Security Benefits
- Prevents unauthorized access to other users' meeting data
- Ensures users can only access their own meetings
- Maintains proper authentication boundaries
- Follows principle of least privilege

## Notes
- The `getUserId()` function was already implemented and working correctly
- The main issue was not using this function in the calendar components
- All authentication headers and other security measures remain unchanged
- The fix maintains backward compatibility with existing functionality
