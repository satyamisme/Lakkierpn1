import React, { useState, useEffect } from "react";
import { CommissionReport } from "../components/organisms/CommissionReport";
import axios from "axios";
import { Loader2 } from "lucide-react";

export const Commission: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        // In a real app we'd fetch specific staff info, for now getting transactions
        const res = await axios.get('/api/commission/transactions');
        const transactions = res.data;
        
        // Transform transactions into the report format expected by CommissionReport
        const details = transactions.map((t: any) => ({
          date: t.createdAt,
          type: t.referenceType === 'Sale' ? 'sale' : 'repair',
          amount: t.amount / 0.05, // Back-calculating base amount for display
          commission: t.amount
        }));

        const totalCommission = transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
        const salesComm = transactions.filter((t: any) => t.referenceType === 'Sale').reduce((sum: number, t: any) => sum + t.amount, 0);
        const repairComm = transactions.filter((t: any) => t.referenceType === 'Repair').reduce((sum: number, t: any) => sum + t.amount, 0);

        setReport({
          staffId: "Staff-001",
          name: "Manager Portal",
          period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          baseSalary: 250.000,
          salesCommission: salesComm,
          repairCommission: repairComm,
          totalPayable: 250.000 + totalCommission,
          details
        });
      } catch (error) {
        console.error("Failed to fetch commission data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Commission Engine</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage staff commissions and performance payouts</p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : report ? (
        <CommissionReport report={report} />
      ) : (
        <div className="text-center py-20 text-muted-foreground">No commission data found</div>
      )}
    </div>
  );
};
