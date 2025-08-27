import { 
  authenticatedFetch, 
  ENDPOINTS, 
  BillingAPIResponse,
  SubscriptionStatus,
  SubscriptionPlan,
  BillingLog 
} from '../utils/api';
import { PaymentMethod, Invoice } from '../types/billing';

// Add missing types that were being imported

export interface EnterpriseInquiry {
  companyName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  estimatedUsers: number;
  specificRequirements: string;
  currentSolution: string;
  budget: string;
  timeline: string;
  inquiryType: 'pricing' | 'demo' | 'consultation' | 'trial';
  preferredContactTime: string;
  submittedAt: string;
}

// Environment detection helper
const isDevelopment = () => {
  return !window.location.hostname.includes('production') && 
         (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'));
};

// Error handling for billing operations
const handleBillingError = (response: Response, operation: string) => {
  if (response.status === 401) {
    throw new Error('Authentication required. Please log in again.');
  }
  if (response.status === 403) {
    throw new Error('Insufficient permissions for this operation.');
  }
  if (response.status === 404) {
    throw new Error(`${operation} not found.`);
  }
  if (response.status >= 500) {
    throw new Error(`Server error during ${operation}. Please try again later.`);
  }
  throw new Error(`${operation} failed. Please check your connection and try again.`);
};

// Get subscription status
export const fetchSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    console.log('🔄 Fetching subscription status...');
    const response = await authenticatedFetch(ENDPOINTS.BILLING_SUBSCRIPTION_STATUS);
    
    if (!response.ok) {
      handleBillingError(response, 'fetching subscription status');
    }
    
    const data: BillingAPIResponse<SubscriptionStatus> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Invalid subscription status response');
    }
    
    console.log('✅ Subscription status fetched successfully');
    return data.data || {
      subscriptionStatus: 'none',
      subscriptionPlan: null,
      isActive: false,
      plan: 'free',
      emailToken: 'fallback_email_token'
    };
  } catch (error: any) {
    console.error('❌ Subscription status fetch failed:', error.message);
    
    // Fallback in development
    if (isDevelopment()) {
      console.warn('🔄 Using fallback data in development');
      return {
        subscriptionStatus: 'active',
        subscriptionPlan: 'MONTHLY_PLAN',
        subscriptionCode: 'SUB_dev_fallback_12345', // Add missing subscription code
        customerCode: 'CUS_dev_fallback_67890', // Add customer code for completeness
        subscriptionStart: '2025-01-01T00:00:00Z',
        subscriptionEnd: '2025-07-01T00:00:00Z', // Add subscription end date
        isActive: true,
        plan: 'premium',
        amount: 159.99,
        emailToken: 'dev_fallback_email_token'
      };
    }
    
    throw error;
  }
};

// Get available plans
export const fetchAvailablePlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    console.log('🔄 Fetching available plans...');
    const response = await authenticatedFetch(ENDPOINTS.BILLING_SUBSCRIPTION_PLANS);
    
    if (!response.ok) {
      handleBillingError(response, 'fetching subscription plans');
    }
    
    const data: BillingAPIResponse<SubscriptionPlan[]> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to load subscription plans');
    }
    
    console.log('✅ Subscription plans fetched successfully');
    return data.data || [];
  } catch (error: any) {
    console.error('❌ Plans fetch failed:', error.message);
    
    // Fallback in development
    if (isDevelopment()) {
      console.warn('🔄 Using fallback plans in development');
      return [
        {
          id: 'MONTHLY_PLAN',
          name: 'Monthly Subscription',
          amount: 159.99,
          interval: 'monthly',
          description: 'XS Card Monthly Subscription',
          trialDays: 0,
          features: ['Unlimited digital business cards', 'Advanced QR features', 'Priority support']
        },
        {
          id: 'ANNUAL_PLAN',
          name: 'Annual Subscription',
          amount: 1800.00,
          interval: 'annually',
          description: 'XS Card Annual Subscription',
          trialDays: 0,
          features: ['All Premium features', 'Save R120 compared to monthly', 'Priority support']
        }
      ];
    }
    
    throw error;
  }
};

