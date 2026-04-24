import { create } from "zustand";
import { hardwareService, HardwareStatus } from "../api/services/hardware";
import { toast } from "sonner";

interface HardwareSettings {
  defaultPrinterType: 'thermal' | 'a4';
  preferredThermalPrinter: string;
  preferredA4Printer: string;
  scannerMode: 'hid' | 'serial';
  cameraEnabled: boolean;
  autoPrintReceipts: boolean;
}

interface HardwareState {
  status: HardwareStatus | null;
  settings: HardwareSettings;
  isLoading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  updateSettings: (settings: Partial<HardwareSettings>) => void;
  testPrinter: (id: string, type: 'thermal' | 'a4') => Promise<void>;
  testScanner: (id: string) => Promise<void>;
  openCashDrawer: (id: string) => Promise<void>;
}

export const useHardwareStore = create<HardwareState>((set) => ({
  status: null,
  settings: {
    defaultPrinterType: 'thermal',
    preferredThermalPrinter: 'USB-THERMAL-80mm',
    preferredA4Printer: 'NETWORK-LASER-OFFICE',
    scannerMode: 'hid',
    cameraEnabled: true,
    autoPrintReceipts: false,
  },
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

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
    toast.success("Hardware configuration synchronized.");
  },

  testPrinter: async (id: string, type: 'thermal' | 'a4') => {
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
