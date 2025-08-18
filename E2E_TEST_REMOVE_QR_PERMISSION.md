# E2E Test: Remove QR Generation Permission from Employee

## 🧪 **Test Objective**
As an admin, remove the QR generation permission from the employee user (tshehlap@gmail.com) and verify the change takes effect.

## 👥 **Test Users**
- **Admin**: `xenacoh740@percyfx.com` / `Password.10`
- **Employee**: `tshehlap@gmail.com` / `P.zzle$0`

---

## 📋 **Pre-Test State**

### **Employee Current Permissions:**
- ✅ **Can**: View cards, edit cards, share cards, generate QR codes
- ❌ **Cannot**: Create cards, delete cards, manage all cards

### **Expected Post-Test State:**
- ✅ **Can**: View cards, edit cards, share cards
- ❌ **Cannot**: Generate QR codes, create cards, delete cards, manage all cards

---

## 🚀 **Step-by-Step Test Execution**

### **Step 1: Start the Frontend**
```bash
cd frontend
npm run dev
```
**Expected**: Frontend starts at http://localhost:5173

### **Step 2: Login as Admin**
1. Open browser to http://localhost:5173
2. Login with admin credentials:
   - **Email**: `xenacoh740@percyfx.com`
   - **Password**: `Password.10`
3. **Verify**: Successfully logged in as administrator

### **Step 3: Navigate to Security Page**
1. Click on "Security" in the sidebar
2. Click on "Access Control" tab
3. **Verify**: Role summaries are displayed (Administrator, Manager, Employee)

### **Step 4: Access Employee Users**
1. Find the "Employee" role card
2. Click "View Users" button
3. **Verify**: List of employees is displayed, including tshehlap@gmail.com

### **Step 5: Edit Employee Permissions**
1. Find `tshehlap@gmail.com` in the employee list
2. Click "Edit Permissions" button
3. **Verify**: Permission editor modal opens

### **Step 6: Remove QR Generation Permission**
1. In the permission editor, find "Generate QR Codes" row
2. Change the dropdown from "Inherit from Role" to "Force Disable"
3. **Verify**: 
   - Effective permission changes from "Yes" to "No"
   - Override indicator appears showing "Removed"
   - Save button becomes active

### **Step 7: Save Changes**
1. Click "Save Changes" button
2. **Verify**: 
   - Success message appears
   - Modal closes
   - User list shows override indicator "-1" next to tshehlap@gmail.com

### **Step 8: Verify Security Page Changes**
1. **Verify**: User card shows override indicator "-1"
2. **Verify**: User still appears in Employee role list
3. **Verify**: Override is visible and persistent

---

## 🔍 **Verification Steps**

### **Step 9: Test as Employee (Login Switch)**
1. Logout from admin account
2. Login as employee:
   - **Email**: `tshehlap@gmail.com`
   - **Password**: `P.zzle$0`
3. **Verify**: Successfully logged in as employee

### **Step 10: Verify Business Cards Page**
1. Navigate to "Business Cards" page
2. **Verify**: 
   - QR generation buttons are **disabled or hidden**
   - View, edit, and share buttons remain **enabled**
   - Cannot access QR generation functionality

### **Step 11: Test QR Generation (Should Fail)**
1. Try to find QR generation options
2. **Verify**: 
   - QR generation buttons are not accessible
   - No QR generation functionality available
   - Other card operations still work

---

## ✅ **Success Criteria**

### **Security Page (Admin View):**
- ✅ Override indicator shows "-1" next to user name
- ✅ Permission editor shows "Force Disable" for QR generation
- ✅ Effective permissions show QR generation as "No"
- ✅ Override is saved and persistent

### **Business Cards Page (Employee View):**
- ✅ QR generation buttons are disabled/hidden
- ✅ Other buttons (view, edit, share) remain enabled
- ✅ Cannot access QR generation functionality
- ✅ Core card operations still work

### **Permission Calculation:**
- ✅ Base role permissions: `['viewBusinessCards', 'editBusinessCards', 'shareBusinessCards', 'generateQRCodes']`
- ✅ Individual overrides: `{ removed: ['generateQRCodes'], added: [] }`
- ✅ Effective permissions: `['viewBusinessCards', 'editBusinessCards', 'shareBusinessCards']`

---

## ⚠️ **Failure Indicators**

### **If Test Fails:**
- ❌ Employee can still generate QR codes
- ❌ UI doesn't reflect permission change
- ❌ Override not saved or visible
- ❌ Other permissions accidentally changed
- ❌ Business Cards page still shows QR buttons

---

## 🔄 **Cleanup (Optional)**

### **To Restore QR Permission:**
1. Login as admin again
2. Navigate to Security → Access Control → View Users (Employee)
3. Click "Edit Permissions" for tshehlap@gmail.com
4. Change "Generate QR Codes" back to "Inherit from Role"
5. Save changes

---

## 📊 **Expected API Calls**

### **Backend Request:**
```
PUT /api/enterprise/{enterpriseId}/users/{userId}/permissions
Content-Type: application/json

{
  "individualPermissions": {
    "removed": ["generateQRCodes"],
    "added": []
  }
}
```

### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "updatedPermissions": {
      "removed": ["generateQRCodes"],
      "added": []
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "updatedBy": "admin-user-id"
  }
}
```

---

## 🎯 **Test Summary**

This E2E test verifies that:
1. ✅ Admin can modify individual user permissions
2. ✅ Permission changes are saved to backend
3. ✅ UI reflects permission changes immediately
4. ✅ Employee loses specific functionality (QR generation)
5. ✅ Other permissions remain unaffected
6. ✅ Override indicators work correctly
7. ✅ Business Cards page enforces permission restrictions

**Test Status**: Ready for execution
**Expected Duration**: 10-15 minutes
**Risk Level**: Low (easily reversible)
