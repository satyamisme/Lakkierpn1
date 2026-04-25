import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCcw, 
  Activity,
  Server,
  Terminal,
  Cpu,
  Layers,
  Search,
  Lock
} from 'lucide-react';
import { getPendingSales, syncPendingSales } from "../services/offlineQueue";
import { toast } from "sonner";

interface NodeStatus {
  id: string;
  name: string;
  status: 'online' | 'degraded' | 'offline';
  latency: number;
  lastSync: string;
  pendingTxns: number;
  region: string;
}

export const POSSync: React.FC = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchPending = async () => {
      const sales = await getPendingSales();
      setPendingCount(sales.length);
    };
    fetchPending();
    const interval = setInterval(fetchPending, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncPendingSales();
      const sales = await getPendingSales();
      setPendingCount(sales.length);
      if (sales.length === 0) {
        toast.success("Synchronized: All pending records uploaded to HQ.");
      } else {
        toast.error(`Partial Sync: ${sales.length} items still pending. Check connection.`);
      }
    } catch (err) {
      toast.error("Sync Protocol Failure: Network handshake interrupted.");
    } finally {
      setIsSyncing(false);
    }
  };

  const [nodes, setNodes] = useState<NodeStatus[]>([
    { id: 'NODE-AVN', name: 'Avenues branch Edge', status: 'online', latency: 42, lastSync: new Date().toISOString(), pendingTxns: 0, region: 'Kuwait City' },
    { id: 'NODE-MAR', name: 'Marina Mall Node', status: 'degraded', latency: 380, lastSync: new Date().toISOString(), pendingTxns: 12, region: 'Salmiya' },
    { id: 'NODE-MQR', name: 'Headquarters Core', status: 'online', latency: 12, lastSync: new Date().toISOString(), pendingTxns: 0, region: 'Shuwaikh' },
    { id: 'NODE-ALH', name: 'Al-Kout Station', status: 'offline', latency: 0, lastSync: '24m ago', pendingTxns: 84, region: 'Fahaheel' },
  ]);

  const [globalUptime, setGlobalUptime] = useState(99.98);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'degraded': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'offline': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-white/20 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Network Matrix</h1>
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
             Edge Synchronization & Real-time Node Health (ID 31)
           </p>
        </div>
        <div className="flex gap-4">
            <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-6">
                <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-white/20 tracking-widest leading-none">Global Resilience</p>
                    <p className="text-xl font-black font-mono tracking-tighter text-green-500 mt-1">{globalUptime}%</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <Activity className="text-primary animate-pulse" size={24} />
            </div>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="px-10 py-5 bg-white text-black rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
            >
                {isSyncing ? <RefreshCcw className="animate-spin" /> : 'Force Cluster Re-Sync'}
            </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] space-y-8 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-between">
                         <div className="space-y-4">
                            <h3 className="text-2xl font-serif italic text-white/80 leading-none">Database<br/>State</h3>
                            <div className="flex items-center gap-3">
                                <Database className="text-primary" size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Synchronized</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-black font-mono text-white/40 tracking-tighter">REPLICA LAG</p>
                            <p className="text-3xl font-black font-mono text-white/80">0.02ms</p>
                         </div>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                        <Database size={100} />
                    </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] space-y-8 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center justify-between">
                         <div className="space-y-4">
                            <h3 className="text-2xl font-serif italic text-white/80 leading-none">Security<br/>Handshake</h3>
                            <div className="flex items-center gap-3">
                                <Lock className="text-green-500" size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Encrypted AES-256</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-black font-mono text-white/40 tracking-tighter">CERT HEALTH</p>
                            <p className="text-3xl font-black font-mono text-white/80">100%</p>
                         </div>
                    </div>
                    <div className="absolute top-0 left-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                        <ShieldCheck size={100} />
                    </div>
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-[4rem] overflow-hidden">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                   <div className="flex items-center gap-6">
                        <Server size={24} className="text-white/20" />
                        <h3 className="text-2xl font-serif italic text-white/80">Cluster Nodes</h3>
                   </div>
                   <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl">
                      <Search className="ml-4 text-white/20" size={16} />
                      <input 
                        placeholder="SEARCH NODES..." 
                        className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest px-4 w-48 text-white placeholder:text-white/10"
                      />
                   </div>
                </div>

                <div className="divide-y divide-white/5">
                    {nodes.map(node => (
                        <motion.div 
                            key={node.id}
                            className="p-10 flex items-center justify-between group hover:bg-white/[0.01] transition-all"
                        >
                            <div className="flex items-center gap-10">
                                <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                                    <Terminal size={24} className="text-white/40 group-hover:text-primary" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-lg font-black uppercase tracking-tight">{node.name}</h4>
                                        <span className={`px-4 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border flex items-center gap-2 ${getStatusColor(node.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-current`} />
                                            {node.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                            <Zap size={12} /> {node.latency > 0 ? `${node.latency}ms Latency` : 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                            <Layers size={12} /> {node.pendingTxns} Txns Queued
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-right">
                                    <p className="text-sm font-black font-mono tracking-tighter text-white/60">SYNCED {node.latency === 0 ? node.lastSync : 'MOMENTS AGO'}</p>
                                    <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-1">{node.region} Node</p>
                                </div>
                                <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                                    <RefreshCcw size={18} className="text-white/40 group-hover:text-white" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-10">
            <div className="bg-primary text-black rounded-[4rem] p-10 space-y-12">
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-serif italic text-black">Offline<br/>Buffer</h3>
                    <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center">
                        <WifiOff size={32} />
                    </div>
                </div>
                
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-black">Queue Capacity</span>
                             <span className="text-xs font-black text-black">12%</span>
                        </div>
                        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                             <div className="h-full bg-black w-[12%]" />
                        </div>
                    </div>

                    <div className="p-8 bg-black/5 border border-black/5 rounded-[2.5rem] space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-black">Pending Offsite records</p>
                        <h4 className="text-5xl font-black font-mono tracking-tighter">{pendingCount}</h4>
                    </div>

                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 leading-relaxed font-bold text-black border-l-2 border-black/20 pl-4">
                        Automatic synchronization will trigger once Al-Kout node re-establishes a stable handshake with HQ Core.
                    </p>
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] space-y-8 overflow-hidden relative group">
                <div className="flex items-center gap-4 text-blue-500 relative z-10">
                    <Cpu size={24} />
                    <h4 className="text-lg font-serif italic text-white/80">Edge Computing</h4>
                </div>
                <div className="space-y-4 relative z-10">
                   {[
                       { label: 'Compute Load', v: '14%' },
                       { label: 'Thermal Health', v: '42°C' },
                       { label: 'Memory Buffer', v: '8.2GB free' }
                   ].map((edge, i) => (
                       <div key={i} className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{edge.label}</span>
                            <span className="text-xs font-black font-mono text-white/80">{edge.v}</span>
                       </div>
                   ))}
                </div>
                <div className="absolute bottom-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                    <Wifi size={100} />
                </div>
            </div>

            <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[3rem] flex items-center gap-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <p className="text-[11px] font-black uppercase tracking-tight text-white/80 leading-tight">Critical Isolation</p>
                    <p className="text-[9px] text-red-500/60 font-bold uppercase tracking-widest mt-1">Salmiya store is operating in limited-offline mode.</p>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default POSSync;
