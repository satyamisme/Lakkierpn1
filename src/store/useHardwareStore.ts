import { create } from "zustand";
import { hardwareService, HardwareStatus } from "../api/services/hardware";

interface HardwareState {
  status: HardwareStatus | null;
  isLoading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  testPrinter: (id: string) => Promise<void>;
  testScanner: (id: string) => Promise<void>;
  openCashDrawer: (id: string) => Promise<void>;
}

export const useHardwareStore = create<HardwareState>((set) => ({
  status: null,
  isLoading: false,
  error: null,

  fetchStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await hardwareService.getHardwareStatus();
      set({ status: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  testPrinter: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await hardwareService.testPrinter(id);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  testScanner: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await hardwareService.testScanner(id);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  openCashDrawer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await hardwareService.openCashDrawer(id);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
