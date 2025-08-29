import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card";
import { Button } from "../UI/button";
import { Badge } from "../UI/badge";
import { formatCurrency, formatDate } from "../../services/billingService";
import { Invoice } from "../../types/billing";
import "../../styles/Modal.css";

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onExport: (invoiceId: string, format: 'pdf' | 'csv') => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onExport
}) => {
  console.log('🔍 InvoiceViewModal render - isOpen:', isOpen, 'invoice:', invoice);
  
  if (!isOpen || !invoice) {
    console.log('❌ Modal not rendering - isOpen:', isOpen, 'invoice exists:', !!invoice);
    return null;
  }

  console.log('✅ Modal should render now with invoice:', invoice.number);

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-xl invoice-modal">
        <Card className="invoice-view-card">
          <CardHeader className="invoice-header">
            <div className="invoice-title-section">
              <div className="invoice-branding">
                <CardTitle className="company-title">XSCard Business Solutions</CardTitle>
                <p className="company-subtitle">Professional Digital Business Cards & Contact Management</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="close-button"
              >
                ✕
              </Button>
            </div>
            <div className="invoice-meta-header">
              <div className="invoice-number-date">
                <h2 className="invoice-title">INVOICE</h2>
                <h3 className="invoice-number">{invoice.number}</h3>
                <p className="invoice-date">Issue Date: {formatDate(invoice.date)}</p>
                <p className="invoice-due-date">Due Date: {formatDate(invoice.dueDate)}</p>
              </div>
              <Badge 
                variant={invoice.status === 'paid' ? 'default' : invoice.status === 'pending' ? 'secondary' : 'destructive'}
                className={`status-badge status-${invoice.status}`}
              >
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="invoice-content">
            {/* Bill To Section */}
            <div className="invoice-section bill-to-section">
              <div className="billing-address">
                <h4 className="section-title">Bill To:</h4>
                <div className="customer-info">
                  {invoice.customerName && <p className="customer-name">{invoice.customerName}</p>}
                  {invoice.customerEmail && <p className="customer-email">{invoice.customerEmail}</p>}
                  <p className="customer-address">Professional Business Client</p>
                  <p className="customer-address">Cape Town, South Africa</p>
                </div>
              </div>
              <div className="payment-summary">
                <h4 className="section-title">Payment Information:</h4>
                <div className="payment-info">
                  <p><strong>Amount:</strong> {formatCurrency(invoice.total || invoice.amount)}</p>
                  <p><strong>Status:</strong> 
                    <span className={`payment-status status-${invoice.status}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </p>
                  <p><strong>Currency:</strong> {invoice.currency || 'ZAR'}</p>
                </div>
              </div>
            </div>
            
            {/* Line Items */}
            <div className="invoice-section line-items-section">
              <h4 className="section-title">Service Details</h4>
              <div className="line-items">
                <div className="line-items-header">
                  <span className="header-description">Description</span>
                  <span className="header-quantity">Qty</span>
                  <span className="header-rate">Rate</span>
                  <span className="header-amount">Amount</span>
                </div>
                {invoice.lineItems.map((item, index) => (
                  <div key={index} className="line-item">
                    <span className="item-description">{item.description}</span>
                    <span className="item-quantity">{item.quantity}</span>
                    <span className="item-rate">{formatCurrency(item.rate)}</span>
                    <span className="item-amount">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Totals */}
            <div className="invoice-section totals-section">
              <div className="invoice-totals">
                {invoice.subtotal !== undefined && (
                  <div className="total-line">
                    <span className="total-label">Subtotal:</span>
                    <span className="total-value">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                )}
                {invoice.tax !== undefined && invoice.tax > 0 && (
                  <div className="total-line">
                    <span className="total-label">VAT (15%):</span>
                    <span className="total-value">{formatCurrency(invoice.tax)}</span>
                  </div>
                )}
                <div className="total-line total-final">
                  <span className="total-label">Total Amount:</span>
                  <span className="total-value">{formatCurrency(invoice.total || invoice.amount)}</span>
                </div>
              </div>
            </div>

            {/* Professional Footer */}
            <div className="invoice-section footer-section">
              <div className="footer-note">
                <p><strong>Thank you for choosing XSCard Business Solutions!</strong></p>
                <p>For support and inquiries, contact us at <strong>support@xscard.com</strong></p>
                <p className="demo-note">
                  <em>This is a demonstration invoice for client presentation purposes. 
                  In production, this will integrate with Wave Apps invoicing API.</em>
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="invoice-actions">
              <div className="export-buttons">
                <Button 
                  variant="outline"
                  onClick={() => onExport(invoice.id, 'pdf')}
                  className="export-pdf-button"
                  title={window.location.hostname === 'localhost' ? 'Export as PDF (HTML Preview in development)' : 'Export as PDF'}
                >
                  📄 Export PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onExport(invoice.id, 'csv')}
                  className="export-csv-button"
                >
                  📊 Export CSV
                </Button>
              </div>
              <Button 
                onClick={onClose}
                className="close-invoice-button"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
