import client from "../client";

export interface SupplierOrder {
  id: string;
  poNumber: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: string;
}

export interface InventoryAlert {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  minThreshold: number;
}

export const supplierPortalService = {
  // GET /api/supplier-portal/orders
  getSupplierOrders: async () => {
    const response = await client.get<SupplierOrder[]>("/supplier-portal/orders");
    return response.data;
  },

  // PATCH /api/supplier-portal/orders/:id/status
  updateOrderStatus: async (id: string, status: SupplierOrder["status"]) => {
    const response = await client.patch(`/supplier-portal/orders/${id}/status`, { status });
    return response.data;
  },

  // GET /api/supplier-portal/inventory-alerts
  getInventoryAlerts: async () => {
    const response = await client.get<InventoryAlert[]>("/supplier-portal/inventory-alerts");
    return response.data;
  },
};
