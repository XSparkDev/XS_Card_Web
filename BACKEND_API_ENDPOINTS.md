# 🔗 XSCard Backend API Endpoints Guide

This document contains all the endpoints your backend needs to implement for the comprehensive billing system, along with detailed payload examples.

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Subscription Management](#subscription-management)
3. [Payment Management](#payment-management)
4. [Enterprise Inquiry](#enterprise-inquiry)
5. [Enterprise Account Management](#enterprise-account-management)
6. [Error Handling](#error-handling)
7. [Testing Guide](#testing-guide)

---

## 🔐 Authentication

All endpoints require the `Authorization` header:
```
Authorization: Bearer <user_token>
```

**Base URL:** `http://localhost:8383` (development) or `https://xscard-app.onrender.com` (production)

---

## 📊 Subscription Management

### GET `/subscription/status`
**Purpose:** Get current user's subscription status

**Headers:**
```json
{
  "Authorization": "Bearer <user_token>",
  "Content-Type": "application/json"
}
```

**Response:**
```json
{
  "success": true,
  "data": {    "subscriptionStatus": "active",
    "subscriptionPlan": "MONTHLY_PLAN",
    "subscriptionReference": "sub_1234567890",
    "subscriptionStart": "2024-01-01T00:00:00Z",
    "subscriptionEnd": "2024-02-01T00:00:00Z",
    "trialStartDate": "2024-01-01T00:00:00Z",
    "trialEndDate": "2024-01-08T00:00:00Z",
    "customerCode": "CUS_1234567890",
    "subscriptionCode": "SUB_1234567890",
    "isActive": true,
    "plan": "premium",
    "amount": 159.99
  }
}
```

**Possible `subscriptionStatus` values:**
- `none` - No subscription
- `trial` - Trial period
- `active` - Active subscription
- `cancelled` - Cancelled subscription
- `past_due` - Payment overdue

**Possible `plan` values:**
- `free` - Free plan
- `premium` - Premium plan
- `enterprise` - Enterprise plan

---

### GET `/subscription/plans`
**Purpose:** Get available subscription plans

**Response:**
```json
{
  "success": true,  "data": [
    {
      "id": "MONTHLY_PLAN",
      "name": "Monthly Subscription",
      "amount": 159.99,
      "interval": "monthly",
      "description": "XS Card Monthly Subscription",
      "trialDays": 0,
      "planCode": "PLN_25xliarx7epm9ct",
      "features": [
        "Unlimited cards",
        "Advanced analytics",
        "Priority support",
        "Custom branding"
      ]
    },
    {
      "id": "ANNUAL_PLAN",
      "name": "Annual Subscription",
      "amount": 1800.00,
      "interval": "annually",
      "description": "XS Card Annual Subscription",
      "trialDays": 0,
      "planCode": "PLN_kzb7lj21vrehzeq",
      "features": [
        "Unlimited cards",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "2 months free"
      ]
    }
  ]
}
```

---

### GET `/subscription/logs`
**Purpose:** Get billing activity logs for the user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "log_001",
      "action": "subscription_created",
      "resource": "subscription",
      "userId": "user_123",
      "resourceId": "sub_1234567890",
      "timestamp": "2024-01-01T00:00:00Z",      "details": {
        "type": "subscription",        "plan": "MONTHLY_PLAN",
        "amount": 159.99,
        "interval": "monthly"
      }
    },
    {
      "id": "log_002",
      "action": "payment_successful",
      "resource": "payment",
      "userId": "user_123",
      "resourceId": "pay_1234567890",
      "timestamp": "2024-01-01T00:00:00Z",      "details": {
        "type": "payment",
        "amount": 159.99,
        "plan": "MONTHLY_PLAN"
      }
    },
    {
      "id": "log_003",
      "action": "subscription_cancelled",
      "resource": "subscription",
      "userId": "user_123",
      "resourceId": "sub_1234567890",
      "timestamp": "2024-01-15T00:00:00Z",      "details": {
        "type": "cancellation",
        "reason": "Too expensive",
        "plan": "MONTHLY_PLAN"
      }
    }
  ]
}
```

**Possible `action` values:**
- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `payment_successful`
- `payment_failed`
- `trial_started`
- `trial_ended`

---

### POST `/subscription/cancel`
**Purpose:** Cancel user's subscription

**Request Body:**
```json
{
  "reason": "Too expensive",
  "feedback": "The service is great but beyond my budget right now",
  "immediateCancel": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "subscriptionStatus": "cancelled",
    "cancellationDate": "2024-01-15T00:00:00Z",
    "serviceEndDate": "2024-02-01T00:00:00Z"
  }
}
```

---

## 💳 Payment Management

### POST `/payment/initialize`
**Purpose:** Initialize payment for subscription

**Request Body:**
```json
{
  "email": "dadece8444@adrewire.com",
  "amount": 15999
}
```

**Amount Examples:**
- Monthly Plan (R159.99): `15999` (amount in cents)
- Annual Plan (R1800.00): `180000` (amount in cents)
- Test amount: `100` (R1.00 in cents)

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "access_code_123",
    "reference": "ref_1234567890"
  }
}
```

---

### GET `/payment/methods`
**Purpose:** Get user's saved payment methods

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pm_001",
      "type": "card",
      "brand": "visa",
      "last4": "4242",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "isDefault": true,
      "customerCode": "CUS_1234567890"
    },
    {
      "id": "pm_002",
      "type": "card",
      "brand": "mastercard",
      "last4": "5555",
      "expiryMonth": 8,
      "expiryYear": 2026,
      "isDefault": false,
      "customerCode": "CUS_1234567890"
    }
  ]
}
```

---

### POST `/payment/methods`
**Purpose:** Add new payment method

**Request Body:**
```json
{
  "cardNumber": "4242424242424242",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123",
  "cardholderName": "John Doe",
  "setAsDefault": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment method added successfully",
  "data": {
    "id": "pm_003",
    "type": "card",
    "brand": "visa",
    "last4": "4242",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "isDefault": true,
    "customerCode": "CUS_1234567890"
  }
}
```

---

### PUT `/payment/methods/:id`
**Purpose:** Update payment method

**Request Body:**
```json
{
  "expiryMonth": "01",
  "expiryYear": "2026",
  "setAsDefault": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment method updated successfully",
  "data": {
    "id": "pm_001",
    "type": "card",
    "brand": "visa",
    "last4": "4242",
    "expiryMonth": 1,
    "expiryYear": 2026,
    "isDefault": true,
    "customerCode": "CUS_1234567890"
  }
}
```

---

### DELETE `/payment/methods/:id`
**Purpose:** Delete payment method

**Response:**
```json
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```

---

## 🏢 Enterprise Inquiry

### POST `/enterprise/inquiry`
**Purpose:** Submit enterprise inquiry form

**Request Body:**
```json
{
  "companyName": "Acme Corporation",
  "contactPersonName": "John Smith",
  "email": "john@acme.com",
  "phone": "+1234567890",
  "companySize": "large",
  "industry": "Technology",
  "estimatedUsers": 500,
  "specificRequirements": "We need custom branding and SSO integration",
  "preferredContactTime": "business_hours",
  "currentProvider": "Competitor X",
  "budget": "10000-50000",
  "timeline": "3_months",
  "features": ["sso", "custom_branding", "analytics", "api_access"]
}
```

**Field Validations:**
- `companySize`: "small" | "medium" | "large" | "enterprise"
- `preferredContactTime`: "morning" | "afternoon" | "evening" | "business_hours" | "anytime"
- `budget`: "under-5000" | "5000-10000" | "10000-50000" | "50000-100000" | "100000+"
- `timeline`: "immediate" | "1_month" | "3_months" | "6_months" | "1_year+"

**Response:**
```json
{
  "success": true,
  "message": "Enterprise inquiry submitted successfully",
  "data": {
    "inquiryId": "inquiry_001",
    "referenceNumber": "ENT-2024-001",
    "estimatedResponseTime": "24 hours",
    "salesContactEmail": "enterprise@xscard.com"
  }
}
```

---

### POST `/enterprise/demo`
**Purpose:** Request enterprise demo

**Request Body:**
```json
{
  "companyName": "Acme Corporation",
  "contactPersonName": "John Smith",
  "email": "john@acme.com",
  "phone": "+1234567890",
  "preferredDemoDate": "2024-01-20T14:00:00Z",
  "alternativeDates": [
    "2024-01-21T14:00:00Z",
    "2024-01-22T10:00:00Z"
  ],
  "specificInterests": ["user_management", "analytics", "integrations"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Demo request submitted successfully",
  "data": {
    "demoId": "demo_001",
    "scheduledDate": "2024-01-20T14:00:00Z",
    "meetingLink": "https://zoom.us/j/123456789",
    "salesRepName": "Sarah Johnson",
    "salesRepEmail": "sarah.johnson@xscard.com"
  }
}
```

---

### POST `/enterprise/contact-sales`
**Purpose:** Contact sales team directly

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@acme.com",
  "phone": "+1234567890",
  "companyName": "Acme Corporation",
  "message": "We're interested in your enterprise solution for 500+ users",
  "urgency": "high"
}
```

**Urgency levels:**
- `low` - General inquiry
- `medium` - Interested prospect
- `high` - Ready to purchase
- `urgent` - Immediate need

**Response:**
```json
{
  "success": true,
  "message": "Sales contact request submitted successfully",
  "data": {
    "ticketId": "ticket_001",
    "estimatedResponseTime": "2 hours",
    "salesTeamEmail": "sales@xscard.com"
  }
}
```

---

## 🏢 Enterprise Account Management

### GET `/enterprise/invoices`
**Purpose:** Get enterprise invoices (for existing enterprise customers)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv_001",
      "invoiceNumber": "XS-2024-001",
      "date": "2024-01-01T00:00:00Z",
      "dueDate": "2024-01-31T00:00:00Z",
      "amount": 50000,
      "status": "paid",
      "description": "Enterprise Plan - January 2024",
      "downloadUrl": "/invoices/XS-2024-001.pdf"
    },
    {
      "id": "inv_002",
      "invoiceNumber": "XS-2024-002",
      "date": "2024-02-01T00:00:00Z",
      "dueDate": "2024-02-29T00:00:00Z",
      "amount": 50000,
      "status": "pending",
      "description": "Enterprise Plan - February 2024",
      "downloadUrl": "/invoices/XS-2024-002.pdf"
    }
  ]
}
```

**Invoice status values:**
- `paid` - Invoice paid
- `pending` - Awaiting payment
- `overdue` - Payment overdue
- `cancelled` - Invoice cancelled

---

### GET `/enterprise/invoices/:id/download`
**Purpose:** Download specific enterprise invoice

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://your-storage.com/invoices/XS-2024-001.pdf",
    "filename": "XS-2024-001.pdf",
    "contentType": "application/pdf"
  }
}
```

