import client from "../client";

export interface ReturnRequest {
  _id: string;
  orderId: string;
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    reason: string;
    condition: "new" | "used" | "damaged";
  }[];
  refundAmount: number;
  refundMethod: "cash" | "card" | "store_credit";
  status: "pending" | "approved" | "rejected" | "completed";
  rmaNumber: string;
  reason: string;
  createdAt: string;
}

export const returnsService = {
  // GET /api/returns
  getAll: async () => {
    const response = await client.get<ReturnRequest[]>("/returns");
    return response.data;
  },

  // POST /api/returns
  create: async (data: Partial<ReturnRequest>) => {
    const response = await client.post<ReturnRequest>("/returns", data);
    return response.data;
  },

  // PATCH /api/returns/:id/status
  updateStatus: async (id: string, status: ReturnRequest["status"], notes?: string) => {
    const response = await client.patch<ReturnRequest>(`/returns/${id}/status`, { status, notes });
    return response.data;
  },
};

/**
 * Backend Stubs Required:
 * GET /api/returns - List all returns/RMAs
 * POST /api/returns - Initiate return { orderId, items, refundMethod }
 * PATCH /api/returns/:id/status - Approve/Reject return { status, notes }
 */
