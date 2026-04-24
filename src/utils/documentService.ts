/**
 * ID 21, 25: Document & Print Service
 * Centralized logic for Thermal Receipts, A4 Invoices, and Job Cards.
 */

export const triggerPrint = (elementId: string, title: string = 'Lakki ERP Document') => {
  const element = document.getElementById(elementId);
  const printContents = element?.innerHTML;
  
  if (!printContents) {
    console.error(`Element with ID ${elementId} not found for printing.`);
    toast.error("Component mismatch: Print target not identified.");
    return;
  }

  // Create a temporary hidden iframe for printing
  const iframe = document.createElement('iframe');
  
  // Minimal visibility but must be in DOM
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = '-1';
  
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    toast.error("Internal IFrame Error: Could not initialize print buffer.");
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
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
            background: white;
            color: black;
          }
          @media print {
            body { padding: 0; margin: 0; }
            @page { margin: 0; }
            .no-print { display: none; }
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
          // Wait for Tailwind to initialize
          window.tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#3b82f6',
                  secondary: '#1f2937',
                }
              }
            }
          };

          const checkLoaded = () => {
             const tailwindReady = !!document.head.querySelector('style[data-tailwind]');
             const images = Array.from(document.images);
             const imagesLoaded = images.length === 0 || images.every(img => img.complete);

             if (tailwindReady && imagesLoaded) {
                window.focus();
                window.print();
                setTimeout(() => {
                  window.frameElement.remove();
                }, 1000);
             } else {
                setTimeout(checkLoaded, 100);
             }
          };

          // Re-trigger tailwind processing if needed
          if (window.tailwind) {
            window.tailwind.process?.(document.body);
          }

          // Force check on load or as a fallback
          window.addEventListener('load', () => {
            setTimeout(checkLoaded, 400);
          });
          
          // Fallback trigger
          setTimeout(checkLoaded, 1500);
        </script>
      </body>
    </html>
  `);
  doc.close();
};

import { toast } from 'sonner';

/**
 * ID 61: Job Card Print Helper
 */
export const printJobCard = (jobId: string) => {
  triggerPrint(`job-card-${jobId}`, `Job Card #${jobId}`);
};

/**
 * ID 21: Thermal Receipt Print Helper
 */
export const printThermalReceipt = (orderId: string, elementId: string = 'thermal-receipt') => {
  triggerPrint(elementId, `Receipt #${orderId}`);
};

/**
 * ID 25: A4 Invoice Print Helper
 */
export const printA4Invoice = (orderId: string, elementId: string = 'a4-invoice') => {
  triggerPrint(elementId, `Invoice #${orderId}`);
};

/**
 * ID 167: Product Label Print Helper
 */
export const printProductLabel = (sku: string) => {
  triggerPrint(`product-label-${sku}`, `Label ${sku}`);
};
