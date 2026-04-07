import client from "../client";

export interface HardwareStatus {
  printer: "online" | "offline";
  scanner: "online" | "offline";
  cashDrawer: "online" | "offline";
}

export const hardwareService = {
  // POST /api/hardware/test-printer
  testPrinter: async (printerId: string) => {
    const response = await client.post(`/hardware/test-printer`, { printerId });
    return response.data;
  },

  // POST /api/hardware/test-scanner
  testScanner: async (scannerId: string) => {
    const response = await client.post(`/hardware/test-scanner`, { scannerId });
    return response.data;
  },

  // POST /api/hardware/open-cash-drawer
  openCashDrawer: async (drawerId: string) => {
    const response = await client.post(`/hardware/open-cash-drawer`, { drawerId });
    return response.data;
  },

  // GET /api/hardware/status
  getHardwareStatus: async () => {
    const response = await client.get<HardwareStatus>("/hardware/status");
    return response.data;
  },
};