// Get billing logs
export const fetchBillingLogs = async (): Promise<BillingLog[]> => {
  try {
    console.log('🔄 Fetching billing logs...');
    const response = await authenticatedFetch(ENDPOINTS.BILLING_SUBSCRIPTION_LOGS);
    
    if (!response.ok) {
      handleBillingError(response, 'fetching billing logs');
    }
    
    const data: BillingAPIResponse<BillingLog[]> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to load billing logs');
    }
    
    console.log('✅ Billing logs fetched successfully');
    return data.data || [];
  } catch (error: any) {
    console.error('❌ Billing logs fetch failed:', error.message);
    
    // Fallback in development
    if (isDevelopment()) {
      console.warn('🔄 Using fallback logs in development');
      return [
        {
          id: 'log_001',
          action: 'subscription_created',
          resource: 'subscription',
          userId: 'user_123',
          resourceId: 'sub_1234567890',
          timestamp: new Date().toISOString(),
          details: {
            type: 'subscription',
            plan: 'MONTHLY_PLAN',
            amount: 159.99
          }
        }
      ];
    }
    
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionCode: string, reason?: string): Promise<boolean> => {
  try {
    console.log('🔄 Cancelling subscription:', subscriptionCode);
    
    // First, fetch the current subscription status to get the email_token
    console.log('🔄 Fetching subscription details for email token...');
    const subscriptionStatus = await fetchSubscriptionStatus();
    
    console.log('📄 Subscription status received:', JSON.stringify(subscriptionStatus, null, 2));
    
    if (!subscriptionStatus.emailToken) {
      console.error('❌ Email token missing from subscription status:', subscriptionStatus);
      throw new Error('Email token not found in subscription details. Cannot cancel subscription.');
    }
    
    const payload = {
      code: subscriptionCode, // Backend expects 'code' field
      token: subscriptionStatus.emailToken, // Backend expects 'token' field from subscription
      reason: reason || 'User requested cancellation',
      feedback: reason,
      effectiveDate: 'end_of_period'
    };
    
    console.log('📤 Sending cancel payload:', JSON.stringify(payload, null, 2));
    
    // The backend expects the subscription code in the 'code' field and token in 'token' field
    const response = await authenticatedFetch(ENDPOINTS.CANCEL_SUBSCRIPTION, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      handleBillingError(response, 'cancelling subscription');
    }
    
    const data: BillingAPIResponse<any> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to cancel subscription');
    }
    
    console.log('✅ Subscription cancelled successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Subscription cancellation failed:', error.message);
    throw error;
  }
};

// Initialize payment for regular subscriptions
export const initializePayment = async (planId: string): Promise<any> => {
  try {
    const getUserEmail = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          return user.email || 'user@example.com';
        }
      } catch (error) {
        console.error('Error getting user email:', error);
      }
      return 'dadece8444@adrewire.com';
    };

    const getAmountForPlan = (planId: string): number => {
      switch (planId) {
        case 'MONTHLY_PLAN': return 15999; // R159.99 in cents
        case 'ANNUAL_PLAN': return 180000; // R1800.00 in cents
        default: return 100;
      }
    };

    const payload = {
      email: getUserEmail(),
      amount: getAmountForPlan(planId),
      planId: planId
    };

    console.log('🚀 Initializing payment for plan:', planId);
    const response = await authenticatedFetch(ENDPOINTS.INITIALIZE_PAYMENT, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      handleBillingError(response, 'initializing payment');
    }
    
    const data = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to initialize payment');
    }
    
    console.log('✅ Payment initialization successful');
    return data.data || data;
  } catch (error: any) {
    console.error('❌ Payment initialization failed:', error.message);
    throw error;
  }
};

