import { create } from "zustand";
import { omnichannelService, SyncSettings, BopisOrder } from "../api/services/omnichannel";

interface OmnichannelState {
  settings: SyncSettings | null;
  bopisOrders: BopisOrder[];
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SyncSettings>) => Promise<void>;
  fetchBopisOrders: () => Promise<void>;
  updateBopisStatus: (id: string, status: BopisOrder["status"]) => Promise<void>;
}

export const useOmnichannelStore = create<OmnichannelState>((set) => ({
  settings: null,
  bopisOrders: [],
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await omnichannelService.getSyncSettings();
      set({ settings: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateSettings: async (settings: Partial<SyncSettings>) => {
    set({ isLoading: true, error: null });
    try {
      const data = await omnichannelService.updateSyncSettings(settings);
      set({ settings: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchBopisOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await omnichannelService.getBopisOrders();
      set({ bopisOrders: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateBopisStatus: async (id: string, status: BopisOrder["status"]) => {
    set({ isLoading: true, error: null });
    try {
      await omnichannelService.updateBopisStatus(id, status);
      set((state) => ({
        bopisOrders: state.bopisOrders.map((o) => (o.id === id ? { ...o, status } : o)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
