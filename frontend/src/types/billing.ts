// Billing Types for XSCard Application
// Based on fake backend patterns and enterprise requirements

// Subscription Status (based on fake backend patterns)
export interface SubscriptionStatus {
  subscriptionStatus: 'none' | 'trial' | 'active' | 'cancelled' | 'past_due';
  subscriptionPlan: string | null;
  subscriptionReference?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  customerCode?: string;
  subscriptionCode?: string;
  isActive: boolean;
  plan: 'free' | 'premium' | 'enterprise';
  amount?: number;
}

// Subscription Plans (from fake backend)
export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  interval: 'monthly' | 'annually';
  description: string;
  trialDays: number;
  planCode?: string; // Paystack plan code
  features?: string[]; // NEW: List of features for this plan
}

// Billing Activity Logs
export interface BillingLog {
  id: string;
  action: string;
  resource: string;
  userId: string;
  resourceId: string;
  timestamp: string;
  details: {
    type?: string;
    plan?: string;
    amount?: number;
    interval?: string;
    reason?: string;
  };
}

// Payment Methods (Paystack)
export interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  customerCode?: string;
}

// Enterprise Inquiry System
export interface EnterpriseInquiry {
  companyName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  estimatedUsers: number;
  specificRequirements: string;
  preferredContactTime: string;
  inquiryType: 'pricing' | 'demo' | 'consultation' | 'trial';
  currentSolution?: string;
  budget?: string;
  timeline?: string;
}

// Demo Request
export interface DemoRequest {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  attendeeCount: number;
  specificInterests: string[];
  currentChallenges: string;
}

// Account Manager (for existing enterprise customers)
export interface AccountManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  profileImage?: string;
}

// WaveApps Invoices (for existing enterprise customers)
export interface Invoice {
  id: string;
  waveAppsInvoiceId: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  downloadUrl?: string;
  customerName?: string;
  customerEmail?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  pdfUrl?: string;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// API Response types
export interface BillingAPIResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface EnterpriseInquiryResponse {
  status: boolean;
  message: string;
  data?: {
    inquiryId: string;
    expectedResponse: string;
  };
}