// Initialize trial payment (uses different endpoint)
export const initializeTrialPayment = async (planId: string): Promise<any> => {
  try {
    const getUserEmail = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          return user.email || 'user@example.com';
        }
      } catch (error) {
        console.error('Error getting user email:', error);
      }
      return 'dadece8444@adrewire.com';
    };

    const getAmountForPlan = (planId: string): number => {
      switch (planId) {
        case 'MONTHLY_PLAN': return 15999; // R159.99 in cents
        case 'ANNUAL_PLAN': return 180000; // R1800.00 in cents
        default: return 100;
      }
    };

    const payload = {
      email: getUserEmail(),
      amount: getAmountForPlan(planId),
      planId: planId
    };

    console.log('🚀 Initializing trial payment for plan:', planId);
    const response = await authenticatedFetch(ENDPOINTS.BILLING_TRIAL_INITIALIZE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      handleBillingError(response, 'initializing trial payment');
    }

    const data = await response.json();
    console.log('✅ Trial payment initialization successful:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Trial payment initialization failed:', error.message);
    throw error;
  }
};

// Submit demo request for enterprise
export const submitDemoRequest = async (inquiry: EnterpriseInquiry): Promise<boolean> => {
  try {
    console.log('🔄 Submitting demo request...');
    const response = await authenticatedFetch(ENDPOINTS.ENTERPRISE_DEMO_REQUEST, {
      method: 'POST',
      body: JSON.stringify(inquiry)
    });
    
    if (!response.ok) {
      handleBillingError(response, 'submitting demo request');
    }
    
    const data: BillingAPIResponse<any> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to submit demo request');
    }
    
    console.log('✅ Demo request submitted successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Demo request submission failed:', error.message);
    throw error;
  }
};

// Fetch payment methods
export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    console.log('🔄 Fetching payment methods...');
    const response = await authenticatedFetch(ENDPOINTS.BILLING_PAYMENT_METHODS);
    
    if (!response.ok) {
      handleBillingError(response, 'fetching payment methods');
    }
    
    const data: BillingAPIResponse<PaymentMethod[]> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to load payment methods');
    }
    
    console.log('✅ Payment methods fetched successfully');
    return data.data || [];
  } catch (error: any) {
    console.error('❌ Payment methods fetch failed:', error.message);
    
    // Fallback in development
    if (isDevelopment()) {
      console.warn('🔄 Using fallback payment methods in development');
      return [
        {
          id: 'pm_001',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          isDefault: true,
          expiryMonth: 12,
          expiryYear: 2025
        }
      ];
    }
    
    throw error;
  }
};

// Fetch enterprise invoices
export const fetchEnterpriseInvoices = async (): Promise<Invoice[]> => {
  try {
    console.log('🔄 Fetching invoices...');
    // Note: This endpoint might need to be added to the backend
    const response = await authenticatedFetch('/billing/invoices');
    
    if (!response.ok) {
      handleBillingError(response, 'fetching invoices');
    }
    
    const data: BillingAPIResponse<Invoice[]> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to load invoices');
    }
    
    console.log('✅ Invoices fetched successfully');
    return data.data || [];
  } catch (error: any) {
    console.error('❌ Invoices fetch failed:', error.message);
    
    // Fallback in development
    if (isDevelopment()) {
      console.warn('🔄 Using fallback invoices in development');      return [
        {
          id: 'inv_001',
          waveAppsInvoiceId: 'WA_INV_001',
          number: 'INV-2025-001',
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          amount: 159.99,
          currency: 'ZAR',
          status: 'paid',
          downloadUrl: '#',          lineItems: [
            {
              description: 'XS Card Monthly Subscription',
              quantity: 1,
              rate: 159.99,
              amount: 159.99
            }
          ]
        }
      ];
    }
    
    throw error;
  }
};

