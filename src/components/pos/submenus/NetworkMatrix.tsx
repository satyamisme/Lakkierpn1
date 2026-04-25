import React, { useState } from "react";
import { Wifi, Zap, Activity, ShieldCheck, RefreshCw, Database, Terminal, AlertTriangle, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export const NetworkMatrix: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const stats = [
    { label: 'Latency Node', value: '14ms', trend: 'STABLE', icon: Zap, color: 'text-emerald-500' },
    { label: 'Cloud Buffer', value: '0 Qrd', trend: 'NOMINAL', icon: Database, color: 'text-primary' },
    { label: 'SLA Uptime', value: '99.98%', trend: 'OPTIMAL', icon: Activity, color: 'text-emerald-500' },
    { label: 'Encryption', value: 'AES-256', trend: 'ACTIVE', icon: ShieldCheck, color: 'text-sky-500' }
  ];

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif italic text-white leading-tight">Network Matrix</h2>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Elastic Sync & Node Connectivity</p>
            <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-black text-amber-500 uppercase tracking-widest">Simulation Mode</div>
          </div>
        </div>
        <button 
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
           <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
           Force Global Synapse
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
         {stats.map((stat, i) => (
           <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6 group hover:bg-white/[0.05] transition-all">
              <div className={`p-4 bg-white/5 rounded-2xl w-fit ${stat.color} border border-white/5 shadow-inner group-hover:scale-110 transition-transform`}>
                 <stat.icon size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                 <div className="flex items-end justify-between">
                    <h4 className="text-3xl font-black text-white font-mono leading-none">{stat.value}</h4>
                    <span className={`text-[8px] font-black ${stat.color} uppercase tracking-widest mb-1`}>{stat.trend}</span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-12 gap-10 flex-1 min-h-0">
         <div className="col-span-8 bg-black/20 border border-white/5 rounded-[3rem] p-10 flex flex-col font-mono text-emerald-500 overflow-hidden relative">
            <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 opacity-60 text-[10px]">
               <p>[SYS] Initiating Matrix Handshake...</p>
               <p>[NET] Authentication Protocol 0x112 Verified</p>
               <p>[DB] Opening Stream to Global_Obsidian_Archive</p>
               <p>[SYNC] Pulling Delta Manifest (18 SKUs Updated)</p>
               <p>[SEC] Heartbeat Pulse Stable (2000ms Interval)</p>
               <p>[NET] Local Buffer Clean (0 Sales Pending)</p>
               <p className="text-primary-foreground animate-pulse">_ Awaiting operator input or scheduled heartbeat...</p>
            </div>
            
            <div className="absolute top-10 right-10 flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-widest">Live Terminal Log</span>
            </div>
         </div>

         <div className="col-span-4 flex flex-col gap-6">
            <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex-1 flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/10 mb-2">
                  <Terminal size={32} />
               </div>
               <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Operational Readiness</h4>
               <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-relaxed px-6">Hardware handshake successful. All local nodes responding to ping.</p>
            </div>

            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center gap-5">
               <AlertCircle size={24} className="text-amber-500" />
               <div>
                  <p className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Latency Optimization</p>
                  <p className="text-[9px] font-black text-white/40 uppercase leading-snug">Redirecting pulse through Node-B for better throughput.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
