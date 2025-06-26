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
    subscriptionPlan: 'MONTHLY_PLAN',
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
    subscriptionPlan: 'MONTHLY_PLAN',
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
    id: 'MONTHLY_PLAN',
    name: 'Monthly Subscription',
    amount: 159.99,
    interval: 'monthly',
    description: 'XS Card Monthly Subscription',
    trialDays: 0,
    planCode: 'PLN_25xliarx7epm9ct',
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
    id: 'ANNUAL_PLAN',
    name: 'Annual Subscription',
    amount: 1800.00,
    interval: 'annually',
    description: 'XS Card Annual Subscription',
    trialDays: 0,
    planCode: 'PLN_kzb7lj21vrehzeq',
    features: [
      'All Premium features',
      'Save R120 compared to monthly (6.7% savings)',
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
      plan: 'MONTHLY_PLAN',
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
      plan: 'MONTHLY_PLAN'
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
      plan: 'MONTHLY_PLAN'
    }
  }
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'y5uYEnHbx2xAFU2IVY0x',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
    lastUsed: '2025-06-20T14:30:00Z',
    createdAt: '2025-01-15T09:00:00Z',
    cardholderName: 'John Doe',
    billingAddress: {
      street: '123 Main Street',
      city: 'Cape Town',
      state: 'Western Cape',
      postalCode: '8001',
      country: 'South Africa'
    }
  },  {
    id: 'pm_002',
    type: 'card',
    brand: 'mastercard',
    last4: '8888',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
    lastUsed: '2025-06-15T10:15:00Z',
    createdAt: '2025-03-10T11:30:00Z',
    cardholderName: 'Jane Smith',
    billingAddress: {
      street: '', // Empty to test no-prefilling
      city: '', // Empty to test no-prefilling
      state: '', // Empty to test no-prefilling
      postalCode: '', // Empty to test no-prefilling
      country: 'South Africa'
    }
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
