import client from "../client";

export interface LeaderboardEntry {
  staffId: string;
  name: string;
  salesCount: number;
  salesValue: number;
  repairsCount: number;
  commissionEarned: number;
  rank: number;
}

export interface CommissionReport {
  staffId: string;
  name: string;
  period: string;
  baseSalary: number;
  salesCommission: number;
  repairCommission: number;
  totalPayable: number;
  details: {
    type: "sale" | "repair";
    amount: number;
    commission: number;
    date: string;
  }[];
}

export const commissionService = {
  // GET /api/commission/leaderboard
  getLeaderboard: async (period: "daily" | "weekly" | "monthly") => {
    const response = await client.get<LeaderboardEntry[]>("/commission/leaderboard", { params: { period } });
    return response.data;
  },

  // GET /api/commission/report/:staffId
  getCommissionReport: async (staffId: string, period: string) => {
    const response = await client.get<CommissionReport>(`/commission/report/${staffId}`, { params: { period } });
    return response.data;
  },

  // POST /api/commission/recalculate
  recalculateCommission: async (period: string) => {
    const response = await client.post("/commission/recalculate", { period });
    return response.data;
  },
};