---

### GET `/enterprise/account-manager`
**Purpose:** Get enterprise account manager details

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Sarah Johnson",
    "email": "sarah.johnson@xscard.com",
    "phone": "+1-555-0123",
    "timezone": "PST",
    "availableHours": "9 AM - 6 PM PST",
    "emergencyContact": "+1-555-0199",
    "profileImage": "https://your-storage.com/profiles/sarah.jpg"
  }
}
```

---

## ❌ Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "SUBSCRIPTION_NOT_FOUND",
    "message": "No active subscription found for this user",
    "details": "The user does not have any subscription records"
  }
}
```

### Common Error Codes

**Authentication Errors:**
- `UNAUTHORIZED` - Invalid or missing token
- `TOKEN_EXPIRED` - Token has expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

**Subscription Errors:**
- `SUBSCRIPTION_NOT_FOUND` - No subscription found
- `SUBSCRIPTION_ALREADY_ACTIVE` - User already has active subscription
- `SUBSCRIPTION_CANCELLED` - Cannot modify cancelled subscription
- `INVALID_PLAN_ID` - Plan ID doesn't exist

**Payment Errors:**
- `PAYMENT_FAILED` - Payment processing failed
- `PAYMENT_METHOD_INVALID` - Invalid payment method
- `INSUFFICIENT_FUNDS` - Payment declined
- `PAYMENT_METHOD_NOT_FOUND` - Payment method ID doesn't exist