// Fetch premium user invoices
export const fetchPremiumInvoices = async (): Promise<Invoice[]> => {
  try {
    console.log('🔄 Fetching premium invoices...');
    const response = await authenticatedFetch(ENDPOINTS.BILLING_INVOICES);
    
    if (!response.ok) {
      handleBillingError(response, 'fetching premium invoices');
    }
    
    const data: BillingAPIResponse<Invoice[]> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to load premium invoices');
    }
    
    console.log('✅ Premium invoices fetched successfully');
    return data.data || [];
  } catch (error: any) {
    console.error('❌ Premium invoices fetch failed:', error.message);
    
    // Fallback in development
    if (isDevelopment()) {
      console.warn('🔄 Using fallback premium invoices in development');
      return [
        {
          id: 'inv_premium_001',
          waveAppsInvoiceId: 'WA_PREM_001',
          number: 'XSC-2025-001',
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 159.99, // Total including VAT from backend
          currency: 'ZAR',
          status: 'paid',
          customerName: 'Acme Business Solutions (Pty) Ltd',
          customerEmail: 'billing@acmebusiness.co.za',
          lineItems: [
            {
              description: 'XSCard Premium Subscription - Monthly Plan',
              quantity: 1,
              rate: 139.12, // Rate excluding VAT (159.99 ÷ 1.15)
              amount: 139.12
            }
          ],
          subtotal: 139.12, // Subtotal excluding VAT
          tax: 20.87, // VAT 15% (159.99 - 139.12)
          total: 159.99, // Final total including VAT from backend
          pdfUrl: '/invoices/premium/XSC-2025-001.pdf'
        },
        {
          id: 'inv_premium_002',
          waveAppsInvoiceId: 'WA_PREM_002',
          number: 'XSC-2025-002',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 159.99, // Total including VAT from backend
          currency: 'ZAR',
          status: 'paid',
          customerName: 'TechCorp Innovations',
          customerEmail: 'accounts@techcorp.com',
          lineItems: [
            {
              description: 'XSCard Premium Subscription - Monthly Plan',
              quantity: 1,
              rate: 139.12, // Rate excluding VAT (159.99 ÷ 1.15)
              amount: 139.12
            }
          ],
          subtotal: 139.12, // Subtotal excluding VAT
          tax: 20.87, // VAT 15% (159.99 - 139.12)
          total: 159.99, // Final total including VAT from backend
          pdfUrl: '/invoices/premium/XSC-2025-002.pdf'
        },
        {
          id: 'inv_premium_003',
          waveAppsInvoiceId: 'WA_PREM_003',
          number: 'XSC-2025-003',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 899.99,
          currency: 'ZAR',
          status: 'pending',
          customerName: 'Metro Marketing Agency',
          customerEmail: 'finance@metromarketing.co.za',
          lineItems: [
            {
              description: 'XSCard Enterprise Setup - Annual',
              quantity: 1,
              rate: 782.59,
              amount: 782.59
            },
            {
              description: 'Professional Onboarding Service',
              quantity: 1,
              rate: 117.40,
              amount: 117.40
            }
          ],
          subtotal: 899.99,
          tax: 135.00,
          total: 1034.99,
          pdfUrl: '/invoices/premium/XSC-2025-003.pdf'
        }
      ];
    }
    
    throw error;
  }
};

