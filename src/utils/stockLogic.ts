/**
 * ID 34: Stock Logic Utility
 * Calculates inventory metrics for reporting and alerts.
 */

interface StockItem {
  price: number;
  costPrice: number;
  stock: number;
}

export const calculateInventoryValue = (items: StockItem[]): number => {
  return items.reduce((sum, item) => sum + (item.costPrice * item.stock), 0);
};

export const calculateProjectedProfit = (items: StockItem[]): number => {
  return items.reduce((sum, item) => sum + ((item.price - item.costPrice) * item.stock), 0);
};

export const getStockStatus = (stock: number, threshold: number = 5) => {
  if (stock <= 0) return 'critical';
  if (stock < threshold) return 'low';
  return 'healthy';
};

export const STOCK_THRESHOLDS = {
  CRITICAL: 0,
  LOW: 5,
  HEALTHY: 10
};