**Enterprise Errors:**
- `ENTERPRISE_INQUIRY_FAILED` - Failed to submit inquiry
- `INVOICE_NOT_FOUND` - Invoice ID doesn't exist
- `DOWNLOAD_FAILED` - Failed to generate download link

**Validation Errors:**
- `INVALID_EMAIL` - Email format invalid
- `REQUIRED_FIELD_MISSING` - Required field not provided
- `INVALID_PHONE_NUMBER` - Phone number format invalid
- `INVALID_DATE_FORMAT` - Date format incorrect

---

## 🧪 Testing Guide

### Testing the Frontend Integration

1. **Set Mock Data Off:**
   ```typescript
   // In src/utils/billingApi.ts
   const USE_MOCK_DATA = false; // Change to false when testing real backend
   ```

2. **Test User Scenarios:**
   - Free User: No subscription, can upgrade
   - Premium User: Active subscription, can cancel
   - Enterprise User: Has invoices and account manager

3. **Test Endpoints with cURL:**

   **Get Subscription Status:**
   ```bash
   curl -X GET "http://localhost:8383/subscription/status" \
     -H "Authorization: Bearer your_token_here" \
     -H "Content-Type: application/json"
   ```

   **Cancel Subscription:**
   ```bash
   curl -X POST "http://localhost:8383/subscription/cancel" \
     -H "Authorization: Bearer your_token_here" \
     -H "Content-Type: application/json" \
     -d '{
       "reason": "Too expensive",
       "feedback": "Testing cancellation",
       "immediateCancel": false
     }'
   ```   **Submit Enterprise Inquiry:**
   ```bash
   curl -X POST "http://localhost:8383/enterprise/inquiry" \
     -H "Authorization: Bearer your_token_here" \
     -H "Content-Type: application/json" \
     -d '{
       "companyName": "Test Company",
       "contactPersonName": "John Doe",
       "email": "john@test.com",
       "phone": "+1234567890",
       "companySize": "medium",
       "industry": "Technology",
       "estimatedUsers": 100,
       "specificRequirements": "Testing API",
       "preferredContactTime": "business_hours"
     }'
   ```

   **Initialize Payment:**
   ```bash
   curl -X POST "http://localhost:8383/payment/initialize" \
     -H "Authorization: Bearer your_token_here" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "dadece8444@adrewire.com",
       "amount": 15999
     }'
   ```

