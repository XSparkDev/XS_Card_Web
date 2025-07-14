// Test script for invoice functionality
// Run this in the browser console to test the modal and PDF export

console.log('🧪 Starting invoice functionality test...');

// Test 1: Check if the test button exists
const testButton = document.querySelector('button:contains("🧪 Test Modal")');
console.log('Test button found:', !!testButton);

// Test 2: Simulate button click
if (testButton) {
  console.log('Clicking test button...');
  testButton.click();
} else {
  console.log('❌ Test button not found. Checking for any View buttons...');
  const viewButtons = document.querySelectorAll('button:contains("View")');
  console.log('View buttons found:', viewButtons.length);
  
  if (viewButtons.length > 0) {
    console.log('Clicking first View button...');
    viewButtons[0].click();
  }
}

// Test 3: Check if modal is visible
setTimeout(() => {
  const modal = document.querySelector('.modal-backdrop');
  const modalContent = document.querySelector('.invoice-modal');
  
  console.log('Modal backdrop found:', !!modal);
  console.log('Modal content found:', !!modalContent);
  
  if (modal) {
    console.log('Modal is visible:', modal.style.display !== 'none');
  }
  
  if (modalContent) {
    console.log('Modal content visible:', modalContent.offsetParent !== null);
  }
}, 1000);

// Test 4: Test PDF export
console.log('Testing PDF export...');

// Create a test invoice ID for export
const testInvoiceId = 'test-123';

// Try to find and click a PDF export button
setTimeout(() => {
  const pdfButton = document.querySelector('button[title="Export as PDF"]');
  if (pdfButton) {
    console.log('Found PDF button, clicking...');
    pdfButton.click();
  } else {
    console.log('❌ PDF export button not found');
  }
}, 2000);

console.log('🧪 Test complete. Check console output above for results.');
