import cron from 'node-cron';
import Customer from '../models/Customer.js';
import Repair from '../models/Repair.js';
import { sendTemplate } from './whatsappService.js';

/**
 * ID 253: Birthday Coupon Bot
 * Every day at 8 AM, find customers with birthday today.
 */
cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  try {
    const customers = await Customer.find({
      whatsappOptIn: true,
      $expr: {
        $and: [
          { $eq: [{ $month: "$birthday" }, month] },
          { $eq: [{ $dayOfMonth: "$birthday" }, day] }
        ]
      }
    });

    for (const customer of customers) {
      await sendTemplate(customer.phone, 'birthday_coupon', { customerName: customer.name });
    }
  } catch (error) {
    console.error("Birthday Bot Error:", error);
  }
});

/**
 * ID 254: Review Solicitor
 * After repair completion (picked_up), schedule review request after 2 days.
 */
export const scheduleReviewRequest = async (repairId: string) => {
  const repair = await Repair.findById(repairId);
  if (!repair || !repair.customerPhone) return;

  // Schedule for 2 days later (Mock: 10 seconds for demo)
  setTimeout(async () => {
    const currentRepair = await Repair.findById(repairId);
    if (currentRepair?.status === 'picked_up') {
      await sendTemplate(currentRepair.customerPhone, 'review_request', { 
        customerName: currentRepair.customerName,
        ticketId: currentRepair.ticketId,
        reviewUrl: `https://g.page/lakki-phone/review`
      });
      
      await Customer.findOneAndUpdate(
        { phone: currentRepair.customerPhone },
        { lastReviewSent: new Date() }
      );
    }
  }, 10000); // 10 seconds for demo, should be 2 * 24 * 60 * 60 * 1000
};

export const manualReviewTrigger = async (customerPhone: string) => {
  const customer = await Customer.findOne({ phone: customerPhone });
  if (customer) {
    return await sendTemplate(customerPhone, 'review_request', { 
      customerName: customer.name,
      reviewUrl: `https://g.page/lakki-phone/review`
    });
  }
  return false;
};
