import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '../types/billing';

// PDF generation utility for invoices
export class InvoicePDFGenerator {
  private static readonly PAGE_WIDTH = 210; // A4 width in mm
  private static readonly PAGE_HEIGHT = 297; // A4 height in mm
  private static readonly MARGIN = 20;

  /**
   * Generate PDF from HTML content
   */
  static async generateFromHTML(htmlContent: string, _filename: string = 'invoice.pdf'): Promise<Blob> {
    try {
      console.log('🔄 Generating PDF from HTML content...');
      
      // Create a temporary container for the HTML
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = htmlContent;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '794px'; // A4 width in pixels (at 96 DPI)
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      tempContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      
      document.body.appendChild(tempContainer);

      try {
        // Convert HTML to canvas
        const canvas = await html2canvas(tempContainer, {
          width: 794,
          height: 1123, // A4 height in pixels
          scale: 2, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        // Create PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Calculate dimensions to fit the page
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = this.PAGE_WIDTH - (this.MARGIN * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add image to PDF
        pdf.addImage(imgData, 'PNG', this.MARGIN, this.MARGIN, imgWidth, imgHeight);

        // Convert to blob
        const pdfBlob = pdf.output('blob');
        
        console.log('✅ PDF generated successfully');
        return pdfBlob;

      } finally {
        // Clean up
        document.body.removeChild(tempContainer);
      }

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate PDF directly from invoice data using jsPDF's text methods
   */
  static generateFromInvoiceData(invoice: Invoice): Blob {
    try {
      console.log('🔄 Generating PDF from invoice data...');
      
      // Validate required invoice data
      if (!invoice) {
        throw new Error('Invoice data is required');
      }
      
      // Provide safe defaults for missing data
      const safeInvoice = {
        ...invoice,
        number: invoice.number || 'DRAFT',
        date: invoice.date || new Date().toISOString(),
        dueDate: invoice.dueDate || new Date().toISOString(),
        customerName: invoice.customerName || 'Unknown Customer',
        customerEmail: invoice.customerEmail || 'No email provided',
        currency: invoice.currency || 'ZAR',
        status: invoice.status || 'draft',
        lineItems: invoice.lineItems || [],
        subtotal: invoice.subtotal || 0,
        tax: invoice.tax || 0,
        total: invoice.total || invoice.amount || 0,
        amount: invoice.amount || invoice.total || 0
      };

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set initial position
      let yPosition = this.MARGIN;
      const leftMargin = this.MARGIN;
      const rightMargin = this.PAGE_WIDTH - this.MARGIN;
      const contentWidth = rightMargin - leftMargin;

      // Helper function to add text with auto-wrap
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        pdf.setFont(options.font || 'helvetica', options.style || 'normal');
        pdf.setFontSize(options.fontSize || 12);
        pdf.text(text, x, y, options);
        return y + (options.lineHeight || 6);
      };

      // Header - Company info
      yPosition = addText('XSCard Business Solutions', leftMargin, yPosition, {
        fontSize: 24,
        style: 'bold',
        lineHeight: 10
      });
      
      yPosition = addText('Professional Digital Business Cards & Contact Management', leftMargin, yPosition, {
        fontSize: 12,
        lineHeight: 8
      });

      // Invoice title (right aligned)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(32);
      pdf.text('INVOICE', rightMargin, this.MARGIN, { align: 'right' });

      // Invoice number and dates (right aligned)
      yPosition = this.MARGIN + 15;
      yPosition = addText(safeInvoice.number, rightMargin, yPosition, {
        fontSize: 16,
        style: 'bold',
        align: 'right',
        lineHeight: 8
      });

      yPosition = addText(`Issue Date: ${new Date(safeInvoice.date).toLocaleDateString()}`, rightMargin, yPosition, {
        fontSize: 10,
        align: 'right',
        lineHeight: 6
      });

      yPosition = addText(`Due Date: ${new Date(safeInvoice.dueDate).toLocaleDateString()}`, rightMargin, yPosition, {
        fontSize: 10,
        align: 'right',
        lineHeight: 8
      });

      // Status badge
      pdf.setFillColor(59, 130, 246); // Blue color
      pdf.roundedRect(rightMargin - 30, yPosition, 25, 6, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(safeInvoice.status.toUpperCase(), rightMargin - 17.5, yPosition + 4, { align: 'center' });
      pdf.setTextColor(0, 0, 0); // Reset to black

      yPosition += 20;

      // Bill to section
      yPosition = addText('Bill To:', leftMargin, yPosition, {
        fontSize: 12,
        style: 'bold',
        lineHeight: 8
      });

      yPosition = addText(safeInvoice.customerName, leftMargin, yPosition, {
        fontSize: 12,
        style: 'bold',
        lineHeight: 6
      });

      yPosition = addText(safeInvoice.customerEmail, leftMargin, yPosition, {
        fontSize: 10,
        lineHeight: 6
      });

      yPosition = addText('Professional Business Client', leftMargin, yPosition, {
        fontSize: 10,
        lineHeight: 6
      });

      yPosition = addText('Cape Town, South Africa', leftMargin, yPosition, {
        fontSize: 10,
        lineHeight: 12
      });

      // Payment info (right side)
      let rightYPosition = yPosition - 30;
      rightYPosition = addText('Payment Information:', rightMargin - 80, rightYPosition, {
        fontSize: 12,
        style: 'bold',
        lineHeight: 8
      });

      rightYPosition = addText(`Amount: ${safeInvoice.currency} ${(safeInvoice.total || safeInvoice.amount || 0).toFixed(2)}`, rightMargin - 80, rightYPosition, {
        fontSize: 10,
        lineHeight: 6
      });

      rightYPosition = addText(`Status: ${safeInvoice.status.charAt(0).toUpperCase() + safeInvoice.status.slice(1)}`, rightMargin - 80, rightYPosition, {
        fontSize: 10,
        lineHeight: 6
      });

      rightYPosition = addText(`Currency: ${safeInvoice.currency}`, rightMargin - 80, rightYPosition, {
        fontSize: 10,
        lineHeight: 6
      });

      yPosition = Math.max(yPosition, rightYPosition) + 10;

      // Service details table
      yPosition = addText('Service Details', leftMargin, yPosition, {
        fontSize: 16,
        style: 'bold',
        lineHeight: 12
      });

      // Table header
      const tableStartY = yPosition;
      const rowHeight = 8;
      const colWidths = [90, 25, 35, 35]; // Description, Qty, Rate, Amount
      let colX = leftMargin;

      // Draw table header background
      pdf.setFillColor(249, 250, 251);
      pdf.rect(leftMargin, yPosition, contentWidth, rowHeight, 'F');

      // Header text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('DESCRIPTION', colX + 2, yPosition + 5);
      colX += colWidths[0];
      pdf.text('QTY', colX + 2, yPosition + 5);
      colX += colWidths[1];
      pdf.text('RATE', colX + 2, yPosition + 5);
      colX += colWidths[2];
      pdf.text('AMOUNT', colX + 2, yPosition + 5);

      yPosition += rowHeight;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      safeInvoice.lineItems.forEach((item, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(leftMargin, yPosition, contentWidth, rowHeight, 'F');
        }

        colX = leftMargin;
        pdf.text(item.description, colX + 2, yPosition + 5);
        colX += colWidths[0];
        pdf.text(item.quantity.toString(), colX + 2, yPosition + 5, { align: 'center' });
        colX += colWidths[1];
        pdf.text(`${safeInvoice.currency} ${item.rate.toFixed(2)}`, colX + colWidths[2] - 2, yPosition + 5, { align: 'right' });
        colX += colWidths[2];
        pdf.text(`${safeInvoice.currency} ${item.amount.toFixed(2)}`, colX + colWidths[3] - 2, yPosition + 5, { align: 'right' });

        yPosition += rowHeight;
      });

      // Table border
      pdf.setDrawColor(229, 231, 235);
      pdf.rect(leftMargin, tableStartY, contentWidth, yPosition - tableStartY);

      // Summary section
      yPosition += 10;
      const summaryX = rightMargin - 60;

      yPosition = addText(`Subtotal: ${safeInvoice.currency} ${(safeInvoice.subtotal || 0).toFixed(2)}`, summaryX, yPosition, {
        fontSize: 10,
        align: 'right',
        lineHeight: 6
      });

      yPosition = addText(`VAT (15%): ${safeInvoice.currency} ${(safeInvoice.tax || 0).toFixed(2)}`, summaryX, yPosition, {
        fontSize: 10,
        align: 'right',
        lineHeight: 8
      });

      // Total with border
      pdf.setDrawColor(229, 231, 235);
      pdf.line(summaryX - 55, yPosition, rightMargin, yPosition);
      yPosition += 2;

      yPosition = addText(`Total Amount: ${safeInvoice.currency} ${(safeInvoice.total || safeInvoice.amount || 0).toFixed(2)}`, summaryX, yPosition, {
        fontSize: 12,
        style: 'bold',
        align: 'right',
        lineHeight: 15
      });

      // Footer
      yPosition = this.PAGE_HEIGHT - 40;
      pdf.setFillColor(249, 250, 251);
      pdf.rect(leftMargin, yPosition, contentWidth, 30, 'F');

      yPosition += 10;
      yPosition = addText('Thank you for choosing XSCard Business Solutions!', this.PAGE_WIDTH / 2, yPosition, {
        fontSize: 14,
        style: 'bold',
        align: 'center',
        lineHeight: 8
      });

      yPosition = addText('For support and inquiries, contact us at support@xscard.com', this.PAGE_WIDTH / 2, yPosition, {
        fontSize: 10,
        align: 'center'
      });

      const pdfBlob = pdf.output('blob');
      console.log('✅ PDF generated successfully from invoice data');
      return pdfBlob;

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Generate a proper PDF from invoice data
 */
export const generateInvoicePDF = async (invoice: Invoice, useHTMLMethod: boolean = false): Promise<Blob> => {
  try {
    if (useHTMLMethod) {
      // Method 1: Generate from HTML (better styling, but more complex)
      const htmlContent = generateInvoiceHTML(invoice);
      return await InvoicePDFGenerator.generateFromHTML(htmlContent, `invoice-${invoice.number}.pdf`);
    } else {
      // Method 2: Generate directly with jsPDF (faster, simpler)
      return InvoicePDFGenerator.generateFromInvoiceData(invoice);
    }
  } catch (error) {
    console.error('❌ Invoice PDF generation failed:', error);
    throw error;
  }
};

/**
 * Generate HTML content for invoice (used by HTML-to-PDF method)
 */
function generateInvoiceHTML(invoice: Invoice): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.number}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: white; color: #1f2937; line-height: 1.6; padding: 40px;
        }
        .invoice-container {
            max-width: 800px; margin: 0 auto; background: white;
            border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;
        }
        .invoice-header {
            display: flex; justify-content: space-between; align-items: flex-start;
            padding: 32px 32px 24px; border-bottom: 1px solid #e5e7eb;
        }
        .company-info h1 { color: #3b82f6; font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .company-info p { color: #6b7280; font-size: 14px; }
        .invoice-title-section { text-align: right; }
        .invoice-title { color: #3b82f6; font-size: 32px; font-weight: 700; margin-bottom: 8px; }
        .invoice-number { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
        .invoice-dates { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
        .status-badge {
            background: #3b82f6; color: white; padding: 4px 12px; border-radius: 16px;
            font-size: 12px; font-weight: 600; display: inline-block;
        }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 24px 32px; }
        .bill-to h3, .payment-info h3 { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; }
        .customer-name { font-weight: 600; margin-bottom: 4px; }
        .customer-email { color: #3b82f6; margin-bottom: 4px; }
        .customer-details { color: #6b7280; font-size: 14px; }
        .payment-info-grid { display: grid; gap: 8px; }
        .payment-row { display: flex; justify-content: space-between; font-size: 14px; }
        .payment-label { color: #6b7280; }
        .payment-value { font-weight: 500; }
        .service-details { padding: 0 32px 32px; }
        .service-details h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
        .invoice-table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; }
        .table-header { background: #f9fafb; }
        .table-header th { padding: 12px; text-align: left; font-size: 12px; font-weight: 600; }
        .table-row td { padding: 16px 12px; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
        .amount-column { text-align: right; font-weight: 500; }
        .summary-section { margin-top: 24px; display: flex; justify-content: flex-end; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .summary-row.total { border-top: 1px solid #e5e7eb; margin-top: 8px; font-weight: 700; }
        .footer { text-align: center; padding: 24px; background: #f9fafb; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="company-info">
                <h1>XSCard Business Solutions</h1>
                <p>Professional Digital Business Cards & Contact Management</p>
            </div>
            <div class="invoice-title-section">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">${invoice.number}</div>
                <div class="invoice-dates">
                    <div>Issue Date: ${new Date(invoice.date || new Date()).toLocaleDateString()}</div>
                    <div>Due Date: ${new Date(invoice.dueDate || new Date()).toLocaleDateString()}</div>
                </div>
                <div class="status-badge">${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</div>
            </div>
        </div>
        
        <div class="invoice-details">
            <div class="bill-to">
                <h3>Bill To:</h3>
                <div class="customer-name">${invoice.customerName || 'Unknown Customer'}</div>
                <div class="customer-email">${invoice.customerEmail || 'No email provided'}</div>
                <div class="customer-details">Professional Business Client</div>
                <div class="customer-details">Cape Town, South Africa</div>
            </div>
            
            <div class="payment-info">
                <h3>Payment Information:</h3>
                <div class="payment-info-grid">
                    <div class="payment-row">
                        <span class="payment-label">Amount:</span>
                        <span class="payment-value">${invoice.currency} ${(invoice.total || invoice.amount || 0).toFixed(2)}</span>
                    </div>
                    <div class="payment-row">
                        <span class="payment-label">Status:</span>
                        <span class="payment-value">${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
                    </div>
                    <div class="payment-row">
                        <span class="payment-label">Currency:</span>
                        <span class="payment-value">${invoice.currency}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="service-details">
            <h3>Service Details</h3>
            <table class="invoice-table">
                <thead class="table-header">
                    <tr>
                        <th>DESCRIPTION</th>
                        <th style="text-align: center;">QTY</th>
                        <th style="text-align: right;">RATE</th>
                        <th style="text-align: right;">AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.lineItems.map((item) => `
                        <tr class="table-row">
                            <td>${item.description}</td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td class="amount-column">${invoice.currency} ${item.rate.toFixed(2)}</td>
                            <td class="amount-column">${invoice.currency} ${item.amount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="summary-section">
                <div>
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>${invoice.currency} ${(invoice.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>VAT (15%):</span>
                        <span>${invoice.currency} ${(invoice.tax || 0).toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total Amount:</span>
                        <span>${invoice.currency} ${(invoice.total || invoice.amount || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <h4>Thank you for choosing XSCard Business Solutions!</h4>
            <p>For support and inquiries, contact us at support@xscard.com</p>
        </div>
    </div>
</body>
</html>`;
}
