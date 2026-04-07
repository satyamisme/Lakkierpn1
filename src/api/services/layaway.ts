import client from "../client";

export interface LayawayPlan {
  _id: string;
  orderId: string;
  customerId: string;
  totalAmount: number;
  depositAmount: number;
  remainingBalance: number;
  installments: {
    amount: number;
    dueDate: string;
    paidDate?: string;
    status: "pending" | "paid" | "overdue";
  }[];
  status: "active" | "completed" | "cancelled" | "defaulted";
  createdAt: string;
}

export const layawayService = {
  // GET /api/layaway
  getAll: async () => {
    const response = await client.get<LayawayPlan[]>("/layaway");
    return response.data;
  },

  // POST /api/layaway
  create: async (data: any) => {
    const response = await client.post<LayawayPlan>("/layaway", data);
    return response.data;
  },

  // POST /api/layaway/:id/payment
  addPayment: async (id: string, amount: number) => {
    const response = await client.post<LayawayPlan>(`/layaway/${id}/payment`, { amount });
    return response.data;
  },
};

/**
 * Backend Stubs Required:
 * GET /api/layaway - List all layaway plans
 * POST /api/layaway - Create new plan { orderId, customerId, totalAmount, depositAmount, installmentCount }
 * POST /api/layaway/:id/payment - Record a payment against a plan { amount }
 */
