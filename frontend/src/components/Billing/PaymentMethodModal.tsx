import React, { useState } from 'react';
import { Modal } from '../UI/modal';
import { Button } from '../UI/button';
import { Input } from '../UI/input';
import { Label } from '../UI/label';
import { authenticatedFetch } from '../../utils/api';

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
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
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
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'South Africa'
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

    if (!formData.billingAddress.street.trim()) {
      errors.street = 'Please enter a billing address';
    }

    if (!formData.billingAddress.city.trim()) {
      errors.city = 'Please enter a city';
    }

    if (!formData.billingAddress.postalCode.trim()) {
      errors.postalCode = 'Please enter a postal code';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('billingAddress.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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
        cardholderName: formData.cardholderName,
        billingAddress: formData.billingAddress
      };

      const endpoint = mode === 'add' 
        ? '/api/billing/payment-methods'
        : `/api/billing/payment-methods/${existingPaymentMethod?.id}`;

      const response = await authenticatedFetch(endpoint, {
        method: mode === 'add' ? 'POST' : 'PUT',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${mode} payment method`);
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
        cardholderName: '',
        billingAddress: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'South Africa'
        }
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
          
          <div className="modal-form-group">
            <Label htmlFor="cardNumber">Card Number</Label>
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

        {/* Billing Address */}
        <div className="payment-section">
          <h3 className="section-title">Billing Address</h3>
          
          <div className="modal-form-group">
            <Label htmlFor="billingAddress.street">Street Address</Label>
            <Input
              id="billingAddress.street"
              name="billingAddress.street"
              value={formData.billingAddress.street}
              onChange={handleInputChange}
              placeholder="123 Main Street"
              disabled={isLoading}
            />
            {validationErrors.street && (
              <div className="modal-form-error">{validationErrors.street}</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="modal-form-group" style={{ flex: 1 }}>
              <Label htmlFor="billingAddress.city">City</Label>
              <Input
                id="billingAddress.city"
                name="billingAddress.city"
                value={formData.billingAddress.city}
                onChange={handleInputChange}
                placeholder="Cape Town"
                disabled={isLoading}
              />
              {validationErrors.city && (
                <div className="modal-form-error">{validationErrors.city}</div>
              )}
            </div>

            <div className="modal-form-group" style={{ flex: 1 }}>
              <Label htmlFor="billingAddress.state">State/Province</Label>
              <Input
                id="billingAddress.state"
                name="billingAddress.state"
                value={formData.billingAddress.state}
                onChange={handleInputChange}
                placeholder="Western Cape"
                disabled={isLoading}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="modal-form-group" style={{ flex: 1 }}>
              <Label htmlFor="billingAddress.postalCode">Postal Code</Label>
              <Input
                id="billingAddress.postalCode"
                name="billingAddress.postalCode"
                value={formData.billingAddress.postalCode}
                onChange={handleInputChange}
                placeholder="8001"
                disabled={isLoading}
              />
              {validationErrors.postalCode && (
                <div className="modal-form-error">{validationErrors.postalCode}</div>
              )}
            </div>

            <div className="modal-form-group" style={{ flex: 1 }}>
              <Label htmlFor="billingAddress.country">Country</Label>
              <select
                id="billingAddress.country"
                name="billingAddress.country"
                value={formData.billingAddress.country}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value="South Africa">South Africa</option>
                <option value="Botswana">Botswana</option>
                <option value="Namibia">Namibia</option>
                <option value="Zimbabwe">Zimbabwe</option>
                <option value="Other">Other</option>
              </select>
            </div>
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
