import client from "../client";

export interface DemandForecast {
  date: string;
  predictedSales: number;
  confidenceInterval: [number, number];
}

export interface StockOptimizationSuggestion {
  productId: string;
  name: string;
  currentStock: number;
  suggestedStock: number;
  action: "restock" | "liquidate" | "hold";
  reason: string;
}

export interface StockoutRisk {
  productId: string;
  name: string;
  daysUntilStockout: number;
  riskLevel: "high" | "medium" | "low";
}

export const inventoryIntelligenceService = {
  // GET /api/inventory-intelligence/forecast/:productId
  getDemandForecast: async (productId: string) => {
    const response = await client.get<DemandForecast[]>(`/inventory-intelligence/forecast/${productId}`);
    return response.data;
  },

  // GET /api/inventory-intelligence/optimization
  getStockOptimizationSuggestions: async () => {
    const response = await client.get<StockOptimizationSuggestion[]>("/inventory-intelligence/optimization");
    return response.data;
  },

  // GET /api/inventory-intelligence/stockout-risk
  getStockoutRisk: async () => {
    const response = await client.get<StockoutRisk[]>("/inventory-intelligence/stockout-risk");
    return response.data;
  },
};
