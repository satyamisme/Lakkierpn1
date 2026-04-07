import { create } from "zustand";
import { complianceService, AuditLog, ZReport } from "../api/services/compliance";

interface ComplianceState {
  auditLogs: AuditLog[];
  currentZReport: ZReport | null;
  isLoading: boolean;
  error: string | null;
  fetchAuditLogs: (params?: any) => Promise<void>;
  fetchZReport: (date: string) => Promise<void>;
}

export const useComplianceStore = create<ComplianceState>((set) => ({
  auditLogs: [],
  currentZReport: null,
  isLoading: false,
  error: null,

  fetchAuditLogs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await complianceService.getAuditLogs(params);
      set({ auditLogs: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchZReport: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const data = await complianceService.getZReport(date);
      set({ currentZReport: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
