// Mock billing data for development and testing
// This simulates responses from the actual backend

import { SubscriptionStatus, SubscriptionPlan, BillingLog, PaymentMethod, Invoice } from '../types/billing';

export const MOCK_SUBSCRIPTION_STATUS: Record<string, SubscriptionStatus> = {
  free: {
    subscriptionStatus: 'none',
    subscriptionPlan: null,
    isActive: false,
    plan: 'free'
  },
  premium: {
    subscriptionStatus: 'active',
    subscriptionPlan: 'premium_monthly',
    subscriptionReference: 'sub_1234567890',
    subscriptionStart: '2025-01-01T00:00:00Z',
    subscriptionEnd: '2025-07-01T00:00:00Z',
    customerCode: 'CUS_abcd1234',
    subscriptionCode: 'SUB_efgh5678',
    isActive: true,
    plan: 'premium',
    amount: 159.99
  },
  premium_trial: {
    subscriptionStatus: 'trial',
    subscriptionPlan: 'premium_monthly',
    subscriptionStart: '2025-06-01T00:00:00Z',
    subscriptionEnd: '2025-07-01T00:00:00Z',
    trialStartDate: '2025-06-01T00:00:00Z',
    trialEndDate: '2025-06-15T00:00:00Z',
    isActive: true,
    plan: 'premium',
    amount: 159.99
  },
  enterprise: {
    subscriptionStatus: 'active',
    subscriptionPlan: 'enterprise_custom',
    isActive: true,
    plan: 'enterprise'
  }
};

export const MOCK_AVAILABLE_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    amount: 0,
    interval: 'monthly',
    description: 'Perfect for individuals and small teams getting started',
    trialDays: 0,
    features: [
      '1 basic digital business card',
      'Standard QR code sharing',
      'Email support within 48 hours',
      'Basic card customization',
      'Up to 20 contacts'
    ]
  },
  {
    id: 'premium_monthly',
    name: 'Premium Plan',
    amount: 159.99,
    interval: 'monthly',
    description: 'Advanced features for growing businesses',
    trialDays: 14,
    planCode: 'PLN_premium_monthly',
    features: [
      'Unlimited digital business cards',
      'Advanced QR code features',
      'Priority email support',
      'Custom branding and themes',
      'Unlimited contacts',
      'Analytics and insights',
      'Team collaboration tools',
      'API access'
    ]
  },
  {
    id: 'premium_annual',
    name: 'Premium Plan (Annual)',
    amount: 1599.99,
    interval: 'annually',
    description: 'Save 17% with annual billing',
    trialDays: 14,
    planCode: 'PLN_premium_annual',
    features: [
      'All Premium features',
      '2 months free (17% savings)',
      'Priority support',
      'Advanced reporting'
    ]
  }
];

export const MOCK_BILLING_LOGS: BillingLog[] = [
  {
    id: 'log_001',
    action: 'subscription_created',
    resource: 'subscription',
    userId: 'user_123',
    resourceId: 'sub_1234567890',
    timestamp: '2025-06-01T10:30:00Z',
    details: {
      type: 'subscription',
      plan: 'premium_monthly',
      amount: 159.99,
      interval: 'monthly'
    }
  },
  {
    id: 'log_002',
    action: 'payment_successful',
    resource: 'payment',
    userId: 'user_123',
    resourceId: 'pay_abcd1234',
    timestamp: '2025-06-01T10:31:00Z',
    details: {
      type: 'payment',
      amount: 159.99,
      plan: 'premium_monthly'
    }
  },
  {
    id: 'log_003',
    action: 'trial_started',
    resource: 'subscription',
    userId: 'user_123',
    resourceId: 'sub_1234567890',
    timestamp: '2025-06-01T10:30:00Z',
    details: {
      type: 'trial',
      plan: 'premium_monthly'
    }
  }
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm_001',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
    customerCode: 'CUS_abcd1234'
  }
];

export const MOCK_ENTERPRISE_INVOICES: Invoice[] = [
  {
    id: 'inv_001',
    waveAppsInvoiceId: 'WA_INV_001',
    number: 'INV-2025-001',
    date: '2025-01-01',
    dueDate: '2025-01-31',
    amount: 12000.00,
    currency: 'ZAR',
    status: 'paid',
    downloadUrl: '/api/invoices/inv_001/download',
    lineItems: [
      {
        description: 'XSCard Enterprise License - January 2025',
        quantity: 1,
        rate: 12000.00,
        amount: 12000.00
      }
    ]
  },
  {
    id: 'inv_002',
    waveAppsInvoiceId: 'WA_INV_002',
    number: 'INV-2025-002',
    date: '2025-02-01',
    dueDate: '2025-02-28',
    amount: 12000.00,
    currency: 'ZAR',
    status: 'paid',
    downloadUrl: '/api/invoices/inv_002/download',
    lineItems: [
      {
        description: 'XSCard Enterprise License - February 2025',
        quantity: 1,
        rate: 12000.00,
        amount: 12000.00
      }
    ]
  },
  {
    id: 'inv_003',
    waveAppsInvoiceId: 'WA_INV_003',
    number: 'INV-2025-003',
    date: '2025-03-01',
    dueDate: '2025-03-31',
    amount: 12000.00,
    currency: 'ZAR',
    status: 'pending',
    downloadUrl: '/api/invoices/inv_003/download',
    lineItems: [
      {
        description: 'XSCard Enterprise License - March 2025',
        quantity: 1,
        rate: 12000.00,
        amount: 12000.00
      }
    ]
  }
];

// Simulate different user scenarios for testing
export const USER_SCENARIOS = {
  FREE_USER: 'free',
  PREMIUM_USER: 'premium',
  PREMIUM_TRIAL: 'premium_trial',
  ENTERPRISE_USER: 'enterprise'
};

// Function to get mock data based on scenario
export const getMockSubscriptionData = (scenario: string = USER_SCENARIOS.FREE_USER): SubscriptionStatus => {
  return MOCK_SUBSCRIPTION_STATUS[scenario] || MOCK_SUBSCRIPTION_STATUS.free;
};

// Simulate API delays for realistic testing
export const mockApiDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));
