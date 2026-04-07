import { create } from "zustand";
import { commissionService, LeaderboardEntry } from "../api/services/commission";

interface LeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  fetchLeaderboard: (period: "daily" | "weekly" | "monthly") => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchLeaderboard: async (period) => {
    set({ isLoading: true, error: null });
    try {
      const data = await commissionService.getLeaderboard(period);
      set({ entries: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
