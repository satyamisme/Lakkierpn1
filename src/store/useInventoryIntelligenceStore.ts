import { create } from "zustand";
import { inventoryIntelligenceService, DemandForecast, StockOptimizationSuggestion, StockoutRisk } from "../api/services/inventoryIntelligence";

interface InventoryIntelligenceState {
  forecast: DemandForecast[];
  suggestions: StockOptimizationSuggestion[];
  risks: StockoutRisk[];
  isLoading: boolean;
  error: string | null;
  fetchForecast: (productId: string) => Promise<void>;
  fetchSuggestions: () => Promise<void>;
  fetchRisks: () => Promise<void>;
}

export const useInventoryIntelligenceStore = create<InventoryIntelligenceState>((set) => ({
  forecast: [],
  suggestions: [],
  risks: [],
  isLoading: false,
  error: null,

  fetchForecast: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await inventoryIntelligenceService.getDemandForecast(productId);
      set({ forecast: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchSuggestions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await inventoryIntelligenceService.getStockOptimizationSuggestions();
      set({ suggestions: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchRisks: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await inventoryIntelligenceService.getStockoutRisk();
      set({ risks: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
