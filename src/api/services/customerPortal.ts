import client from "../client";

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface CustomerRepair {
  id: string;
  ticketNumber: string;
  device: string;
  status: string;
  estimatedCompletion?: string;
}

export const customerPortalService = {
  // GET /api/customer-portal/orders
  getCustomerOrders: async (customerId: string) => {
    const response = await client.get<CustomerOrder[]>(`/customer-portal/orders`, { params: { customerId } });
    return response.data;
  },

  // GET /api/customer-portal/repair-status
  getRepairStatus: async (ticketNumber: string) => {
    const response = await client.get<CustomerRepair>(`/customer-portal/repair-status`, { params: { ticketNumber } });
    return response.data;
  },

  // GET /api/customer-portal/loyalty-points
  getLoyaltyPoints: async (customerId: string) => {
    const response = await client.get<{ points: number }>(`/customer-portal/loyalty-points`, { params: { customerId } });
    return response.data;
  },

  // POST /api/customer-portal/reviews
  submitReview: async (data: { orderId?: string; repairId?: string; rating: number; comment: string }) => {
    const response = await client.post(`/customer-portal/reviews`, data);
    return response.data;
  },
};
