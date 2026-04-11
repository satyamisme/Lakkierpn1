import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  Database, 
  History, 
  Cpu, 
  Lock, 
  Globe, 
  RefreshCw,
  Server,
  Activity,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { FEATURES } from '../constants/features';

/**
 * ID 316: Enterprise Hub
 * Management of high-tier enterprise features 316-350.
 */
export const EnterpriseHub: React.FC = () => {
  const [activeConfig, setActiveConfig] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const enterpriseFeatures = FEATURES.filter(f => f.id >= 316 && f.id <= 350);

  const getIcon = (id: number) => {
    switch (id) {
      case 317: return <History className="w-6 h-6" />;
      case 319: return <Zap className="w-6 h-6" />;
      case 325: return <Globe className="w-6 h-6" />;
      case 334: return <Lock className="w-6 h-6" />;
      case 340: return <RefreshCw className="w-6 h-6" />;
      case 341: return <Database className="w-6 h-6" />;
      case 345: return <Cpu className="w-6 h-6" />;
      case 350: return <Server className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  const handleAction = (id: number) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setActiveConfig(null);
    }, 1500);
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="px-4 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] inline-block mb-4">
            Infrastructure Layer
          </div>
          <h1 className="text-6xl font-serif italic tracking-tight text-foreground leading-none">Enterprise Hub</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Core Governance & High-Tier Ops (ID 316)</p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-4 bg-surface-container border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all">Audit Logs</button>
          <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all">System Health</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {enterpriseFeatures.slice(0, 8).map((feature, i) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveConfig(feature.id)}
            className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm hover:shadow-2xl hover:border-indigo-500/50 transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className="w-14 h-14 bg-muted rounded-[1.5rem] flex items-center justify-center text-muted-foreground group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 mb-8">
              {getIcon(feature.id)}
            </div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-sm uppercase tracking-tighter">{feature.name}</h3>
              <span className="text-[9px] font-black text-indigo-500 opacity-40">ID {feature.id}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {feature.description}
            </p>
            <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Active</span>
              </div>
              <button className="text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:underline">Configure</button>
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all" />
          </motion.div>
        ))}
      </div>

      <div className="bg-muted/30 border border-border rounded-[4rem] p-12 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
        <div className="flex-1 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Security Advisory
          </div>
          <h2 className="text-5xl font-serif italic tracking-tight">Multi-Store Governance</h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            Your enterprise shell is currently managing 4 active nodes. All circuit breakers are closed, and nightly self-healing is scheduled for 03:00 AM. Audit vault integrity is 100%. All P2P mesh sync operations are within nominal latency bounds.
          </p>
          <div className="flex gap-4 pt-4">
            <button className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all">Download Audit Report</button>
            <button className="px-10 py-5 bg-card border border-border rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all">View Node Map</button>
          </div>
        </div>
        <div className="w-full lg:w-80 aspect-square bg-card border border-border rounded-[3.5rem] flex items-center justify-center relative overflow-hidden group shadow-2xl">
          <Activity className="w-32 h-32 text-indigo-500 opacity-20 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500/30" />
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {activeConfig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveConfig(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-card border border-border p-12 rounded-[4rem] shadow-2xl"
            >
              <button 
                onClick={() => setActiveConfig(null)}
                className="absolute top-8 right-8 p-3 hover:bg-muted rounded-2xl transition-colors"
              >
                <X size={24} />
              </button>

              <div className="w-20 h-20 bg-indigo-500/10 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-8">
                {getIcon(activeConfig)}
              </div>

              <h3 className="text-4xl font-serif italic mb-2">
                {FEATURES.find(f => f.id === activeConfig)?.name}
              </h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-8">
                Enterprise Configuration (ID {activeConfig})
              </p>

              <div className="space-y-8">
                <div className="p-6 bg-muted/30 border border-border rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">Last Sync</span>
                    <span className="text-[10px] font-mono font-black">2026-04-09 14:22:01</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Sensitivity Threshold</label>
                  <input type="range" className="w-full accent-indigo-600" />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setActiveConfig(null)}
                    className="flex-1 py-5 border border-border rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleAction(activeConfig)}
                    disabled={isProcessing}
                    className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                    Apply Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
