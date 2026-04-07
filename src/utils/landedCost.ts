/**
 * ID 128: Landed Cost Calculator
 * Calculates the final cost of a product including shipping, duty, and taxes.
 */
export const calculateLandedCost = (
  unitCost: number,
  shippingCost: number,
  customsDutyPercent: number,
  otherFees: number = 0
): number => {
  const duty = unitCost * (customsDutyPercent / 100);
  return unitCost + shippingCost + duty + otherFees;
};
