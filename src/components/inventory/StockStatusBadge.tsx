import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StockStatusBadgeProps {
  stock: number;
  threshold?: number;
}

/**
 * ID 34: Stock Status Badge Atom
 * Returns a Red badge if stock < minThreshold, Orange if low, and Green if healthy.
 */
export const StockStatusBadge: React.FC<StockStatusBadgeProps> = ({ stock, threshold = 5 }) => {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-200 dark:border-red-800">
        <AlertCircle className="w-3 h-3" /> Out of Stock
      </span>
    );
  }

  if (stock < threshold) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800">
        <AlertTriangle className="w-3 h-3" /> Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[9px] font-black uppercase tracking-widest border border-green-200 dark:border-green-800">
      <CheckCircle2 className="w-3 h-3" /> Healthy
    </span>
  );
};
