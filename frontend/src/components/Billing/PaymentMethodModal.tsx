import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/modal';
import { Button } from '../UI/button';
import { Input } from '../UI/input';
import { Label } from '../UI/label';
import { addPaymentMethod, updatePaymentMethod } from '../../services/billingService';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'add' | 'update';
  existingPaymentMethod?: {
    id: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
}

interface PaymentFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  existingPaymentMethod
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Effect to prefill form with existing payment method data
  useEffect(() => {
    if (mode === 'update' && existingPaymentMethod) {
      setFormData(prev => ({
        ...prev,
        // For security reasons, we only prefill the expiry date
        // Card number and CVV must be re-entered for updates
        expiryMonth: existingPaymentMethod.expiryMonth.toString().padStart(2, '0'),
        expiryYear: existingPaymentMethod.expiryYear.toString(),
        // Don't prefill card number for security
        cardNumber: '',
      }));
    } else {
      // Reset form for add mode
      setFormData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: ''
      });
    }
  }, [mode, existingPaymentMethod]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
      errors.cardNumber = 'Please enter a valid card number';
    }

    if (!formData.expiryMonth || parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) {
      errors.expiryMonth = 'Please enter a valid month (01-12)';
    }

    if (!formData.expiryYear || parseInt(formData.expiryYear) < new Date().getFullYear()) {
      errors.expiryYear = 'Please enter a valid year';
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      errors.cvv = 'Please enter a valid CVV';
    }

    if (!formData.cardholderName.trim()) {
      errors.cardholderName = 'Please enter the cardholder name';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
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
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryMonth: parseInt(formData.expiryMonth),
        expiryYear: parseInt(formData.expiryYear),
        cvv: formData.cvv,
        cardholderName: formData.cardholderName
      };

      if (mode === 'add') {
        await addPaymentMethod(payload);
      } else {
        if (!existingPaymentMethod?.id) {
          throw new Error('No payment method ID provided for update');
        }
        await updatePaymentMethod(existingPaymentMethod.id, payload);
      }

      // Success!
      onSuccess();
      onClose();
      
    } catch (err) {
      console.error(`Error ${mode}ing payment method:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${mode} payment method`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Reset form
      setFormData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: ''
      });
      setError(null);
      setValidationErrors({});
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'add' ? 'Add Payment Method' : 'Update Payment Method'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && (
          <div className="modal-form-error">
            ⚠️ {error}
          </div>
        )}

        {/* Card Information */}
        <div className="payment-section">
          <h3 className="section-title">Card Information</h3>
          
          {mode === 'update' && existingPaymentMethod && (
            <div className="existing-card-info">
              <p className="text-sm text-gray-600 mb-3">
                Updating payment method: •••• •••• •••• {existingPaymentMethod.last4} ({existingPaymentMethod.brand?.toUpperCase()})
              </p>
            </div>
          )}
          
          <div className="modal-form-group">
            <Label htmlFor="cardNumber">
              {mode === 'update' ? 'New Card Number' : 'Card Number'}
            </Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              disabled={isLoading}
            />
            {validationErrors.cardNumber && (
              <div className="modal-form-error">{validationErrors.cardNumber}</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="modal-form-group" style={{ flex: 1 }}>
              <Label htmlFor="expiryMonth">Month</Label>
              <select
                id="expiryMonth"
                name="expiryMonth"
                value={formData.expiryMonth}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                    {(i + 1).toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              {validationErrors.expiryMonth && (
                <div className="modal-form-error">{validationErrors.expiryMonth}</div>
              )}
            </div>

            <div className="modal-form-group" style={{ flex: 1 }}>
              <Label htmlFor="expiryYear">Year</Label>
              <select
                id="expiryYear"
                name="expiryYear"
                value={formData.expiryYear}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value="">YYYY</option>
                {Array.from({ length: 20 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  );
                })}
              </select>
              {validationErrors.expiryYear && (
                <div className="modal-form-error">{validationErrors.expiryYear}</div>
              )}
            </div>

            <div className="modal-form-group" style={{ flex: 1 }}>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                maxLength={4}
                disabled={isLoading}
              />
              {validationErrors.cvv && (
                <div className="modal-form-error">{validationErrors.cvv}</div>
              )}
            </div>
          </div>

          <div className="modal-form-group">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleInputChange}
              placeholder="John Doe"
              disabled={isLoading}
            />
            {validationErrors.cardholderName && (
              <div className="modal-form-error">{validationErrors.cardholderName}</div>
            )}
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
            {isLoading ? (
              <>⏳ {mode === 'add' ? 'Adding...' : 'Updating...'}</>
            ) : (
              <>{mode === 'add' ? 'Add Payment Method' : 'Update Payment Method'}</>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