### Frontend Testing Steps

1. **Navigate to Settings page in your app**
2. **Test each user scenario:**
   - Free user: Should see upgrade options
   - Premium user: Should see subscription details and cancellation
   - Enterprise user: Should see account manager and invoices

3. **Test Modal Interactions:**
   - Payment method modal
   - Subscription cancellation modal
   - Enterprise inquiry modal

### Database Schema Suggestions

**subscriptions table:**
```sql
CREATE TABLE subscriptions (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  subscription_status ENUM('none', 'trial', 'active', 'cancelled', 'past_due'),
  subscription_plan VARCHAR,
  subscription_reference VARCHAR,
  subscription_start TIMESTAMP,
  subscription_end TIMESTAMP,
  trial_start_date TIMESTAMP,
  trial_end_date TIMESTAMP,
  customer_code VARCHAR,
  subscription_code VARCHAR,
  is_active BOOLEAN DEFAULT FALSE,
  plan ENUM('free', 'premium', 'enterprise'),
  amount INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**billing_logs table:**
```sql
CREATE TABLE billing_logs (
  id VARCHAR PRIMARY KEY,
  action VARCHAR NOT NULL,
  resource VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  resource_id VARCHAR,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details JSON
);
```

**payment_methods table:**
```sql
CREATE TABLE payment_methods (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  type ENUM('card') DEFAULT 'card',
  brand VARCHAR,
  last4 VARCHAR(4),
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  customer_code VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**enterprise_inquiries table:**
```sql
CREATE TABLE enterprise_inquiries (
  id VARCHAR PRIMARY KEY,
  company_name VARCHAR NOT NULL,
  contact_person_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  company_size ENUM('small', 'medium', 'large', 'enterprise'),
  industry VARCHAR,
  estimated_users INTEGER,
  specific_requirements TEXT,
  preferred_contact_time VARCHAR,
  current_provider VARCHAR,
  budget VARCHAR,
  timeline VARCHAR,
  features JSON,
  reference_number VARCHAR,
  status ENUM('new', 'contacted', 'in_progress', 'closed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Ready for Backend Implementation

The frontend is 100% ready and will seamlessly connect to your backend once these endpoints are implemented. Simply change `USE_MOCK_DATA = false` in `billingApi.ts` to switch from mock data to real API calls.

**Next Steps:**
1. Implement these endpoints in your backend
2. Set up payment integration with Paystack
3. Create the database tables
4. Set `USE_MOCK_DATA = false` in the frontend
5. Test the integration

Good luck with your backend implementation! 🎉
