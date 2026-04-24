import React from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Cpu, 
  Activity, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Layers,
  Search,
  Box,
  TrendingUp
} from 'lucide-react';

export const DataLake = () => {
  const telemetry = [
    { source: 'POS-01', event: 'Sale Processed', type: 'Transactional', latency: '4ms' },
    { source: 'GSX-API', event: 'Model Sync', type: 'Integration', latency: '442ms' },
    { source: 'Auth-Node', event: 'JWT Refresh', type: 'Security', latency: '12ms' },
    { source: 'Inventory', event: 'Stock Deduction', type: 'Consistency', latency: '8ms' },
  ];

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight leading-none">Intelligence Vault</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">High-Resolution Data Lake & Event Streams (ID 12)</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-4 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all">
             Audit Schema
           </button>
           <button className="px-10 py-5 bg-primary text-black rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
             <Zap size={20} /> Re-index Vectors
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Real-time Telemetry */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="surface-container p-10 rounded-[3rem] border border-white/5 bg-black/20">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-2xl font-black uppercase tracking-tighter">Live Telemetry</h3>
                 <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[8px] font-black uppercase">
                    <Activity size={12} /> Streaming Active
                 </div>
              </div>

              <div className="space-y-3">
                 {telemetry.map((t, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-primary/20 transition-all font-mono">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20">
                           <Box size={16} />
                        </div>
                        <div>
                           <p className="text-xs font-black text-white/80">{t.source}</p>
                           <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">{t.event}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                         <div className="text-right">
                            <p className="text-[8px] text-white/20 uppercase tracking-widest mb-1">Vector Type</p>
                            <p className="text-xs font-black text-primary">{t.type}</p>
                         </div>
                         <div className="text-right min-w-[80px]">
                            <p className="text-[8px] text-white/20 uppercase tracking-widest mb-1">Latency</p>
                            <p className="text-xs font-black text-white/60">{t.latency}</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div className="surface-container p-10 rounded-[3rem] border border-white/5 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-widest">Query Performance</h3>
                    <TrendingUp size={20} className="text-green-500" />
                 </div>
                 <div className="h-24 flex items-end gap-1">
                    {[40, 70, 45, 90, 65, 80, 50, 40, 60, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t-sm group relative" style={{ height: `${h}%` }}>
                         <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-40 transition-opacity" />
                      </div>
                    ))}
                 </div>
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest text-center mt-4">Last 60 Minutes Aggregate</p>
              </div>

              <div className="surface-container p-10 rounded-[3rem] border border-white/5 space-y-8">
                 <h3 className="text-lg font-black uppercase tracking-widest">Data Consistency</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Replication Lag</span>
                       <span className="text-xs font-black font-mono">0.02ms</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Redundancy Factor</span>
                       <span className="text-xs font-black font-mono text-green-500">3x (Ideal)</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cold Storage Sync</span>
                       <span className="text-xs font-black font-mono">99.9%</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Intelligence Actions */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="surface-container p-10 rounded-[3rem] border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent">
              <h3 className="text-2xl font-serif italic mb-6">Semantic Search</h3>
              <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-widest mb-8 leading-relaxed">
                Connect to the Lakki Neural Engine for cross-matrix semantic relationship mapping.
              </p>
              <div className="relative mb-6">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                 <input placeholder="Ask Intelligence..." className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:border-indigo-500 outline-none transition-all" />
              </div>
              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-600/20">
                 Execute Deep Query
              </button>
           </div>

           <div className="surface-container p-10 rounded-[3rem] border border-white/5 space-y-8">
              <h3 className="text-lg font-black uppercase tracking-widest mb-4">Storage Metrics</h3>
              <div className="flex flex-col items-center">
                 <div className="w-32 h-32 rounded-full border-[10px] border-white/5 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-[10px] border-primary border-r-transparent rotate-45" />
                    <p className="font-mono font-black text-2xl tracking-tighter">1.2 TB</p>
                 </div>
                 <div className="w-full mt-8 space-y-4">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
                       <span>Compressed Index</span>
                       <span className="text-white/60">842 GB</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
                       <span>Raw Binary Events</span>
                       <span className="text-white/60">358 GB</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] flex items-center gap-6">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                 <ShieldCheck size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">DRP Protocol Active</p>
                 <p className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest mt-1 italic">PITR Restore point created 4m ago</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DataLake;
