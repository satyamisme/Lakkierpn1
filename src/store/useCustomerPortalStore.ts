import { create } from "zustand";
import { customerPortalService, CustomerOrder, CustomerRepair } from "../api/services/customerPortal";

interface CustomerPortalState {
  orders: CustomerOrder[];
  repairStatus: CustomerRepair | null;
  loyaltyPoints: number;
  isLoading: boolean;
  error: string | null;
  fetchOrders: (customerId: string) => Promise<void>;
  fetchRepairStatus: (ticketNumber: string) => Promise<void>;
  fetchLoyaltyPoints: (customerId: string) => Promise<void>;
}

export const useCustomerPortalStore = create<CustomerPortalState>((set) => ({
  orders: [],
  repairStatus: null,
  loyaltyPoints: 0,
  isLoading: false,
  error: null,

  fetchOrders: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await customerPortalService.getCustomerOrders(customerId);
      set({ orders: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchRepairStatus: async (ticketNumber: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await customerPortalService.getRepairStatus(ticketNumber);
      set({ repairStatus: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchLoyaltyPoints: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await customerPortalService.getLoyaltyPoints(customerId);
      set({ loyaltyPoints: data.points, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
