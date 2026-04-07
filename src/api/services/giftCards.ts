import client from "../client";

export interface GiftCard {
  _id: string;
  code: string;
  balance: number;
  initialAmount: number;
  customerId?: string;
  expiryDate?: string;
  status: "active" | "used" | "expired" | "cancelled";
  createdAt: string;
}

export const giftCardsService = {
  // GET /api/gift-cards
  getAll: async () => {
    const response = await client.get<GiftCard[]>("/gift-cards");
    return response.data;
  },

  // GET /api/gift-cards/:id
  getById: async (id: string) => {
    const response = await client.get<GiftCard>(`/gift-cards/${id}`);
    return response.data;
  },

  // POST /api/gift-cards
  create: async (data: Partial<GiftCard>) => {
    const response = await client.post<GiftCard>("/gift-cards", data);
    return response.data;
  },

  // PATCH /api/gift-cards/:id
  update: async (id: string, data: Partial<GiftCard>) => {
    const response = await client.patch<GiftCard>(`/gift-cards/${id}`, data);
    return response.data;
  },

  // POST /api/gift-cards/validate
  validate: async (code: string) => {
    const response = await client.post<GiftCard>("/gift-cards/validate", { code });
    return response.data;
  },
};

/**
 * Backend Stubs Required:
 * GET /api/gift-cards - List all gift cards
 * GET /api/gift-cards/:id - Get single gift card
 * POST /api/gift-cards - Create new gift card { code, initialAmount, expiryDate, customerId }
 * PATCH /api/gift-cards/:id - Update gift card status or balance
 * POST /api/gift-cards/validate - Validate code and return card details { code }
 */