// Export invoice as PDF
export const exportInvoicePDF = async (invoiceId: string): Promise<Blob> => {
  try {
    console.log('🔄 Exporting invoice as PDF:', invoiceId);
    const response = await authenticatedFetch(`${ENDPOINTS.BILLING_INVOICE_BY_ID.replace(':id', invoiceId)}/pdf`);
    
    if (!response.ok) {
      throw new Error('Failed to export invoice as PDF');
    }
    
    const blob = await response.blob();
    console.log('✅ Invoice PDF exported successfully');
    return blob;
  } catch (error: any) {
    console.error('❌ Invoice PDF export failed:', error.message);
    
    // Fallback: Create a proper PDF in development using jsPDF
    if (isDevelopment()) {
      console.warn('🔄 Creating proper PDF using jsPDF in development');
      
      try {
        // Import the PDF generator dynamically to avoid bundling issues
        const { PDFGenerator } = await import('../utils/pdfGenerator');
        
        // First, fetch the invoice data to populate the PDF
        const invoices = await fetchPremiumInvoices();
        const invoice = invoices.find(inv => inv.id === invoiceId) || invoices[0];
        
        if (!invoice) {
          throw new Error('Invoice not found for PDF generation');
        }
        
        // Generate a proper PDF using jsPDF
        const pdfBlob = PDFGenerator.generateFromInvoiceData(invoice); // Use direct jsPDF method for faster generation
        
        console.log('✅ Proper PDF generated successfully using jsPDF');
        console.log('📄 Invoice data:', {
          id: invoice.id,
          number: invoice.number,
          total: invoice.total || invoice.amount,
          lineItems: invoice.lineItems.length
        });
        
        return pdfBlob;
        
      } catch (pdfError: any) {
        console.error('❌ jsPDF generation failed, falling back to HTML:', pdfError.message);
        
        // Final fallback: HTML blob for preview (simplified version)
        const invoices = await fetchPremiumInvoices();
        const invoice = invoices.find(inv => inv.id === invoiceId) || invoices[0];
        
        if (!invoice) {
          throw new Error('Invoice not found for PDF generation');
        }
        
        // Create a simple HTML invoice preview
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.number}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #3b82f6; margin-bottom: 20px; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .customer-info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f9f9f9; }
        .total { text-align: right; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>XSCard Business Solutions</h1>
        <h2>INVOICE ${invoice.number}</h2>
    </div>
    <div class="invoice-info">
        <div>Date: ${new Date(invoice.date).toLocaleDateString()}</div>
        <div>Due: ${new Date(invoice.dueDate).toLocaleDateString()}</div>
        <div>Status: ${invoice.status}</div>
    </div>
    <div class="customer-info">
        <h3>Bill To:</h3>
        <p>${invoice.customerName}<br>${invoice.customerEmail}</p>
    </div>
    <table>
        <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
        ${invoice.lineItems.map(item => 
          `<tr><td>${item.description}</td><td>${item.quantity}</td><td>${invoice.currency} ${item.rate.toFixed(2)}</td><td>${invoice.currency} ${item.amount.toFixed(2)}</td></tr>`
        ).join('')}
    </table>
    <div class="total">
        <p>Subtotal: ${invoice.currency} ${(invoice.subtotal || 0).toFixed(2)}</p>
        <p>VAT: ${invoice.currency} ${(invoice.tax || 0).toFixed(2)}</p>
        <p><strong>Total: ${invoice.currency} ${(invoice.total || invoice.amount || 0).toFixed(2)}</strong></p>
    </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        
        console.warn('🔧 Final fallback: Simple HTML preview generated');
        console.warn('💡 To avoid "Failed to load PDF" errors, this will be saved as .html file');
        
        return blob;
      }
    }
    
    throw error;
  }
};
// Export invoice as CSV
export const exportInvoiceCSV = async (invoiceId: string): Promise<Blob> => {
  try {
    console.log('🔄 Exporting invoice as CSV:', invoiceId);
    const response = await authenticatedFetch(`${ENDPOINTS.BILLING_INVOICE_BY_ID.replace(':id', invoiceId)}/csv`);
    
    if (!response.ok) {
      throw new Error('Failed to export invoice as CSV');
    }
    
    const blob = await response.blob();
    console.log('✅ Invoice CSV exported successfully');
    return blob;
  } catch (error: any) {
    console.error('❌ Invoice CSV export failed:', error.message);
    
    // Fallback: Create a mock CSV blob in development
    if (isDevelopment()) {
      console.warn('🔄 Creating mock CSV in development');
      const mockCsvContent = `Invoice Number,Date,Amount,Status\n${invoiceId},${new Date().toISOString()},R159.99,Paid`;
      return new Blob([mockCsvContent], { type: 'text/csv' });
    }
    
    throw error;
  }
};

