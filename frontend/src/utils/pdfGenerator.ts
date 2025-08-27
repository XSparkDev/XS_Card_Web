// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import { Invoice } from '../types/billing';

/**
 * PDF Generator Utility
 * Handles generation of PDF documents for invoices and reports
 */
export class PDFGenerator {
  private static readonly PAGE_WIDTH = 210; // A4 width in mm
  private static readonly MARGIN = 20; // Margin in mm

  /**
   * Generate PDF from HTML element
   * @param element - HTML element to convert to PDF
   * @returns Promise<Blob> - Generated PDF as blob
   */
  static async generateFromElement(element: HTMLElement): Promise<Blob> {
    console.log('🔄 PDF generation from element is temporarily disabled');
    throw new Error('PDF generation is temporarily disabled - missing dependencies');
    
    // TODO: Re-enable when jspdf and html2canvas are properly configured
    /*
    try {
      console.log('🔄 Generating PDF from HTML element...');
      
      // Create temporary container
      const tempContainer = element.cloneNode(true) as HTMLElement;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '794px'; // A4 width in pixels
      tempContainer.style.backgroundColor = '#ffffff';
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
    */
  }

  /**
   * Generate PDF directly from invoice data using jsPDF's text methods
   */
  static generateFromInvoiceData(invoice: Invoice): Blob {
    console.log('🔄 PDF generation from invoice data is temporarily disabled');
    throw new Error('PDF generation is temporarily disabled - missing dependencies');
    
    // TODO: Re-enable when jspdf is properly configured
    /*
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
      
      yPosition = addText('Digital Business Card Solutions', leftMargin, yPosition, {
        fontSize: 14,
        style: 'italic',
        lineHeight: 8
      });

      yPosition = addText('Email: support@xscard.com', leftMargin, yPosition, {
        fontSize: 10,
        lineHeight: 6
      });
      
      yPosition = addText('Phone: +27 11 123 4567', leftMargin, yPosition, {
        fontSize: 10,
        lineHeight: 6
      });

      yPosition += 10; // Add some space

      // Invoice header
      yPosition = addText(`INVOICE #${safeInvoice.number}`, rightMargin - 60, yPosition, {
        fontSize: 18,
        style: 'bold',
        align: 'right',
        lineHeight: 8
      });

      yPosition = addText(`Date: ${new Date(safeInvoice.date).toLocaleDateString()}`, rightMargin - 60, yPosition, {
        fontSize: 12,
        align: 'right',
        lineHeight: 6
      });

      yPosition = addText(`Due Date: ${new Date(safeInvoice.dueDate).toLocaleDateString()}`, rightMargin - 60, yPosition, {
        fontSize: 12,
        align: 'right',
        lineHeight: 6
      });

      yPosition += 15; // Add space before customer info

      // Customer information
      yPosition = addText('Bill To:', leftMargin, yPosition, {
        fontSize: 14,
        style: 'bold',
        lineHeight: 8
      });

      yPosition = addText(safeInvoice.customerName, leftMargin, yPosition, {
        fontSize: 12,
        lineHeight: 6
      });

      yPosition = addText(safeInvoice.customerEmail, leftMargin, yPosition, {
        fontSize: 12,
        lineHeight: 6
      });

      yPosition += 15; // Add space before line items

      // Line items header
      yPosition = addText('Description', leftMargin, yPosition, {
        fontSize: 12,
        style: 'bold',
        lineHeight: 8
      });

      addText('Amount', rightMargin - 30, yPosition, {
        fontSize: 12,
        style: 'bold',
        align: 'right',
        lineHeight: 8
      });

      yPosition += 5; // Add space before line items

      // Line items
      safeInvoice.lineItems.forEach((item, index) => {
        if (yPosition > 250) { // Check if we need a new page
          pdf.addPage();
          yPosition = this.MARGIN;
        }
        
        yPosition = addText(item.description || 'Service', leftMargin, yPosition, {
          fontSize: 10,
          lineHeight: 5
        });
        
        addText(`${safeInvoice.currency} ${item.amount?.toFixed(2) || '0.00'}`, rightMargin - 30, yPosition, {
          fontSize: 10,
          align: 'right',
          lineHeight: 5
        });
        
        yPosition += 2;
      });

      yPosition += 10; // Add space before totals

      // Totals
      const totalY = yPosition;
      
      addText('Subtotal:', rightMargin - 60, totalY, {
        fontSize: 12,
        align: 'right',
        lineHeight: 6
      });

      addText(`${safeInvoice.currency} ${safeInvoice.subtotal?.toFixed(2) || '0.00'}`, rightMargin - 10, totalY, {
        fontSize: 12,
        align: 'right',
        lineHeight: 6
      });

      addText('Tax:', rightMargin - 60, totalY + 8, {
        fontSize: 12,
        align: 'right',
        lineHeight: 6
      });
      
      addText(`${safeInvoice.currency} ${safeInvoice.tax?.toFixed(2) || '0.00'}`, rightMargin - 10, totalY + 8, {
        fontSize: 12,
        align: 'right',
        lineHeight: 6
      });

      addText('Total:', rightMargin - 60, totalY + 16, {
        fontSize: 14,
        style: 'bold',
        align: 'right',
        lineHeight: 8
      });
      
      addText(`${safeInvoice.currency} ${safeInvoice.total?.toFixed(2) || '0.00'}`, rightMargin - 10, totalY + 16, {
        fontSize: 14,
        style: 'bold',
        align: 'right',
        lineHeight: 8
      });

      // Footer
      const footerY = 280;
      addText('Thank you for your business!', leftMargin, footerY, {
        fontSize: 10,
        style: 'italic',
        lineHeight: 6
      });
      
      addText('Payment is due within 30 days', leftMargin, footerY + 6, {
        fontSize: 8,
        lineHeight: 4
      });

      // Convert to blob
      const pdfBlob = pdf.output('blob');
      
      console.log('✅ PDF generated successfully from invoice data');
      return pdfBlob;

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    */
  }

  /**
   * Download PDF blob as file
   * @param blob - PDF blob to download
   * @param filename - Name of the file to download
   */
  static downloadPDF(blob: Blob, filename: string): void {
    try {
      console.log('🔄 Downloading PDF...');
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ PDF downloaded successfully');
    } catch (error) {
      console.error('❌ PDF download failed:', error);
      throw new Error(`PDF download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
   * Generate and download PDF from HTML element
   * @param element - HTML element to convert to PDF
   * @param filename - Name of the file to download
   */
  static async generateAndDownloadFromElement(element: HTMLElement, filename: string): Promise<void> {
    try {
      console.log('🔄 Generating and downloading PDF from element...');
      
      const blob = await this.generateFromElement(element);
      this.downloadPDF(blob, filename);
      
    } catch (error) {
      console.error('❌ PDF generation and download failed:', error);
      throw error;
    }
  }

  /**
   * Generate and download PDF from invoice data
   * @param invoice - Invoice data to convert to PDF
   * @param filename - Name of the file to download
   */
  static generateAndDownloadFromInvoiceData(invoice: Invoice, filename: string): void {
    try {
      console.log('🔄 Generating and downloading PDF from invoice data...');
      
      const blob = this.generateFromInvoiceData(invoice);
      this.downloadPDF(blob, filename);
      
    } catch (error) {
      console.error('❌ PDF generation and download failed:', error);
      throw error;
    }
  }
}
