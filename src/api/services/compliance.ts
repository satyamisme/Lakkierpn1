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
  // GET /api/compliance/audit-logs
  getAuditLogs: async (params?: any) => {
    const response = await client.get<AuditLog[]>("/compliance/audit-logs", { params });
    return response.data;
  },

  // GET /api/compliance/export-tax
  exportTaxCompliance: async (startDate: string, endDate: string) => {
    const response = await client.get("/compliance/export-tax", {
      params: { startDate, endDate },
      responseType: "blob",
    });
    return response.data;
  },

  // GET /api/compliance/z-report
  getZReport: async (date: string) => {
    const response = await client.get<ZReport>(`/compliance/z-report/${date}`);
    return response.data;
  },
};
