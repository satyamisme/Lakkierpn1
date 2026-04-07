import { create } from "zustand";
import { bulkService, BulkJob } from "../api/services/bulk";

interface BulkState {
  currentJob: BulkJob | null;
  isLoading: boolean;
  error: string | null;
  startJob: (job: BulkJob) => void;
  fetchJobStatus: (id: string) => Promise<void>;
  clearJob: () => void;
}

export const useBulkStore = create<BulkState>((set) => ({
  currentJob: null,
  isLoading: false,
  error: null,

  startJob: (job) => set({ currentJob: job, error: null }),

  fetchJobStatus: async (id: string) => {
    set({ isLoading: true });
    try {
      const job = await bulkService.getJobStatus(id);
      set({ currentJob: job, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  clearJob: () => set({ currentJob: null, error: null }),
}));
