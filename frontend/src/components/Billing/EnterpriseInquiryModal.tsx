import React, { useState } from 'react';
import { Modal } from '../UI/modal';
import { Button } from '../UI/button';
import { Input } from '../UI/input';
import { Label } from '../UI/label';
import { authenticatedFetch, ENDPOINTS } from '../../utils/api';

interface EnterpriseInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inquiryType?: 'pricing' | 'demo' | 'consultation' | 'upgrade';
}

interface EnterpriseFormData {
  companyName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  companySize: string;
  industry: string;
  estimatedUsers: string;
  specificRequirements: string;
  currentSolution: string;
  budget: string;
  timeline: string;
  inquiryType: string;
  preferredContactTime: string;
}

const COMPANY_SIZES = [
  { value: 'small', label: '1-50 employees' },
  { value: 'medium', label: '51-200 employees' },
  { value: 'large', label: '201-1000 employees' },
  { value: 'enterprise', label: '1000+ employees' }
];

const INDUSTRIES = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Manufacturing',
  'Retail & E-commerce',
  'Consulting',
  'Real Estate',
  'Education',
  'Government',
  'Non-profit',
  'Other'
];

const BUDGET_RANGES = [
  { value: 'under_5k', label: 'Under R5,000/month' },
  { value: '5k_15k', label: 'R5,000 - R15,000/month' },
  { value: '15k_50k', label: 'R15,000 - R50,000/month' },
  { value: 'over_50k', label: 'Over R50,000/month' },
  { value: 'custom', label: 'Custom pricing needed' }
];

const TIMELINES = [
  { value: 'immediate', label: 'Immediate (within 2 weeks)' },
  { value: 'month', label: 'Within 1 month' },
  { value: 'quarter', label: 'Within 3 months' },
  { value: 'flexible', label: 'Flexible timeline' }
];

