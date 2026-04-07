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
import { Gate } from '../components/Gate';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Finance Dashboard</h1>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">Real-time P&L and Cash Flow (ID 101, 102)</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-3 bg-card border border-border text-muted-foreground hover:text-primary transition-all active:scale-95"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Summary Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-card border border-border p-6 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={48} className="text-green-500" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Net Profit</p>
            <h2 className={`text-3xl font-black font-mono ${pnl?.netProfit! >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pnl?.netProfit.toFixed(3)} KD
            </h2>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1 text-green-500">
                <ArrowUpRight size={12} /> 12.5%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-card border border-border p-6 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet size={48} className="text-primary" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Cash in Drawer</p>
            <h2 className="text-3xl font-black font-mono text-primary">
              {cashFlow?.cashInDrawer.toFixed(3)} KD
            </h2>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Activity size={12} /> Ready for bank deposit
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-card border border-border p-6 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building size={48} className="text-indigo-500" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Bank Balance</p>
            <h2 className="text-3xl font-black font-mono text-indigo-500">
              {cashFlow?.bankBalance.toFixed(3)} KD
            </h2>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <CreditCard size={12} /> K-Net & Card Settlements
            </div>
          </motion.div>
        </div>

        {/* Expense Form */}
        <div className="lg:col-span-1">
          <Gate id={193}>
            <ExpenseForm onSuccess={fetchData} />
          </Gate>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* P&L Chart */}
        <Gate id={101}>
          <div className="bg-card border border-border p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <PieChart className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-black uppercase tracking-tighter italic">P&L Breakdown</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#666' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#666' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                    contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '0', color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Gate>

        {/* Stats & KPIs */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-8 shadow-sm h-full">
            <h3 className="text-lg font-black uppercase tracking-tighter italic mb-6 flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Operational KPIs
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Sales Volume', value: pnl?.breakdown.salesCount, icon: DollarSign, color: 'text-green-500' },
                { label: 'Repair Throughput', value: pnl?.breakdown.repairsCount, icon: RefreshCcw, color: 'text-indigo-500' },
                { label: 'Expense Frequency', value: pnl?.breakdown.expensesCount, icon: TrendingDown, color: 'text-red-500' }
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-4 bg-muted/30 border border-border">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 bg-card border border-border ${stat.color}`}>
                      <stat.icon size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <span className="text-xl font-black font-mono">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
