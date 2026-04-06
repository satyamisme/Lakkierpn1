/**
 * ID 21, 25: Document & Print Service
 * Centralized logic for Thermal Receipts, A4 Invoices, and Job Cards.
 */

export const triggerPrint = (elementId: string, title: string = 'Lakki ERP Document') => {
  const element = document.getElementById(elementId);
  const printContents = element?.innerHTML;
  
  if (!printContents) {
    console.error(`Element with ID ${elementId} not found for printing.`);
    return;
  }

  // Create a temporary hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`
    <html>
      <head>
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Noto+Sans+Arabic:wght@400;700;900&display=swap');
          body { 
            font-family: 'Inter', 'Noto Sans Arabic', sans-serif; 
            margin: 0;
            padding: 20px;
            -webkit-print-color-adjust: exact;
          }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
          /* Thermal Receipt Specific Styles */
          .thermal-receipt {
            width: 80mm;
            max-width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="${elementId.includes('thermal') ? 'thermal-receipt' : ''}">
          ${printContents}
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              setTimeout(() => {
                window.frameElement.remove();
              }, 500);
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  doc.close();
};

/**
 * ID 61: Job Card Print Helper
 */
export const printJobCard = (jobId: string) => {
  triggerPrint(`job-card-${jobId}`, `Job Card #${jobId}`);
};

/**
 * ID 21: Thermal Receipt Print Helper
 */
export const printThermalReceipt = (orderId: string) => {
  triggerPrint('thermal-receipt', `Receipt #${orderId}`);
};

/**
 * ID 25: A4 Invoice Print Helper
 */
export const printA4Invoice = (orderId: string) => {
  triggerPrint('a4-invoice', `Invoice #${orderId}`);
};
