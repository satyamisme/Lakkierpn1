import React from "react";
import { CommissionReport } from "../components/organisms/CommissionReport";

const CommissionPage: React.FC = () => {
  const mockReport = {
    staffId: "mock-staff-id",
    name: "John Doe",
    period: "April 2026",
    baseSalary: 250.000,
    salesCommission: 45.500,
    repairCommission: 12.000,
    totalPayable: 307.500,
    details: [
      { date: new Date().toISOString(), type: 'sale' as const, amount: 345.000, commission: 17.250 },
      { date: new Date().toISOString(), type: 'repair' as const, amount: 45.000, commission: 4.500 },
    ]
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Commission Engine</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage staff commissions and performance payouts</p>
      </div>
      <CommissionReport report={mockReport} />
    </div>
  );
};

export default CommissionPage;
