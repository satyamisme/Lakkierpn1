import client from "../client";

export interface CustomerGroup {
  _id: string;
  name: string;
  description: string;
  discountPercentage: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  minSpend?: number;
  memberCount: number;
}

export const customerGroupsService = {
  // GET /api/customer-groups
  getAll: async () => {
    const response = await client.get<CustomerGroup[]>("/customer-groups");
    return response.data;
  },

  // POST /api/customer-groups
  create: async (data: Partial<CustomerGroup>) => {
    const response = await client.post<CustomerGroup>("/customer-groups", data);
    return response.data;
  },

  // PATCH /api/customer-groups/:id
  update: async (id: string, data: Partial<CustomerGroup>) => {
    const response = await client.patch<CustomerGroup>(`/customer-groups/${id}`, data);
    return response.data;
  },

  // DELETE /api/customer-groups/:id
  delete: async (id: string) => {
    await client.delete(`/customer-groups/${id}`);
  },
};

/**
 * Backend Stubs Required:
 * GET /api/customer-groups - List all groups
 * POST /api/customer-groups - Create group { name, discountPercentage, tier, minSpend }
 * PATCH /api/customer-groups/:id - Update group
 * DELETE /api/customer-groups/:id - Delete group
 */
