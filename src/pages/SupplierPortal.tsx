import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  Search, 
  Plus, 
  ArrowRight, 
  Star, 
  Truck, 
  DollarSign, 
  Clock,
  Briefcase,
  Globe,
  CheckCircle2,
  MoreVertical,
  Activity
} from 'lucide-react';
import axios from "axios";
import { toast } from "sonner";

interface Supplier {
  _id: string;
  name: string;
  contactName: string;
  email: string;
  category: string;
  performanceScore: number;
  activePOs: number;
  totalVolume: number;
  status: 'active' | 'suspended' | 'probation';
}

export const SupplierPortal: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('/api/suppliers');
      setSuppliers(res.data);
    } catch (error) {
      toast.error("Failed to load supplier ecosystem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Supplier Ecosystem</h1>
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
             Vendor Performance & Supply Chain Orchestration (ID 132)
           </p>
        </div>
        <button className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-white/5">
           <Plus size={18} /> Onboard New Vendor
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="space-y-6">
            <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] space-y-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-serif italic">Global Health</h3>
                    <Activity className="text-primary" size={20} />
                </div>
                <div className="space-y-8">
                    <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Network Resilience</p>
                        <div className="flex items-baseline gap-2">
                             <p className="text-4xl font-black font-mono tracking-tighter text-primary">94.2%</p>
                             <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Optimal</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                             <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Lead Time</p>
                             <p className="text-xl font-black font-mono tracking-tighter">4.2d</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                             <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Quality %</p>
                             <p className="text-xl font-black font-mono tracking-tighter">99.1</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-10 rounded-[3rem] space-y-8">
                <h4 className="text-lg font-serif italic text-primary">Preferred Accounts</h4>
                <div className="space-y-4">
                    {suppliers.filter(s => (s.performanceScore || 0) >= 90).slice(0, 3).map(s => (
                        <div key={s._id} className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
                            <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                            <Star className="text-primary fill-primary" size={14} />
                        </div>
                    ))}
                    {suppliers.length === 0 && <p className="text-[10px] text-white/20 uppercase font-black tracking-widest text-center py-4">No top-tier vendors</p>}
                </div>
            </div>
        </aside>

        <div className="lg:col-span-3 space-y-8">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[4rem] overflow-hidden">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-6 flex-1 max-w-xl">
                        <Search className="text-white/20" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Ecosystem Matrix..." 
                            className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest w-full placeholder:text-white/10 text-white"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Export Matrix</button>
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {suppliers.length === 0 ? (
                        <div className="p-20 text-center opacity-20 flex flex-col items-center gap-4">
                            <Building2 size={64} />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Matrix Initializing...</p>
                        </div>
                    ) : suppliers.map(supplier => (
                        <motion.div 
                            key={supplier._id}
                            className="p-10 flex items-center justify-between group hover:bg-white/[0.01] transition-all"
                        >
                            <div className="flex items-center gap-10">
                                <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                                    <Building2 size={24} className="text-white/40 group-hover:text-primary" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-lg font-black uppercase tracking-tight">{supplier.name}</h4>
                                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                            supplier.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            supplier.status === 'suspended' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                            {supplier.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest uppercase italic">
                                            <Globe size={12} /> {supplier.category || 'Regional'} Vendor
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                            <Briefcase size={12} /> {supplier.activePOs || 0} Open Manifests
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-center">
                                    <p className="text-xl font-black font-mono tracking-tighter text-white/80">{(supplier.performanceScore || 0).toFixed(0)}%</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Reliability Index</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                                        <MoreVertical size={18} />
                                    </button>
                                    <button className="px-8 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3">
                                        PROVISION <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] space-y-6">
                    <div className="flex items-center gap-4 text-blue-500">
                        <DollarSign size={20} />
                        <h4 className="text-base font-black uppercase tracking-widest">Credit Terms</h4>
                    </div>
                    <p className="text-xs font-bold text-white/40 leading-relaxed uppercase">
                        Current aggregate credit utilization across the supplier network is at 64.2%. 2 Vendors offer dynamic early settlement discounts.
                    </p>
                 </div>
                 <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] space-y-6">
                    <div className="flex items-center gap-4 text-amber-500">
                        <Truck size={20} />
                        <h4 className="text-base font-black uppercase tracking-widest">Logistics Health</h4>
                    </div>
                    <p className="text-xs font-bold text-white/40 leading-relaxed uppercase">
                        Real-time tracking is enabled for 14 active shipments. Average carrier latency has decreased by 0.8 days this quarter.
                    </p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierPortal;
