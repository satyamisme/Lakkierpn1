import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Loader2, 
  RefreshCcw, 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  MapPin, 
  Calendar,
  Briefcase
} from 'lucide-react';
import { Gate } from '../components/Gate';
import { ClockInButton } from '../components/hr/ClockInButton';

interface PayrollItem {
  userId: string;
  name: string;
  baseSalary: number;
  totalCommission: number;
  penalties: number;
  totalPayable: number;
}

interface PerformanceItem {
  userId: string;
  name: string;
  salesCount: number;
  avgTicketValue: number;
  repairCompletionRate: number;
  totalSalesValue: number;
}

export const HRDashboard: React.FC = () => {
  const [payroll, setPayroll] = useState<PayrollItem[]>([]);
  const [performance, setPerformance] = useState<PerformanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [payrollRes, perfRes] = await Promise.all([
        fetch('/api/hr/payroll', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/hr/performance', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);

      if (payrollRes.ok && perfRes.ok) {
        setPayroll(await payrollRes.json());
        setPerformance(await perfRes.json());
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Calculating HR Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">HR & Staff Hub</h1>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">Attendance, Payroll & Performance (ID 188, 197, 198)</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-3 bg-card border border-border text-muted-foreground hover:text-primary transition-all active:scale-95"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Attendance Terminal */}
        <div className="lg:col-span-1">
          <Gate id={188}>
            <ClockInButton onSuccess={fetchData} />
          </Gate>
        </div>

        {/* Performance Leaderboard */}
        <div className="lg:col-span-3">
          <Gate id={198}>
            <div className="bg-card border border-border p-8 shadow-sm h-full">
              <h3 className="text-lg font-black uppercase tracking-tighter italic mb-6 flex items-center gap-2">
                <Trophy size={20} className="text-primary" />
                Performance Leaderboard
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {performance.map((item, index) => (
                  <motion.div 
                    key={item.userId}
                    whileHover={{ y: -4 }}
                    className="p-6 bg-muted/30 border border-border relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <span className="text-4xl font-black italic">#{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User size={20} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest leading-tight">{item.name}</h4>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Technician / Sales</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sales Count</span>
                        <span className="text-xs font-black font-mono">{item.salesCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Avg Ticket</span>
                        <span className="text-xs font-black font-mono">{item.avgTicketValue.toFixed(3)} KD</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Repair Rate</span>
                        <span className="text-xs font-black font-mono text-green-500">{item.repairCompletionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Gate>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payroll Table */}
        <Gate id={197}>
          <div className="bg-card border border-border p-8 shadow-sm">
            <h3 className="text-lg font-black uppercase tracking-tighter italic mb-6 flex items-center gap-2">
              <DollarSign size={20} className="text-primary" />
              Payroll Engine (ID 197)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Staff Member</th>
                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base Salary</th>
                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Commission</th>
                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((item) => (
                    <tr key={item.userId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User size={14} className="text-muted-foreground" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-tighter">{item.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-4 font-mono text-xs font-bold">{item.baseSalary.toFixed(3)}</td>
                      <td className="text-right py-4 font-mono text-xs font-bold text-green-500">+{item.totalCommission.toFixed(3)}</td>
                      <td className="text-right py-4 font-mono text-sm font-black text-primary">{item.totalPayable.toFixed(3)} KD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Gate>

        {/* Staff Directory / Status */}
        <div className="bg-card border border-border p-8 shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-tighter italic mb-6 flex items-center gap-2">
            <Users size={20} className="text-primary" />
            Staff Status
          </h3>
          <div className="space-y-4">
            {performance.map((item) => (
              <div key={item.userId} className="flex items-center justify-between p-4 bg-muted/30 border border-border">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                      <User size={18} className="text-muted-foreground" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest leading-tight">{item.name}</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Active Now</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Sales</p>
                    <p className="text-xs font-black font-mono">{item.salesCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Repairs</p>
                    <p className="text-xs font-black font-mono">12</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
