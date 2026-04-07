import { create } from "zustand";
import { qualityControlService, Inspection } from "../api/services/qualityControl";

interface QualityControlState {
  inspections: Inspection[];
  isLoading: boolean;
  error: string | null;
  fetchInspections: (params?: any) => Promise<void>;
  addInspection: (data: Partial<Inspection>) => Promise<void>;
  updateResult: (id: string, result: Inspection["result"], notes?: string) => Promise<void>;
}

export const useQualityControlStore = create<QualityControlState>((set) => ({
  inspections: [],
  isLoading: false,
  error: null,

  fetchInspections: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await qualityControlService.getInspections(params);
      set({ inspections: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addInspection: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newInspection = await qualityControlService.createInspection(data);
      set((state) => ({
        inspections: [newInspection, ...state.inspections],
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateResult: async (id, result, notes) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await qualityControlService.updateInspectionResult(id, result, notes);
      set((state) => ({
        inspections: state.inspections.map((i) => (i.id === id ? updated : i)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
