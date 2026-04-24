/**
 * BalanceLogic.ts
 * Pure logic utility for multi-payment split calculations.
 */

export interface PaymentData {
  cash: number;
  knet: number;
  creditCard: number;
  giftCard: number;
  storeCredit: number;
}

export const calculateTotalPaid = (payments: PaymentData): number => {
  return (Number(payments.cash) || 0) + 
         (Number(payments.knet) || 0) + 
         (Number(payments.creditCard) || 0) + 
         (Number(payments.giftCard) || 0) + 
         (Number(payments.storeCredit) || 0);
};

export const calculateRemainingBalance = (totalAmount: number, totalPaid: number): number => {
  return totalAmount - totalPaid;
};

export const isFullyPaid = (remainingBalance: number): boolean => {
  return Math.abs(remainingBalance) < 0.001;
};

export const isOverPaid = (remainingBalance: number): boolean => {
  return remainingBalance < -0.001;
};
