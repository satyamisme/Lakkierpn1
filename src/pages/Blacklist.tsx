import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  UserX, 
  Info, 
  AlertTriangle,
  History,
  Lock,
  ChevronRight,
  ShieldCheck,
  MoreVertical
} from 'lucide-react';
import { toast } from "sonner";

interface BlacklistEntry {
  _id: string;
  customerId?: string;
  name: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  addedBy: string;
  createdAt: string;
}

export const Blacklist: React.FC = () => {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEntries([
      { _id: 'BL-001', name: 'Unknown Fraudster', reason: 'Attempted chargeback fraud on iPhone 15 sale', severity: 'critical', addedBy: 'Admin Malik', createdAt: new Date().toISOString() },
      { _id: 'BL-002', name: 'Jassem Al-Kandari', reason: 'Repeated non-collection of BOPIS orders', severity: 'medium', addedBy: 'Manager Sara', createdAt: new Date().toISOString() },
    ]);
    setLoading(false);
  }, []);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-amber-500/20 text-amber-500 border-amber-500/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Security Blacklist</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
            Loss Prevention & Fraud Mitigation Matrix (ID 203)
          </p>
        </div>
        <button className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-red-500/20">
          <UserX size={18} /> Flag Intelligence Node
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="space-y-6">
            <div className="bg-red-600 text-white rounded-[3rem] p-10 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-500">
                    <ShieldAlert size={80} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-serif italic mb-2 leading-none">Risk Shield</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Global Terminal Enforcement</p>
                </div>
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Flags</span>
                         <span className="text-xl font-black font-mono">14</span>
                    </div>
                    <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Blocked attempts</span>
                         <span className="text-xl font-black font-mono">28</span>
                    </div>
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-[3.5rem] space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-3">
                    <Lock size={14} /> Security Protocol
                </h4>
                <div className="space-y-4">
                    {[
                        { label: 'Device ID Lock', status: 'Active' },
                        { label: 'IP Reputation', status: 'Shielded' },
                        { label: 'Pattern Detection', status: 'Analyzing' }
                    ].map(protocol => (
                        <div key={protocol.label} className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group cursor-pointer hover:border-white/20 transition-all">
                             <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{protocol.label}</span>
                             <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{protocol.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>

        <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-3xl">
                <div className="flex items-center gap-6 flex-1 px-4">
                    <Search className="text-white/20" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search security entries..." 
                        className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest w-full placeholder:text-white/10 text-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                        Filter Matrix
                    </button>
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-[4rem] overflow-hidden">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                   <h3 className="text-2xl font-serif italic">Restricted Entities</h3>
                   <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                      <History size={16} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Audit Sync Live</span>
                   </div>
                </div>

                <div className="divide-y divide-white/5">
                    {entries.map(entry => (
                        <motion.div 
                            key={entry._id}
                            className="p-10 flex items-center justify-between group hover:bg-white/[0.01] transition-all"
                        >
                            <div className="flex items-center gap-8">
                                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-inner transition-all group-hover:rotate-6 ${getSeverityStyles(entry.severity).split(' ')[0]} ${getSeverityStyles(entry.severity).split(' ')[1]}`}>
                                    <UserX size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-base font-black uppercase tracking-tight">{entry.name}</h4>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getSeverityStyles(entry.severity)}`}>
                                            {entry.severity} Path
                                        </span>
                                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{entry.reason}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-10">
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">Added By</p>
                                    <p className="text-xs font-black uppercase tracking-widest text-white/60">{entry.addedBy}</p>
                                </div>
                                <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            
            <div className="p-8 bg-white/5 border border-white/5 rounded-[3rem] flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-tight">Identity Verification Active</p>
                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Cross-referencing with Civil ID database v2.0</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest group">
                    View Logs <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Blacklist;
