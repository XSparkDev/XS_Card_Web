import React, { useState } from 'react';
import { Modal } from '../UI/modal';
import { Button } from '../UI/button';
import { Label } from '../UI/label';
import { authenticatedFetch, ENDPOINTS } from '../../utils/api';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscriptionData: {
    subscriptionCode: string;
    plan: string;
    amount: number;
    subscriptionEnd?: string;
  };
}

interface CancellationFormData {
  reason: string;
  feedback: string;
  effectiveDate: 'immediate' | 'end_of_period';
}

const CANCELLATION_REASONS = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_using_enough', label: 'Not using enough features' },
  { value: 'switching_provider', label: 'Switching to another provider' },
  { value: 'technical_issues', label: 'Technical issues' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'company_closure', label: 'Company closure/downsizing' },
  { value: 'temporary_pause', label: 'Temporary pause' },
  { value: 'other', label: 'Other reason' }
];

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subscriptionData
}) => {
  const [formData, setFormData] = useState<CancellationFormData>({
    reason: '',
    feedback: '',
    effectiveDate: 'end_of_period'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'confirm' | 'form' | 'final'>('confirm');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInitialConfirm = () => {
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.reason) {
      setError('Please select a reason for cancellation');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        subscriptionCode: subscriptionData.subscriptionCode,
        reason: formData.reason,
        feedback: formData.feedback,
        effectiveDate: formData.effectiveDate
      };

      const response = await authenticatedFetch(ENDPOINTS.BILLING_CANCEL_SUBSCRIPTION, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel subscription');
      }

      setStep('final');
      
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalClose = () => {
    onSuccess();
    onClose();
    // Reset form
    setFormData({
      reason: '',
      feedback: '',
      effectiveDate: 'end_of_period'
    });
    setStep('confirm');
    setError(null);
  };

  const handleClose = () => {
    if (!isLoading && step !== 'final') {
      onClose();
      setStep('confirm');
      setFormData({
        reason: '',
        feedback: '',
        effectiveDate: 'end_of_period'
      });
      setError(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancel Subscription"
      size="md"
      showCloseButton={step !== 'final'}
    >
      {step === 'confirm' && (
        <div className="cancellation-confirm">
          <div className="warning-section">
            <div className="warning-icon">⚠️</div>
            <h3>Are you sure you want to cancel?</h3>
            <p>You're about to cancel your Premium subscription. Here's what will happen:</p>
          </div>

          <div className="impact-list">
            <div className="impact-item">
              <span className="impact-icon">📅</span>
              <div>
                <strong>Current billing period:</strong>
                <p>Ends on {formatDate(subscriptionData.subscriptionEnd)}</p>
              </div>
            </div>
            <div className="impact-item">
              <span className="impact-icon">💰</span>
              <div>
                <strong>No refunds:</strong>
                <p>You've already been charged for this billing period</p>
              </div>
            </div>
            <div className="impact-item">
              <span className="impact-icon">🔒</span>
              <div>
                <strong>Feature access:</strong>
                <p>Premium features will be disabled when the period ends</p>
              </div>
            </div>
            <div className="impact-item">
              <span className="impact-icon">🔄</span>
              <div>
                <strong>Reactivation:</strong>
                <p>You can resubscribe anytime to restore access</p>
              </div>
            </div>
          </div>

          <div className="modal-form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Keep Subscription
            </Button>
            <Button
              type="button"
              onClick={handleInitialConfirm}
              className="danger-button"
            >
              Continue with Cancellation
            </Button>
          </div>
        </div>
      )}

      {step === 'form' && (
        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="modal-form-error">
              ⚠️ {error}
            </div>
          )}

          <div className="modal-form-group">
            <Label htmlFor="reason">Reason for cancellation *</Label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            >
              <option value="">Please select a reason</option>
              {CANCELLATION_REASONS.map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <Label htmlFor="effectiveDate">When should the cancellation take effect?</Label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="effectiveDate"
                  value="end_of_period"
                  checked={formData.effectiveDate === 'end_of_period'}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span>At the end of current billing period ({formatDate(subscriptionData.subscriptionEnd)})</span>
                <small>Recommended - You keep access to premium features until you've used what you paid for</small>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="effectiveDate"
                  value="immediate"
                  checked={formData.effectiveDate === 'immediate'}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span>Immediately</span>
                <small>You'll lose access to premium features right away (no refund available)</small>
              </label>
            </div>
          </div>

          <div className="modal-form-group">
            <Label htmlFor="feedback">Additional feedback (optional)</Label>
            <textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleInputChange}
              placeholder="Help us improve by sharing what we could have done better..."
              rows={4}
              disabled={isLoading}
            />
            <small>This feedback helps us improve our service for future customers</small>
          </div>

          <div className="modal-form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('confirm')}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="danger-button"
            >
              {isLoading ? '⏳ Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </form>
      )}

      {step === 'final' && (
        <div className="cancellation-success">
          <div className="success-icon">✅</div>
          <h3>Subscription Cancelled Successfully</h3>
          <p>Your Premium subscription has been cancelled as requested.</p>

          <div className="next-steps">
            <h4>What happens next:</h4>
            <ul>
              <li>✅ You'll receive a confirmation email shortly</li>
              <li>✅ Premium features remain active until {formatDate(subscriptionData.subscriptionEnd)}</li>
              <li>✅ No further charges will be made</li>
              <li>✅ You can resubscribe anytime from the billing page</li>
            </ul>
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
