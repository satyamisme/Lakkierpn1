/**
 * ID 121: WhatsApp Notification Generator
 * Generates a pre-filled WhatsApp API link for customer notifications.
 */
export const generateWhatsAppLink = (
  phone: string,
  customerName: string,
  phoneModel: string,
  amount: number
): string => {
  // Clean phone number (remove spaces, plus, etc.)
  const cleanPhone = phone.replace(/\D/g, '');
  
  const message = `Hello ${customerName}, your ${phoneModel} is ready for pickup at Lakki Phone. Total: ${amount.toFixed(3)} KD. Thank you!`;
  
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * ID 121: SMS Link Generator (Fallback)
 */
export const generateSMSLink = (phone: string, customerName: string, phoneModel: string, amount: number): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = `Hello ${customerName}, your ${phoneModel} is ready for pickup at Lakki Phone. Total: ${amount.toFixed(3)} KD.`;
  return `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
};
