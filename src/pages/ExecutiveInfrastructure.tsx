import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Zap, 
  Activity, 
  Layers, 
  ShieldCheck, 
  Server,
  ArrowRight,
  RefreshCw,
  Cpu,
  Network
} from 'lucide-react';

export const ExecutiveInfrastructure: React.FC<{ type: 'routing' | 'coalescing' }> = ({ type }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => setIsOptimizing(false), 2000);
  };

  const isRouting = type === 'routing';

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">
            {isRouting ? 'Read-Replica Routing' : 'Request Coalescing'}
          </h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">
            {isRouting ? 'Cockpit query distribution matrix (ID 342)' : 'Batch identical API requests (ID 343)'}
          </p>
        </div>
        <button 
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isOptimizing ? 'Optimizing Matrix...' : 'Optimize Performance'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-surface-container-lowest border border-border rounded-[4rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-serif italic">Live Node Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Synchronized</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Primary Node (Write)', load: '12%', latency: '4ms', status: 'Healthy' },
                { name: 'Replica Alpha (Read)', load: '45%', latency: '12ms', status: 'Healthy' },
                { name: 'Replica Beta (Read)', load: '38%', latency: '14ms', status: 'Healthy' },
                { name: 'Replica Gamma (Read)', load: '8%', latency: '18ms', status: 'Standby' },
              ].map((node) => (
                <div key={node.name} className="p-6 bg-muted/20 border border-border rounded-[2rem] group hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Server size={18} className="text-primary" />
                      <span className="text-xs font-black uppercase tracking-tighter">{node.name}</span>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${node.status === 'Healthy' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                      {node.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Load</p>
                      <p className="text-xl font-mono font-black">{node.load}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Latency</p>
                      <p className="text-xl font-mono font-black text-primary">{node.latency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-[4rem] p-10 shadow-sm">
            <h3 className="text-3xl font-serif italic mb-10">Efficiency Metrics</h3>
            <div className="space-y-10">
              {[
                { label: 'Cache Hit Rate', value: '94.2%', desc: 'Percentage of requests served from memory' },
                { label: 'Coalescing Ratio', value: '3.4:1', desc: 'Average requests batched into single call' },
                { label: 'Network Overhead', value: '2.1ms', desc: 'Average serialization time' },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tighter">{metric.label}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{metric.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-mono font-black text-primary">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-black p-10 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-serif italic text-white mb-4">Infrastructure Health</h3>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8">Global Node Integrity</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Uptime</span>
                  <span className="text-xs font-mono font-black text-green-500">99.999%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '99.999%' }}
                    className="h-full bg-green-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <Cpu className="w-4 h-4 text-blue-500 mb-2" />
                    <p className="text-[8px] text-white/40 uppercase tracking-widest mb-1">CPU</p>
                    <p className="text-sm font-mono font-black text-white">14%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <Network className="w-4 h-4 text-purple-500 mb-2" />
                    <p className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Net</p>
                    <p className="text-sm font-mono font-black text-white">2.4Gbps</p>
                  </div>
                </div>
              </div>
            </div>
            <Activity className="absolute -bottom-10 -right-10 w-48 h-48 text-white opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" />
          </div>

          <div className="bg-surface-container-lowest border border-border p-10 rounded-[4rem] shadow-sm">
            <h3 className="text-2xl font-serif italic mb-8">Configuration Matrix</h3>
            <div className="space-y-4">
              {[
                'Enable Request Batching',
                'Dynamic Replica Scaling',
                'Intelligent Query Routing',
                'Edge Cache Propagation',
                'Heuristic Load Balancing'
              ].map((config) => (
                <div key={config} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border">
                  <span className="text-[10px] font-black uppercase tracking-widest">{config}</span>
                  <div className="w-10 h-5 bg-primary rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
