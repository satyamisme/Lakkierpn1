import { create } from "zustand";
import { warehouseService, PickingList, PackingList } from "../api/services/warehouse";

interface WarehouseState {
  pickingLists: PickingList[];
  packingLists: PackingList[];
  isLoading: boolean;
  error: string | null;
  fetchPickingLists: () => Promise<void>;
  fetchPackingLists: () => Promise<void>;
  completePicking: (id: string) => Promise<void>;
  completePacking: (id: string) => Promise<void>;
}

export const useWarehouseStore = create<WarehouseState>((set) => ({
  pickingLists: [],
  packingLists: [],
  isLoading: false,
  error: null,

  fetchPickingLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await warehouseService.getPickingLists();
      set({ pickingLists: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchPackingLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await warehouseService.getPackingLists();
      set({ packingLists: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  completePicking: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await warehouseService.completePicking(id);
      set((state) => ({
        pickingLists: state.pickingLists.filter((list) => list.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  completePacking: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await warehouseService.completePacking(id);
      set((state) => ({
        packingLists: state.packingLists.filter((list) => list.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
