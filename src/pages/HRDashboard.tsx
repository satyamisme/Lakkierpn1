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
  Briefcase,
  ArrowUpRight
} from 'lucide-react';
import { Gate } from '../components/PermissionGuard';
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-serif italic tracking-tight text-foreground">HR & Staff Hub</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Attendance, Payroll & Performance (ID 188)</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <button 
            onClick={fetchData}
            className="p-4 bg-muted border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all active:scale-95"
          >
            <RefreshCcw className="w-6 h-6" />
          </button>
          <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
            Staff Directory
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm h-full">
            <h3 className="text-xl font-serif italic mb-8">Attendance Terminal</h3>
            <Gate id={188}>
              <ClockInButton onSuccess={fetchData} />
            </Gate>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-serif italic">Performance Leaderboard</h3>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live Ranking</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {performance.map((item, index) => (
                <motion.div 
                  key={item.userId}
                  whileHover={{ y: -4 }}
                  className="p-8 bg-muted/30 border border-border rounded-[2rem] relative overflow-hidden group hover:border-primary/30 transition-all"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-6xl font-black italic">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center text-primary shadow-sm">
                      <User size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest leading-tight">{item.name}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Technician / Sales</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sales Count</span>
                      <span className="text-sm font-black font-mono">{item.salesCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avg Ticket</span>
                      <span className="text-sm font-black font-mono">{item.avgTicketValue.toFixed(3)} KD</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Repair Rate</span>
                      <span className="text-sm font-black font-mono text-green-500">{item.repairCompletionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif italic">Payroll Engine</h3>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ID 197</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Staff Member</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Comm.</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payroll.map((item) => (
                  <tr key={item.userId} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                          <User size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs font-bold">{item.baseSalary.toFixed(3)}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs font-bold text-green-500">+{item.totalCommission.toFixed(3)}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-black text-primary">{item.totalPayable.toFixed(3)} KD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif italic">Staff Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">8 Online</span>
            </div>
          </div>
          <div className="space-y-4">
            {performance.map((item) => (
              <div key={item.userId} className="flex items-center justify-between p-6 bg-muted/30 border border-border rounded-3xl group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground shadow-sm">
                      <User size={20} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest leading-tight">{item.name}</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Active • Salmiya Branch</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Daily Sales</p>
                    <p className="text-sm font-black font-mono">{item.salesCount}</p>
                  </div>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors"><ArrowUpRight size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