export const EnterpriseInquiryModal: React.FC<EnterpriseInquiryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  inquiryType = 'pricing'
}) => {
  const [formData, setFormData] = useState<EnterpriseFormData>({
    companyName: '',
    contactPersonName: '',
    email: '',
    phone: '',
    companySize: '',
    industry: '',
    estimatedUsers: '',
    specificRequirements: '',
    currentSolution: '',
    budget: '',
    timeline: '',
    inquiryType: inquiryType,
    preferredContactTime: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'success'>('form');

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }

    if (!formData.contactPersonName.trim()) {
      errors.contactPersonName = 'Contact person name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!formData.companySize) {
      errors.companySize = 'Please select company size';
    }

    if (!formData.industry) {
      errors.industry = 'Please select industry';
    }

    if (!formData.estimatedUsers.trim()) {
      errors.estimatedUsers = 'Please estimate number of users';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        estimatedUsers: parseInt(formData.estimatedUsers) || 0,
        submittedAt: new Date().toISOString()
      };

      const response = await authenticatedFetch(ENDPOINTS.ENTERPRISE_INQUIRY_SUBMIT, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit enterprise inquiry');
      }

      setStep('success');
      
    } catch (err) {
      console.error('Error submitting enterprise inquiry:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit enterprise inquiry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalClose = () => {
    onSuccess();
    onClose();
    // Reset form
    setFormData({
      companyName: '',
      contactPersonName: '',
      email: '',
      phone: '',
      companySize: '',
      industry: '',
      estimatedUsers: '',
      specificRequirements: '',
      currentSolution: '',
      budget: '',
      timeline: '',
      inquiryType: inquiryType,
      preferredContactTime: ''
    });
    setStep('form');
    setError(null);
    setValidationErrors({});
  };

  const handleClose = () => {
    if (!isLoading && step !== 'success') {
      onClose();
      setStep('form');
      setError(null);
      setValidationErrors({});
    }
  };

  const getModalTitle = () => {
    switch (inquiryType) {
      case 'demo': return 'Request Enterprise Demo';
      case 'consultation': return 'Enterprise Consultation';
      case 'upgrade': return 'Upgrade to Enterprise';
      default: return 'Enterprise Inquiry';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
      size="lg"
      showCloseButton={step !== 'success'}
    >
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="modal-form-error">
              ⚠️ {error}
            </div>
          )}

          {/* Company Information */}
          <div className="form-section">
            <h3 className="section-title">Company Information</h3>
            
            <div className="modal-form-group">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Your Company Ltd"
                disabled={isLoading}
              />
              {validationErrors.companyName && (
                <div className="modal-form-error">{validationErrors.companyName}</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="modal-form-group" style={{ flex: 1 }}>
                <Label htmlFor="companySize">Company Size *</Label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="">Select company size</option>
                  {COMPANY_SIZES.map(size => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
                {validationErrors.companySize && (
                  <div className="modal-form-error">{validationErrors.companySize}</div>
                )}
              </div>

              <div className="modal-form-group" style={{ flex: 1 }}>
                <Label htmlFor="industry">Industry *</Label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {validationErrors.industry && (
                  <div className="modal-form-error">{validationErrors.industry}</div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3 className="section-title">Contact Information</h3>
            
            <div className="modal-form-group">
              <Label htmlFor="contactPersonName">Contact Person *</Label>
              <Input
                id="contactPersonName"
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleInputChange}
                placeholder="John Doe"
                disabled={isLoading}
              />
              {validationErrors.contactPersonName && (
                <div className="modal-form-error">{validationErrors.contactPersonName}</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="modal-form-group" style={{ flex: 1 }}>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@company.com"
                  disabled={isLoading}
                />
                {validationErrors.email && (
                  <div className="modal-form-error">{validationErrors.email}</div>
                )}
              </div>

              <div className="modal-form-group" style={{ flex: 1 }}>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+27 11 123 4567"
                  disabled={isLoading}
                />
                {validationErrors.phone && (
                  <div className="modal-form-error">{validationErrors.phone}</div>
                )}
              </div>
            </div>

            <div className="modal-form-group">
              <Label htmlFor="preferredContactTime">Preferred Contact Time</Label>
              <Input
                id="preferredContactTime"
                name="preferredContactTime"
                value={formData.preferredContactTime}
                onChange={handleInputChange}
                placeholder="Monday-Friday, 9AM-5PM"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="form-section">
            <h3 className="section-title">Requirements & Budget</h3>
            
            <div className="modal-form-group">
              <Label htmlFor="estimatedUsers">Estimated Number of Users *</Label>
              <Input
                id="estimatedUsers"
                name="estimatedUsers"
                type="number"
                value={formData.estimatedUsers}
                onChange={handleInputChange}
                placeholder="50"
                min="1"
                disabled={isLoading}
              />
              {validationErrors.estimatedUsers && (
                <div className="modal-form-error">{validationErrors.estimatedUsers}</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="modal-form-group" style={{ flex: 1 }}>
                <Label htmlFor="budget">Budget Range</Label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="">Select budget range</option>
                  {BUDGET_RANGES.map(budget => (
                    <option key={budget.value} value={budget.value}>
                      {budget.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group" style={{ flex: 1 }}>
                <Label htmlFor="timeline">Implementation Timeline</Label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="">Select timeline</option>
                  {TIMELINES.map(timeline => (
                    <option key={timeline.value} value={timeline.value}>
                      {timeline.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-form-group">
              <Label htmlFor="currentSolution">Current Solution (if any)</Label>
              <Input
                id="currentSolution"
                name="currentSolution"
                value={formData.currentSolution}
                onChange={handleInputChange}
                placeholder="e.g., Paper business cards, Competitor X, Custom solution"
                disabled={isLoading}
              />
            </div>

            <div className="modal-form-group">
              <Label htmlFor="specificRequirements">Specific Requirements</Label>
              <textarea
                id="specificRequirements"
                name="specificRequirements"
                value={formData.specificRequirements}
                onChange={handleInputChange}
                placeholder="Please describe any specific features, integrations, or requirements you need..."
                rows={4}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="modal-form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? '⏳ Submitting...' : 'Submit Inquiry'}
            </Button>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div className="inquiry-success">
          <div className="success-icon">✅</div>
          <h3>Inquiry Submitted Successfully!</h3>
          <p>Thank you for your interest in XSCard Enterprise. We've received your inquiry and will get back to you soon.</p>

          <div className="next-steps">
            <h4>What happens next:</h4>
            <ul>
              <li>✅ You'll receive a confirmation email within 5 minutes</li>
              <li>✅ Our enterprise team will review your requirements</li>
              <li>✅ We'll contact you within 1 business day to schedule a consultation</li>
              <li>✅ We'll prepare a custom proposal based on your needs</li>
            </ul>
          </div>

          <div className="contact-info">
            <p><strong>Need immediate assistance?</strong></p>
            <p>📧 Email: enterprise@xscard.com</p>
            <p>📞 Phone: +27 11 123 4567</p>
          </div>

          <div className="modal-form-actions">
            <Button
              type="button"
              onClick={handleFinalClose}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