// Add payment method
export const addPaymentMethod = async (paymentData: {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
}): Promise<PaymentMethod> => {
  try {
    console.log('🔄 Adding payment method...');
    const response = await authenticatedFetch(ENDPOINTS.BILLING_PAYMENT_METHODS, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      handleBillingError(response, 'adding payment method');
    }
    
    const data: BillingAPIResponse<PaymentMethod> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to add payment method');
    }
    
    if (!data.data) {
      throw new Error('No payment method data received from server');
    }
    
    console.log('✅ Payment method added successfully');
    return data.data;
  } catch (error: any) {
    console.error('❌ Payment method addition failed:', error.message);
    
    // Provide specific error messages for known backend issues
    if (error.message.includes('404') || error.message.includes('Cannot POST')) {
      throw new Error('Payment method management is temporarily unavailable. Our team is working to resolve this issue. Please try again later or contact support.');
    }
    
    throw error;
  }
};

// Update payment method
export const updatePaymentMethod = async (
  paymentMethodId: string, 
  paymentData: {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    cardholderName: string;
  }
): Promise<PaymentMethod> => {
  try {
    console.log('🔄 Updating payment method:', paymentMethodId);
    
    // Use the correct backend endpoint with proper URL formatting
    const response = await authenticatedFetch(`/billing/payment-methods/${paymentMethodId}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      handleBillingError(response, 'updating payment method');
    }
    
    const data: BillingAPIResponse<PaymentMethod> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to update payment method');
    }
    
    if (!data.data) {
      throw new Error('No payment method data received from server');
    }
    
    console.log('✅ Payment method updated successfully');
    return data.data;
  } catch (error: any) {
    console.error('❌ Payment method update failed:', error.message);
    throw error;
  }
};

// Delete payment method
export const deletePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  try {
    console.log('🔄 Deleting payment method:', paymentMethodId);
    const response = await authenticatedFetch(`${ENDPOINTS.BILLING_PAYMENT_METHODS}/${paymentMethodId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      handleBillingError(response, 'deleting payment method');
    }
    
    const data: BillingAPIResponse<any> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to delete payment method');
    }
    
    console.log('✅ Payment method deleted successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Payment method deletion failed:', error.message);
    throw error;
  }
};

// Update subscription plan
export const updateSubscriptionPlan = async (planId: string): Promise<boolean> => {
  try {
    console.log('🔄 Updating subscription plan:', planId);
    const response = await authenticatedFetch(ENDPOINTS.BILLING_UPDATE_PLAN, {
      method: 'PUT',
      body: JSON.stringify({ planId })
    });
    
    if (!response.ok) {
      handleBillingError(response, 'updating subscription plan');
    }
    
    const data: BillingAPIResponse<any> = await response.json();
    
    if (data.status === false) {
      throw new Error(data.message || 'Failed to update subscription plan');
    }
    
    console.log('✅ Subscription plan updated successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Subscription plan update failed:', error.message);
    throw error;
  }
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
};

export const formatDate = (dateString: string | null | undefined): string => {
  // Handle null, undefined, or empty string cases
  if (!dateString) {
    return 'Date not available';
  }
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string provided to formatDate:', dateString);
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error, 'dateString:', dateString);
    return 'Date formatting error';
  }
};

// Mock user scenarios for development
let mockUserScenario: 'free' | 'premium' | 'enterprise' = 'free';

export const setMockUserScenario = (scenario: 'free' | 'premium' | 'enterprise'): void => {
  mockUserScenario = scenario;
  console.log('🎭 Mock user scenario set to:', scenario);
};

export const getCurrentUserScenario = (): 'free' | 'premium' | 'enterprise' => {
  return mockUserScenario;
};
