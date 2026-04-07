import { create } from "zustand";
import { imeiTimelineService, ImeiEvent } from "../api/services/imeiTimeline";

interface ImeiTimelineState {
  history: ImeiEvent[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: (imei: string) => Promise<void>;
  clearHistory: () => void;
}

export const useImeiTimelineStore = create<ImeiTimelineState>((set) => ({
  history: [],
  isLoading: false,
  error: null,

  fetchHistory: async (imei: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await imeiTimelineService.getImeiHistory(imei);
      set({ history: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  clearHistory: () => set({ history: [], error: null }),
}));
