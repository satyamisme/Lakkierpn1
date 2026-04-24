import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  DollarSign, 
  Wallet, 
  Receipt, 
  TrendingDown, 
  TrendingUp, 
  PieChart, 
  ArrowRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Calendar,
  Lock,
  ChevronRight,
  Users
} from 'lucide-react';
import { toast } from "sonner";
import axios from "axios";

interface Expense {
  _id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const FinanceDashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
        // Mocking finance data for now
        setExpenses([
            { _id: 'EXP-001', category: 'Logistics', amount: 45.000, description: 'Mandoob fuel & parking', status: 'approved', date: new Date().toISOString() },
            { _id: 'EXP-002', category: 'Maintenance', amount: 120.000, description: 'AC Repair - Avenues Branch', status: 'pending', date: new Date().toISOString() },
            { _id: 'EXP-003', category: 'Supplies', amount: 15.500, description: 'Cleaning materials', status: 'approved', date: new Date().toISOString() },
        ]);
    } catch (error) {
        toast.error("Failed to load financial matrix");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Capital Matrix</h1>
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
             Expense Orchestration & Payroll Settlements (ID 193)
           </p>
        </div>
        <div className="flex gap-4">
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                <FileText size={18} /> Financial Reports
            </button>
            <button className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-white/5">
                <Plus size={18} /> Log Disbursement
            </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] space-y-8 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 text-primary">Operational Burn</p>
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-5xl font-black font-mono tracking-tighter">1,240</h2>
                            <span className="text-xl font-black text-white/20 uppercase tracking-widest">KD</span>
                        </div>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                <ArrowUpRight size={12} /> 12% Risk
                            </div>
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Total shift expenses vs Rev</p>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <TrendingDown size={80} />
                    </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] space-y-8 relative overflow-hidden group">
                    <div className="relative z-10 text-right">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 text-green-500">Net Profit Target</p>
                        <div className="flex items-baseline justify-end gap-3 text-white">
                            <h2 className="text-5xl font-black font-mono tracking-tighter">8,442</h2>
                            <span className="text-xl font-black text-white/20 uppercase tracking-widest">KD</span>
                        </div>
                        <div className="mt-8 flex items-center justify-end gap-4">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest text-right leading-none">Projected 30d yield</p>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                <ArrowUpRight size={12} /> +4% Growth
                            </div>
                        </div>
                    </div>
                    <div className="absolute left-0 bottom-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <TrendingUp size={80} />
                    </div>
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-[4rem] overflow-hidden">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                   <h3 className="text-2xl font-serif italic text-white/80">Disbursement Stream</h3>
                   <div className="flex gap-4">
                        <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Audit Mode</button>
                        <button className="px-6 py-3 bg-primary text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Download VAT CSV</button>
                   </div>
                </div>

                <div className="divide-y divide-white/5">
                    {expenses.map(exp => (
                        <motion.div 
                            key={exp._id}
                            className="p-10 flex items-center justify-between group hover:bg-white/[0.01] transition-all"
                        >
                            <div className="flex items-center gap-10">
                                <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                                    <Receipt size={24} className="text-white/40 group-hover:text-primary" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-base font-black uppercase tracking-tight">{exp.description}</h4>
                                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                            exp.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            exp.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                            {exp.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest uppercase italic">
                                            <Wallet size={12} /> {exp.category} Allocation
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                            <Calendar size={12} /> {new Date(exp.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-right">
                                    <p className="text-xl font-black font-mono tracking-tighter text-white/80">{exp.amount.toFixed(3)}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">KD Disbursed</p>
                                </div>
                                <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-10">
            <div className="bg-foreground text-background rounded-[4rem] p-10 space-y-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-serif italic leading-none">Payroll<br/>Ecosystem</h3>
                    <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center">
                        <Users size={32} />
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="p-6 bg-black/5 rounded-[2rem] border border-black/5">
                        <p className="text-[9px] font-black uppercase text-black/40 tracking-widest mb-2">Next Payout</p>
                        <div className="flex items-baseline justify-between">
                            <p className="text-3xl font-black font-mono">14,280</p>
                            <span className="text-xs font-black uppercase italic tracking-tighter">Apr 30</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Base Salaries', value: '11,200 KD' },
                            { label: 'Commission Matrix', value: '2,840 KD' },
                            { label: 'Override Bonuses', value: '240 KD' }
                        ].map((p, i) => (
                            <div key={i} className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{p.label}</span>
                                <span className="text-[10px] font-mono font-black">{p.value}</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3">
                        Generate Payslips <Lock size={14} />
                    </button>
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] space-y-8">
                <div className="flex items-center gap-4 text-blue-500">
                    <PieChart size={24} />
                    <h4 className="text-lg font-serif italic text-white/80">Allocation Health</h4>
                </div>
                <div className="space-y-6">
                   {[
                       { label: 'Inventory Capex', p: 65 },
                       { label: 'Facility OpEx', p: 20 },
                       { label: 'Administrative', p: 15 }
                   ].map(all => (
                       <div key={all.label} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-white/40">{all.label}</span>
                                <span className="text-white">{all.p}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${all.p}%` }} />
                            </div>
                       </div>
                   ))}
                </div>
            </div>

            <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[3rem] flex items-center gap-6">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                    <DollarSign size={24} />
                </div>
                <div>
                    <p className="text-[11px] font-black uppercase tracking-tight text-white/80 leading-tight">Cash Sweep Pending</p>
                    <p className="text-[9px] text-amber-500/60 font-bold uppercase tracking-widest mt-1">2 Terminals have uncleared cash reserves &gt; 500 KD</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
