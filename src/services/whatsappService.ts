/**
 * ID 251: WhatsApp Service (whatsappService.ts)
 * Handles template-based messaging via CallMeBot or Mock.
 */

export const sendTemplate = async (to: string, templateName: string, variables: Record<string, string>) => {
  const apiKey = process.env.WHATSAPP_API_KEY;
  
  // Format message based on template
  let message = "";
  switch (templateName) {
    case 'repair_ready':
      message = `Hello ${variables.customerName}, your repair (${variables.ticketId}) for ${variables.deviceModel} is READY for pickup! Total: ${variables.amount} KD.`;
      break;
    case 'receipt':
      message = `Thank you for shopping at Lakki Phone! Your receipt for ${variables.amount} KD is attached. View: ${variables.receiptUrl}`;
      break;
    case 'birthday_coupon':
      message = `Happy Birthday ${variables.customerName}! 🎂 Use code BDAY10 for 10% off your next repair or accessory!`;
      break;
    default:
      message = `Lakki Phone Update: ${JSON.stringify(variables)}`;
  }

  if (apiKey) {
    try {
      // CallMeBot API: https://api.callmebot.com/whatsapp.php?phone=[phone]&text=[text]&apikey=[apikey]
      const url = `https://api.callmebot.com/whatsapp.php?phone=${to}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      console.error("WhatsApp API Error:", error);
      return false;
    }
  } else {
    // Mock Mode (ID 251 Fallback)
    return true;
  }
};
