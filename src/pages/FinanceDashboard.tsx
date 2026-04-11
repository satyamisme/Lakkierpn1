import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity, 
  Loader2, 
  RefreshCcw, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Building,
  CreditCard
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Gate } from '../components/PermissionGuard';
import { ExpenseForm } from '../components/finance/ExpenseForm';

interface PnLData {
  totalSales: number;
  totalCosts: number;
  totalExpenses: number;
  totalCommission: number;
  netProfit: number;
  breakdown: {
    salesCount: number;
    repairsCount: number;
    expensesCount: number;
  };
}

interface CashFlowData {
  cashInDrawer: number;
  bankBalance: number;
  storeCredit: number;
  totalLiquidity: number;
}

export const FinanceDashboard: React.FC = () => {
  const [pnl, setPnl] = useState<PnLData | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pnlRes, cfRes] = await Promise.all([
        fetch('/api/finance/pnl', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/finance/cash-flow', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);

      if (pnlRes.ok && cfRes.ok) {
        setPnl(await pnlRes.json());
        setCashFlow(await cfRes.json());
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

  const chartData = pnl ? [
    { name: 'Revenue', value: pnl.totalSales, color: '#10b981' },
    { name: 'Costs', value: pnl.totalCosts, color: '#f59e0b' },
    { name: 'Expenses', value: pnl.totalExpenses, color: '#ef4444' },
    { name: 'Commission', value: pnl.totalCommission, color: '#6366f1' },
    { name: 'Net Profit', value: pnl.netProfit, color: '#3b82f6' }
  ] : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Calculating Financials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-serif italic tracking-tight text-foreground">Finance Terminal</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Real-time P&L and Cash Flow (ID 101)</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <button 
            onClick={fetchData}
            className="p-4 bg-muted border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all active:scale-95"
          >
            <RefreshCcw className="w-6 h-6" />
          </button>
          <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
            Generate Audit Log
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest border border-border p-8 rounded-[2.5rem] shadow-sm group hover:border-green-500/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-muted rounded-2xl text-green-500"><TrendingUp size={24} /></div>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                  <ArrowUpRight size={12} /> 12.5%
                </span>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Net Profit</p>
              <h2 className={`text-3xl font-mono font-black ${pnl?.netProfit! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pnl?.netProfit.toFixed(3)} <span className="text-sm">KD</span>
              </h2>
            </div>

            <div className="bg-surface-container-lowest border border-border p-8 rounded-[2.5rem] shadow-sm group hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-muted rounded-2xl text-primary"><Wallet size={24} /></div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Ready for Sweep</span>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Cash in Drawer</p>
              <h2 className="text-3xl font-mono font-black text-primary">
                {cashFlow?.cashInDrawer.toFixed(3)} <span className="text-sm">KD</span>
              </h2>
            </div>

            <div className="bg-surface-container-lowest border border-border p-8 rounded-[2.5rem] shadow-sm group hover:border-indigo-500/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-muted rounded-2xl text-indigo-500"><Building size={24} /></div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Settled</span>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Bank Balance</p>
              <h2 className="text-3xl font-mono font-black text-indigo-600">
                {cashFlow?.bankBalance.toFixed(3)} <span className="text-sm">KD</span>
              </h2>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-[3rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-serif italic">Profit & Loss Breakdown</h3>
              <div className="flex gap-2">
                {['Daily', 'Weekly', 'Monthly'].map(t => (
                  <button key={t} className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-border hover:bg-muted transition-all">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#999' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#999' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm">
            <h3 className="text-xl font-serif italic mb-8">Expense Entry</h3>
            <Gate id={193}>
              <ExpenseForm onSuccess={fetchData} />
            </Gate>
          </div>

          <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm">
            <h3 className="text-xl font-serif italic mb-8">Operational KPIs</h3>
            <div className="space-y-6">
              {[
                { label: 'Sales Volume', value: pnl?.breakdown.salesCount, icon: DollarSign, color: 'text-green-500' },
                { label: 'Repair Throughput', value: pnl?.breakdown.repairsCount, icon: RefreshCcw, color: 'text-indigo-500' },
                { label: 'Expense Frequency', value: pnl?.breakdown.expensesCount, icon: TrendingDown, color: 'text-red-500' }
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-6 bg-muted/30 border border-border rounded-3xl group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-card border border-border rounded-2xl ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-mono font-black">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
