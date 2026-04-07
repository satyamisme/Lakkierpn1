import client from "../client";

export interface SyncSettings {
  shopifyEnabled: boolean;
  shopifyStoreUrl?: string;
  shopifyAccessToken?: string;
  wooEnabled: boolean;
  wooStoreUrl?: string;
  wooConsumerKey?: string;
  wooConsumerSecret?: string;
  syncInventory: boolean;
  syncOrders: boolean;
}

export interface BopisOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
  }[];
  status: "pending" | "ready_for_pickup" | "picked_up" | "cancelled";
  createdAt: string;
}

export const omnichannelService = {
  // GET /api/omnichannel/settings
  getSyncSettings: async () => {
    const response = await client.get<SyncSettings>("/omnichannel/settings");
    return response.data;
  },

  // PATCH /api/omnichannel/settings
  updateSyncSettings: async (settings: Partial<SyncSettings>) => {
    const response = await client.patch<SyncSettings>("/omnichannel/settings", settings);
    return response.data;
  },

  // GET /api/omnichannel/bopis-orders
  getBopisOrders: async () => {
    const response = await client.get<BopisOrder[]>("/omnichannel/bopis-orders");
    return response.data;
  },

  // PATCH /api/omnichannel/bopis-orders/:id/status
  updateBopisStatus: async (id: string, status: BopisOrder["status"]) => {
    const response = await client.patch<BopisOrder>(`/omnichannel/bopis-orders/${id}/status`, { status });
    return response.data;
  },

  // GET /api/omnichannel/endless-aisle
  getEndlessAisleProducts: async (query: string) => {
    const response = await client.get<any[]>("/omnichannel/endless-aisle", { params: { query } });
    return response.data;
  },
};
