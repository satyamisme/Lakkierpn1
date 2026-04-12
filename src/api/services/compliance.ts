import client from "../client";

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface ZReport {
  id: string;
  date: string;
  totalSales: number;
  totalTax: number;
  cashInDrawer: number;
  cardPayments: number;
  discrepancy: number;
  status: "reconciled" | "pending";
}

export const complianceService = {
  // GET /api/compliance/logs
  getAuditLogs: async (params?: any) => {
    const response = await client.get<AuditLog[]>("/compliance/logs", { params });
    return response.data;
  },

  // GET /api/compliance/tax-export
  exportTaxCompliance: async (startDate: string, endDate: string) => {
    const response = await client.get("/compliance/tax-export", {
      params: { startDate, endDate },
      responseType: "blob",
    });
    return response.data;
  },

  // POST /api/compliance/zreport
  generateZReport: async (data: any) => {
    const response = await client.post<ZReport>(`/compliance/zreport`, data);
    return response.data;
  },
};
