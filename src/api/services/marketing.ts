import client from "../client";

export interface Campaign {
  _id: string;
  name: string;
  type: "email" | "sms" | "whatsapp";
  targetGroup: string;
  content: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  scheduledAt?: string;
  sentAt?: string;
  stats: {
    delivered: number;
    opened: number;
    clicked: number;
  };
}

export interface MarketingTrigger {
  _id: string;
  event: "welcome" | "abandoned_cart" | "birthday" | "post_purchase";
  channel: "email" | "sms" | "whatsapp";
  templateId: string;
  isEnabled: boolean;
}

export const marketingService = {
  // GET /api/marketing/campaigns
  getCampaigns: async () => {
    const response = await client.get<Campaign[]>("/marketing/campaigns");
    return response.data;
  },

  // POST /api/marketing/campaigns
  createCampaign: async (data: Partial<Campaign>) => {
    const response = await client.post<Campaign>("/marketing/campaigns", data);
    return response.data;
  },

  // GET /api/marketing/triggers
  getTriggers: async () => {
    const response = await client.get<MarketingTrigger[]>("/marketing/triggers");
    return response.data;
  },

  // PATCH /api/marketing/triggers/:id
  updateTrigger: async (id: string, data: Partial<MarketingTrigger>) => {
    const response = await client.patch<MarketingTrigger>(`/marketing/triggers/${id}`, data);
    return response.data;
  },
};

/**
 * Backend Stubs Required:
 * GET /api/marketing/campaigns - List campaigns
 * POST /api/marketing/campaigns - Create campaign
 * GET /api/marketing/triggers - List automated triggers
 * PATCH /api/marketing/triggers/:id - Toggle or update trigger
 */
