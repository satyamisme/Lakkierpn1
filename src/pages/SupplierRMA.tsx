import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  RotateCcw, 
  Truck, 
  Search, 
  Plus, 
  ArrowRight, 
  AlertCircle,
  Package,
  FileText,
  Clock,
  CheckCircle2,
  X,
  History
} from 'lucide-react';
import axios from "axios";
import { toast } from "sonner";

interface RMA {
  _id: string;
  supplierId: { name: string };
  items: { productId: any; quantity: number; reason: string; status: string }[];
  status: 'draft' | 'shipped' | 'credited' | 'replaced' | 'closed';
  trackingNumber?: string;
  createdAt: string;
}

export const SupplierRMA: React.FC = () => {
  const [rmas, setRmas] = useState<RMA[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  useEffect(() => {
    fetchRMAs();
  }, []);

  const fetchRMAs = async () => {
    try {
      // Mocking for now as we don't have the endpoint yet
      // const res = await axios.get('/api/inventory/supplier-rma');
      // setRmas(res.data);
      setRmas([
        { _id: 'RMA-001', supplierId: { name: 'Apple Inc' }, items: [{ productId: '65f1a2b3c4d5e6f7a8b9c0d5', quantity: 2, reason: 'Manufacturing Defect', status: 'pending' }], status: 'shipped', trackingNumber: 'DHL-99221', createdAt: new Date().toISOString() },
        { _id: 'RMA-002', supplierId: { name: 'Samsung Middle East' }, items: [{ productId: '65f1a2b3c4d5e6f7a8b9c0d6', quantity: 5, reason: 'Broken Screen', status: 'pending' }], status: 'draft', createdAt: new Date().toISOString() }
      ]);
    } catch (error) {
      toast.error("Failed to load RMA records");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shipped': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'credited': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'replaced': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'draft': return 'bg-white/10 text-white/40 border-white/10';
      default: return 'bg-white/5 text-white/20 border-white/5';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Vendor RMA Matrix</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
            Supplier Warranty & Faulty Goods Orchestration (ID 144)
          </p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-white/5"
        >
          <Plus size={18} /> Initiate Warranty Claim
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="space-y-6">
          {[
            { label: 'Outbound Claims', value: rmas.filter(r => r.status === 'shipped').length, icon: Truck, color: 'text-blue-500' },
            { label: 'Awaiting Credit', value: rmas.filter(r => r.status === 'shipped').length, icon: RotateCcw, color: 'text-amber-500' },
            { label: 'Total Claims', value: rmas.length, icon: History, color: 'text-white/40' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#0A0A0A] border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between">
              <div>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black font-mono tracking-tighter">{stat.value}</h3>
              </div>
              <div className={`p-4 bg-white/5 rounded-2xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}

          <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] space-y-4">
            <div className="flex items-center gap-3 text-red-500">
               <AlertCircle size={20} />
               <p className="text-[9px] font-black uppercase tracking-widest">SLA Alert</p>
            </div>
            <p className="text-[10px] font-bold text-red-500/60 leading-relaxed uppercase">
                3 Claims have exceeded the 14-day vendor response threshold. Escalation required.
            </p>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded-[2rem] max-w-xl">
             {['all', 'draft', 'shipped', 'credited', 'closed'].map(tab => (
               <button key={tab} className="flex-1 py-3 rounded-[1.5rem] text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                 {tab}
               </button>
             ))}
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden">
            <div className="grid grid-cols-5 gap-6 p-8 border-b border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/20">
                <div className="col-span-2">Claim Identification</div>
                <div>Matrix Status</div>
                <div>Last Updated</div>
                <div className="text-right px-4">Action</div>
            </div>

            <div className="divide-y divide-white/5">
                {rmas.map(rma => (
                  <motion.div 
                    key={rma._id}
                    className="grid grid-cols-5 gap-6 p-10 items-center hover:bg-white/[0.01] transition-all group"
                  >
                    <div className="col-span-2 flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                            <Package size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-tight">{rma.supplierId.name}</h4>
                            <p className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">{rma._id} • {rma.items.length} Units</p>
                        </div>
                    </div>

                    <div>
                        <span className={`px-4 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${getStatusColor(rma.status)}`}>
                            {rma.status}
                        </span>
                    </div>

                    <p className="text-xs font-mono font-black text-white/40">{new Date(rma.createdAt).toLocaleDateString()}</p>

                    <div className="flex justify-end pr-4">
                        <button className="px-6 py-3 bg-white/5 hover:bg-primary hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                            Manage Claim
                        </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierRMA;
