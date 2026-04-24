import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, 
  Search, 
  Plus, 
  ArrowRight, 
  Calendar, 
  Clock, 
  DollarSign, 
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  History,
  FileText,
  User
} from 'lucide-react';
import { toast } from "sonner";

interface LayawayPlan {
  _id: string;
  customerId: { name: string; phone: string };
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  nextPaymentDate: string;
  itemsCount: number;
}

export const POSLayaway: React.FC = () => {
  const [plans, setPlans] = useState<LayawayPlan[]>([
    { _id: 'LAY-001', customerId: { name: 'Mishal Al-Saqr', phone: '+965 5544 3322' }, totalAmount: 450.000, paidAmount: 150.000, remainingAmount: 300.000, status: 'active', nextPaymentDate: '2026-05-15', itemsCount: 3 },
    { _id: 'LAY-002', customerId: { name: 'Eman Ahmed', phone: '+965 9988 7766' }, totalAmount: 85.000, paidAmount: 85.000, remainingAmount: 0.000, status: 'completed', nextPaymentDate: 'N/A', itemsCount: 1 },
    { _id: 'LAY-003', customerId: { name: 'Fahad Al-Kazi', phone: '+965 6677 8899' }, totalAmount: 320.000, paidAmount: 50.000, remainingAmount: 270.000, status: 'active', nextPaymentDate: '2026-05-01', itemsCount: 2 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'defaulted': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Layaway Matrix</h1>
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
             Installment Plans & Deferred Settlement Orchestration (ID 19)
           </p>
        </div>
        <div className="flex gap-4">
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                <FileText size={18} /> Plan Configuration
            </button>
            <button className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-white/5">
                <Plus size={18} /> New Layaway Instance
            </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                    { label: 'Active Receivables', value: '14.2k KD', icon: DollarSign, color: 'text-blue-500' },
                    { label: 'Collection Rate', value: '98.4%', icon: CheckCircle2, color: 'text-green-500' },
                    { label: 'Overdue Delta', value: '420 KD', icon: AlertCircle, color: 'text-red-500' }
                 ].map((stat, i) => (
                    <div key={i} className="bg-[#0A0A0A] border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-white/20 transition-all">
                        <div>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-black font-mono tracking-tighter">{stat.value}</h4>
                        </div>
                        <div className={`p-4 bg-white/5 rounded-2xl ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                 ))}
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-[4rem] overflow-hidden">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-6 flex-1 max-w-xl">
                        <Search className="text-white/20" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find plan by customer or ID..." 
                            className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest w-full placeholder:text-white/10 text-white"
                        />
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {plans.map(plan => (
                        <motion.div 
                            key={plan._id}
                            className="p-10 flex items-center justify-between group hover:bg-white/[0.01] transition-all"
                        >
                            <div className="flex items-center gap-10">
                                <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                                    <CreditCard size={24} className="text-white/40 group-hover:text-primary" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-base font-black uppercase tracking-tight">{plan.customerId.name}</h4>
                                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(plan.status)}`}>
                                            {plan.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                            <User size={12} /> {plan.customerId.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                            <Clock size={12} /> Next: {plan.nextPaymentDate}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-right">
                                    <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                                        <div 
                                            className="h-full bg-primary" 
                                            style={{ width: `${(plan.paidAmount / plan.totalAmount) * 100}%` }} 
                                        />
                                    </div>
                                    <p className="text-[10px] font-mono font-black text-white/80">
                                        {plan.paidAmount.toFixed(3)} / {plan.totalAmount.toFixed(3)} KD
                                    </p>
                                </div>
                                <button className="px-8 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                    POST PAYMENT
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-10">
            <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] space-y-10 relative overflow-hidden group">
                 <h3 className="text-2xl font-serif italic relative z-10 leading-tight">Payment<br/>Projection</h3>
                 <div className="space-y-6 relative z-10">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Upcoming 7 Days</p>
                        <p className="text-4xl font-black font-mono tracking-tighter text-primary">1,120.000</p>
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-2">{plans.filter(p => p.status === 'active').length} Active installments</p>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                    <Calendar size={120} />
                 </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-10 rounded-[3rem] space-y-8">
                <div className="flex items-center gap-4 text-primary">
                    <AlertCircle size={24} />
                    <h4 className="text-lg font-serif italic">Past Due Units</h4>
                </div>
                <div className="space-y-4">
                   <div className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-3 hover:border-red-500/30 transition-all cursor-pointer">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black uppercase text-white">Yousef Ali</span>
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">3D OVERDUE</span>
                        </div>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">45.000 KD Pending</p>
                   </div>
                </div>
            </div>

            <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[3rem] space-y-6">
                <div className="flex items-center gap-4 text-blue-500">
                    <History size={24} />
                    <h4 className="text-base font-black uppercase tracking-widest">Collection History</h4>
                </div>
                <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10">
                    View Ledger <ArrowRight size={14} />
                </button>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default POSLayaway;
