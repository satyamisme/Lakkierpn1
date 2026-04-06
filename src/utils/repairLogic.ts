export const FAULT_PRICES: Record<string, number> = {
  'Broken Screen': 25.000,
  'Battery Replacement': 12.000,
  'No Power': 15.000,
  'Water Damage': 35.000,
  'Charging Port': 10.000,
  'Speaker/Mic': 8.000,
  'Camera Repair': 18.000,
  'Software/Unlocking': 5.000
};

/**
 * ID 65: Estimated Quote Logic
 * Calculates the total estimated cost based on selected faults.
 */
export const calculateEstimatedQuote = (selectedFaults: string[]): number => {
  return selectedFaults.reduce((total, fault) => {
    return total + (FAULT_PRICES[fault] || 0);
  }, 0);
};
