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
  // POST /api/qc/inspections
  createInspection: async (data: Partial<Inspection>) => {
    const response = await client.post<Inspection>("/qc/inspections", data);
    return response.data;
  },

  // GET /api/qc/inspections
  getInspections: async (params?: any) => {
    const response = await client.get<Inspection[]>("/qc/inspections", { params });
    return response.data;
  },

  // PATCH /api/qc/inspections/:id
  updateInspectionResult: async (id: string, result: Inspection["result"], notes?: string) => {
    const response = await client.patch<Inspection>(`/qc/inspections/${id}`, { result, notes });
    return response.data;
  },
};
