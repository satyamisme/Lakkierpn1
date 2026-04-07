import client from "../client";

export interface PickingList {
  id: string;
  orderId: string;
  items: {
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    location: string;
    picked: boolean;
  }[];
  status: "pending" | "in_progress" | "completed";
}

export interface PackingList {
  id: string;
  orderId: string;
  items: {
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    packed: boolean;
  }[];
  status: "pending" | "in_progress" | "completed";
}

export const warehouseService = {
  // GET /api/warehouse/picking
  getPickingLists: async () => {
    const response = await client.get<PickingList[]>("/warehouse/picking");
    return response.data;
  },

  // POST /api/warehouse/picking/:id/complete
  completePicking: async (id: string) => {
    const response = await client.post(`/warehouse/picking/${id}/complete`);
    return response.data;
  },

  // GET /api/warehouse/packing
  getPackingLists: async () => {
    const response = await client.get<PackingList[]>("/warehouse/packing");
    return response.data;
  },

  // POST /api/warehouse/packing/:id/complete
  completePacking: async (id: string) => {
    const response = await client.post(`/warehouse/packing/${id}/complete`);
    return response.data;
  },

  // POST /api/warehouse/receive-po
  receivePurchaseOrder: async (poId: string, items: { productId: string; quantity: number }[]) => {
    const response = await client.post("/warehouse/receive-po", { poId, items });
    return response.data;
  },
};
