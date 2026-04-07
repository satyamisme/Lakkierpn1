import { create } from "zustand";
import { supplierPortalService, SupplierOrder, InventoryAlert } from "../api/services/supplierPortal";

interface SupplierPortalState {
  orders: SupplierOrder[];
  alerts: InventoryAlert[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  updateOrderStatus: (id: string, status: SupplierOrder["status"]) => Promise<void>;
}

export const useSupplierPortalStore = create<SupplierPortalState>((set) => ({
  orders: [],
  alerts: [],
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await supplierPortalService.getSupplierOrders();
      set({ orders: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await supplierPortalService.getInventoryAlerts();
      set({ alerts: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateOrderStatus: async (id: string, status: SupplierOrder["status"]) => {
    set({ isLoading: true, error: null });
    try {
      await supplierPortalService.updateOrderStatus(id, status);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
