import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ClipboardCheck, 
  Search, 
  Plus, 
  ArrowRight, 
  AlertTriangle,
  Package,
  History,
  CheckCircle2,
  XCircle,
  Zap,
  Filter
} from 'lucide-react';
import axios from "axios";
import { toast } from "sonner";

interface ReconciliationSession {
  _id: string;
  storeId: { name: string };
  status: 'pending' | 'resolving' | 'completed';
  itemsCount: number;
  discrepancyCount: number;
  createdAt: string;
}

export const StockRecon: React.FC = () => {
  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      // Mocking session data
      setSessions([
        { _id: 'REC-001', storeId: { name: 'Avenues Branch' }, status: 'resolving', itemsCount: 442, discrepancyCount: 12, createdAt: new Date().toISOString() },
        { _id: 'REC-002', storeId: { name: 'Main Distribution' }, status: 'completed', itemsCount: 1250, discrepancyCount: 0, createdAt: new Date().toISOString() }
      ]);
    } catch (error) {
      toast.error("Failed to load recon sessions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Variance Reconciliation</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
            Discrepancy Resolution & Audit Trail Synchronization (ID 148)
          </p>
        </div>
        <div className="flex items-center gap-4">
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                <History size={18} /> Historic Audits
            </button>
            <button className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-white/5">
                <Plus size={18} /> New Recon Session
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
             <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                    <Filter className="text-white/20" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Audit Sessions</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <Zap className="text-blue-500 animate-pulse" size={14} />
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Real-time Sync Active</span>
                </div>
             </div>

             <div className="space-y-4">
                {sessions.map(session => (
                    <motion.div 
                        key={session._id}
                        whileHover={{ x: 10 }}
                        className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:border-white/20 transition-all"
                    >
                        <div className="flex items-center gap-8">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-primary transition-all">
                                <ClipboardCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">{session.storeId.name}</h3>
                                <p className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest mt-1">ID: {session._id} • {session.itemsCount} SKUs Audited</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-12">
                            <div className="text-center">
                                <p className={`text-xl font-black font-mono tracking-tighter ${session.discrepancyCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {session.discrepancyCount > 0 ? `+${session.discrepancyCount}` : 'BALANCED'}
                                </p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-1">Variance Status</p>
                            </div>

                            <button className="px-8 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                Review Matrix
                            </button>
                        </div>
                    </motion.div>
                ))}
             </div>
           </div>
        </div>

        <aside className="lg:col-span-4 space-y-10">
            <div className="bg-foreground text-background rounded-[4rem] p-10 space-y-12">
                <h3 className="text-3xl font-serif italic">Global Health</h3>
                
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">System Accuracy</span>
                            <span className="text-xs font-black">99.82%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-[99.8%]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-2">Shrinkage %</p>
                            <p className="text-2xl font-black font-mono tracking-tighter">0.18</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-2">Valuation Gap</p>
                            <p className="text-2xl font-black font-mono tracking-tighter">0.4k</p>
                        </div>
                    </div>
                </div>

                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 leading-relaxed font-bold">
                    Resolution of these variances will generate general ledger adjustments to synchronize physical assets with financial equity.
                </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-10 rounded-[3rem] space-y-6">
                <div className="flex items-center gap-4 text-primary">
                    <AlertTriangle size={24} />
                    <h4 className="text-lg font-serif italic">Pending Resolutions</h4>
                </div>
                <div className="space-y-3">
                   <div className="p-4 bg-black/40 rounded-2xl flex items-center justify-between border border-white/5 hover:border-primary/30 transition-all cursor-pointer">
                      <span className="text-[10px] font-black uppercase tracking-widest">iPhone 15 Pro (-2)</span>
                      <ArrowRight size={14} className="text-primary" />
                   </div>
                   <div className="p-4 bg-black/40 rounded-2xl flex items-center justify-between border border-white/5 hover:border-primary/30 transition-all cursor-pointer">
                      <span className="text-[10px] font-black uppercase tracking-widest">AirPods Gen 3 (+1)</span>
                      <ArrowRight size={14} className="text-primary" />
                   </div>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default StockRecon;
