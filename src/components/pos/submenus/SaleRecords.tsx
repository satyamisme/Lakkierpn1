import React from "react";
import { SalesHistory } from "../SalesHistory";

/**
 * ID 21: Sale Records (Live Matrix)
 * This component acts as a wrapper for the centralized SalesHistory registry.
 */
export const SaleRecords: React.FC = () => {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-1 overflow-hidden">
        <SalesHistory />
      </div>
    </div>
  );
};
