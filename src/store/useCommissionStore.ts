import { create } from "zustand";
import { commissionService, CommissionReport } from "../api/services/commission";

interface CommissionState {
  currentReport: CommissionReport | null;
  isLoading: boolean;
  error: string | null;
  fetchReport: (staffId: string, period: string) => Promise<void>;
  recalculate: (period: string) => Promise<void>;
}

export const useCommissionStore = create<CommissionState>((set) => ({
  currentReport: null,
  isLoading: false,
  error: null,

  fetchReport: async (staffId, period) => {
    set({ isLoading: true, error: null });
    try {
      const data = await commissionService.getCommissionReport(staffId, period);
      set({ currentReport: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  recalculate: async (period) => {
    set({ isLoading: true, error: null });
    try {
      await commissionService.recalculateCommission(period);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
