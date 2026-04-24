import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Camera, 
  History, 
  Download, 
  Search, 
  Calendar, 
  Database,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock
} from 'lucide-react';

export const StockSnapshot = () => {
  const snapshots = [
    { id: 'SNP-449', date: '2024-04-22', time: '08:00 AM', items: 14250, value: 142567.850, user: 'System', type: 'Daily' },
    { id: 'SNP-448', date: '2024-04-21', time: '08:00 AM', items: 14120, value: 141200.000, user: 'System', type: 'Daily' },
    { id: 'SNP-447', date: '2024-04-20', time: '11:30 PM', items: 14005, value: 140050.450, user: 'Ahmed Al-Sabah', type: 'Manual' },
  ];

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight leading-none">Point-in-Time Matrix</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Inventory Snapshots & Delta Analysis (ID 132)</p>
        </div>
        <button className="px-10 py-5 bg-primary text-black rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
          <Camera size={20} /> Capture Instant Snapshot
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="surface-container p-10 rounded-[3rem] border border-white/5 space-y-8 col-span-1">
          <h3 className="text-lg font-black uppercase tracking-widest">Snapshot Policy</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-white/5">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Automated Frequency</span>
              <span className="text-xs font-black uppercase text-primary">Every 24h</span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-white/5">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Retention Period</span>
              <span className="text-xs font-black uppercase tracking-tighter italic">90 Days (Vault Locked)</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Data Compression</span>
              <span className="text-xs font-black font-mono">LZW Active</span>
            </div>
          </div>
          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-4">
             <ShieldCheck className="text-blue-500" size={20} />
             <p className="text-[9px] font-black text-blue-500/80 uppercase tracking-widest leading-relaxed">
               Snapshots are cryptographically signed for financial auditing.
             </p>
          </div>
        </div>

        <div className="col-span-2 surface-container rounded-[3.5rem] border border-white/5 overflow-hidden">
          <div className="p-10 border-b border-white/5 bg-white/5 flex items-center justify-between">
             <h3 className="text-2xl font-black uppercase tracking-tighter italic">Historical Matrix</h3>
             <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input placeholder="Search Date..." className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all" />
             </div>
          </div>

          <div className="divide-y divide-white/5">
            {snapshots.map(snp => (
              <div key={snp.id} className="grid grid-cols-12 gap-6 p-8 items-center hover:bg-white/[0.02] transition-all group">
                 <div className="col-span-4 flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:bg-primary group-hover:text-black transition-all">
                       <Clock size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-black uppercase tracking-tight">{snp.date}</p>
                       <p className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-widest mt-1">{snp.time} • {snp.user}</p>
                    </div>
                 </div>
                 
                 <div className="col-span-2 text-center">
                    <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${snp.type === 'Daily' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                       {snp.type}
                    </span>
                 </div>

                 <div className="col-span-3">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">{snp.items} SKUs</p>
                    <p className="text-lg font-black font-mono tracking-tighter">{snp.value.toLocaleString()} <span className="text-[10px] opacity-40">KD</span></p>
                 </div>

                 <div className="col-span-3 flex justify-end pr-4 gap-3">
                    <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all">
                       <Download size={18} />
                    </button>
                    <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-primary transition-all">
                       Analyze Delta
                    </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-10 border-2 border-dashed border-white/5 rounded-[4rem] text-center space-y-6">
         <Database size={48} className="mx-auto text-white/5" />
         <div className="space-y-2">
            <h3 className="text-2xl font-serif italic text-white/20">Archived Vector Access</h3>
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">Connect to cold-storage for data older than 90 days</p>
         </div>
         <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all">
            Initiate Restore Protocol
         </button>
      </div>
    </div>
  );
};

export default StockSnapshot;
