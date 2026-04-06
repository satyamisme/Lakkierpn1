import React from 'react';
import { motion } from 'motion/react';
import { Wallet, TrendingUp, TrendingDown, Receipt, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * ID 101: Cash Flow Matrix
 * ID 105: Expense Manager
 */
export const FinanceDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Revenue', value: '£42,500.00', change: '+12.5%', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Total Expenses', value: '£12,340.00', change: '-2.4%', icon: TrendingDown, color: 'text-red-500' },
    { label: 'Net Profit', value: '£30,160.00', change: '+18.2%', icon: DollarSign, color: 'text-primary' },
    { label: 'Cash in Hand', value: '£5,420.00', change: '+5.1%', icon: Wallet, color: 'text-blue-500' },
  ];

  const recentTransactions = [
    { id: 'TX-1001', type: 'Income', category: 'POS Sale', amount: '£120.00', date: '2026-04-05 14:20', status: 'Completed' },
    { id: 'TX-1002', type: 'Expense', category: 'Rent', amount: '£1,200.00', date: '2026-04-01 09:00', status: 'Completed' },
    { id: 'TX-1003', type: 'Income', category: 'Repair', amount: '£45.00', date: '2026-04-05 15:10', status: 'Pending' },
    { id: 'TX-1004', type: 'Expense', category: 'Inventory', amount: '£850.00', date: '2026-04-04 11:30', status: 'Completed' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Finance & Ledger</h1>
          <p className="text-muted-foreground text-xs font-mono">ID 101, 105 | REAL-TIME CASH FLOW MONITORING</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-none font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
          Add Expense
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon size={48} />
            </div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black font-mono tracking-tighter">{stat.value}</h3>
            <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${stat.color}`}>
              {stat.change.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {stat.change} vs last month
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Receipt size={14} className="text-primary" />
            Recent Ledger Entries
          </h2>
          <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="p-4 border-b border-border">ID</th>
                <th className="p-4 border-b border-border">Type</th>
                <th className="p-4 border-b border-border">Category</th>
                <th className="p-4 border-b border-border">Amount</th>
                <th className="p-4 border-b border-border">Date</th>
                <th className="p-4 border-b border-border">Status</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4 border-b border-border font-bold text-primary">{tx.id}</td>
                  <td className="p-4 border-b border-border">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      tx.type === 'Income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4 border-b border-border">{tx.category}</td>
                  <td className="p-4 border-b border-border font-bold">{tx.amount}</td>
                  <td className="p-4 border-b border-border text-muted-foreground">{tx.date}</td>
                  <td className="p-4 border-b border-border">
                    <span className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
