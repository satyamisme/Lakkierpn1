import client from "../client";

export interface ImeiEvent {
  id: string;
  type: "purchase" | "sale" | "repair" | "transfer" | "return";
  date: string;
  location: string;
  user: string;
  details: string;
}

export const imeiTimelineService = {
  // GET /api/imei/:imei/history
  getImeiHistory: async (imei: string) => {
    const response = await client.get<ImeiEvent[]>(`/imei/${imei}/history`);
    return response.data;
  },
};
