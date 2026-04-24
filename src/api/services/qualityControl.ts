import client from "../client";

export interface Inspection {
  id: string;
  type: "incoming" | "outgoing" | "repair";
  referenceId: string; // PO ID or Repair ID
  checklist: {
    item: string;
    passed: boolean;
    notes?: string;
  }[];
  result: "pass" | "fail" | "conditional";
  inspectorId: string;
  createdAt: string;
}

export const qualityControlService = {
  // POST /api/quality-control
  createInspection: async (data: Partial<Inspection>) => {
    const response = await client.post<Inspection>("/quality-control", data);
    return response.data;
  },

  // GET /api/quality-control
  getInspections: async (params?: any) => {
    const response = await client.get<Inspection[]>("/quality-control", { params });
    return response.data;
  },

  // PUT /api/quality-control/:id
  updateInspectionResult: async (id: string, result: Inspection["result"], notes?: string) => {
    const response = await client.put<Inspection>(`/quality-control/${id}`, { result, notes });
    return response.data;
  },
};
