import client from "../client";

export interface BulkJob {
  id: string;
  type: "price_update" | "stock_adjustment" | "label_print" | "customer_import" | "product_import" | "scanner";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  result?: any;
  createdAt: string;
}

export const bulkService = {
  // POST /api/bulk/price-update
  bulkPriceUpdate: async (data: { productId: string; newPrice: number }[]) => {
    const response = await client.post<BulkJob>("/bulk/price-update", { data });
    return response.data;
  },

  // POST /api/bulk/stock-adjustment
  bulkStockAdjustment: async (data: { productId: string; adjustment: number; reason: string }[]) => {
    const response = await client.post<BulkJob>("/bulk/stock-adjustment", { data });
    return response.data;
  },

  // POST /api/bulk/label-print
  bulkLabelPrint: async (productIds: string[]) => {
    const response = await client.post("/bulk/label-print", { productIds }, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'labels.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // POST /api/bulk/customer-import
  bulkCustomerImport: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await client.post<BulkJob>("/bulk/customer-import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // POST /api/bulk/product-import
  bulkProductImport: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await client.post<BulkJob>("/bulk/product-import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // POST /api/bulk/scanner
  bulkScanner: async (barcodes: string[]) => {
    const response = await client.post<BulkJob>("/bulk/scanner", { barcodes });
    return response.data;
  },

  // GET /api/bulk/jobs/:id
  getJobStatus: async (id: string) => {
    const response = await client.get<BulkJob>(`/bulk/jobs/${id}`);
    return response.data;
  },
};
