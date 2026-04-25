import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingCart, 
  Wrench, 
  Boxes, 
  Users, 
  ShieldCheck, 
  BrainCircuit, 
  Activity, 
  Zap,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Cpu,
  Globe,
  Database,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      await axios.post('/api/admin/seed');
      toast.success("Matrix Reconstructed: Development data successfully injected.");
      window.location.reload(); // Refresh to show new data
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Matrix corruption: Seeding failed.");
    } finally {
      setIsSeeding(false);
    }
  };

  const domainCards = [
    { 
      id: 'pos', 
      label: 'SALES ENGINE', 
      icon: ShoppingCart, 
      desc: 'High-velocity transaction processing and real-time revenue tracking.',
      stats: '124 Sales Today',
      color: 'text-blue-500'
    },
    { 
      id: 'repairs', 
      label: 'REPAIR HUB', 
      icon: Wrench, 
      desc: 'Advanced device diagnostics and technician workflow management.',
      stats: '18 Active Repairs',
      color: 'text-orange-500'
    },
    { 
      id: 'inventory', 
      label: 'STOCK MATRIX', 
      icon: Boxes, 
      desc: 'Intelligent inventory forecasting and supply chain automation.',
      stats: '4 Low Stock Alerts',
      color: 'text-green-500'
    },
    { 
      id: 'crm', 
      label: 'CLIENT CORE', 
      icon: Users, 
      desc: 'Omnichannel customer relationship and loyalty intelligence.',
      stats: '2.4k Customers',
      color: 'text-pink-500'
    },
    { 
      id: 'governance', 
      label: 'GOVERNANCE', 
      icon: ShieldCheck, 
      desc: 'System-wide compliance, audit trails, and role security.',
      stats: 'System Secure',
      color: 'text-slate-500'
    },
    { 
      id: 'enterprise', 
      label: 'ENTERPRISE', 
      icon: BrainCircuit, 
      desc: 'Core system architecture and self-healing database tools.',
      stats: 'v2.6 Operational',
      color: 'text-amber-500'
    }
  ];

  return (
    <div className="space-y-16 pb-24">
      {/* Hero: The Obsidian Command - Pro Aesthetic */}
      <header className="relative">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">System Operational</span>
            </div>
            <div className="h-px w-16 bg-white/5" />
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Node: POS-01-LAKKI</span>
          </div>
          
          <div className="relative">
            <h1 className="text-[10vw] lg:text-[8rem] font-black tracking-tighter leading-[0.8] uppercase text-white">
              Command<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-800">Intelligence</span>
            </h1>
            <div className="absolute -top-4 -right-4 opacity-10">
              <BrainCircuit className="w-32 h-32" />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-10">
            <p className="max-w-xl text-lg font-medium text-white/40 leading-relaxed">
              The central nervous system of Lakki Terminal OS. 
              Real-time telemetry and command execution across 367 integrated business modules.
            </p>
            
            <div className="flex items-center gap-4">
              <button 
                disabled={isSeeding}
                onClick={handleSeedData}
                className="group px-6 py-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-amber-500 hover:text-black transition-all duration-300"
              >
                {isSeeding ? <Loader2 className="animate-spin" size={16} /> : <Zap className="w-4 h-4 fill-amber-500 group-hover:fill-black" />}
                Seed Matrix
              </button>
              <button 
                onClick={() => navigate('/pos')}
                className="group px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-4 hover:bg-blue-500 hover:text-white transition-all duration-500 shadow-2xl shadow-white/5"
              >
                Initialize Terminal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bento Grid: Domains - Pro Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {domainCards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => navigate(`/${card.id}`)}
            className="group relative bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[280px]"
          >
            <div>
              <div className={`mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${card.color}`}>
                <card.icon className="w-10 h-10" />
              </div>
              
              <h3 className="text-2xl font-black tracking-tighter mb-3 text-white group-hover:text-blue-500 transition-colors">
                {card.label}
              </h3>
              
              <p className="text-[11px] font-medium text-white/30 leading-relaxed mb-8 group-hover:text-white/50 transition-colors">
                {card.desc}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Status</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                  {card.stats}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all">
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>

            {/* Hover Glow */}
            <div className="absolute -inset-24 bg-blue-500/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* System Metrics - High Density Telemetry */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Network Latency', value: '14ms', icon: Globe, status: 'Optimal', trend: 'down' },
          { label: 'CPU Utilization', value: '22.4%', icon: Cpu, status: 'Stable', trend: 'up' },
          { label: 'Database Sync', value: '100%', icon: Database, status: 'Active', trend: 'stable' },
          { label: 'Active Sessions', value: '42', icon: Activity, status: 'Live', trend: 'up' },
        ].map((metric, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex flex-col gap-6 group hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/5 rounded-lg">
                <metric.icon className="w-4 h-4 text-white/40" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">{metric.status}</span>
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{metric.label}</p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-black tracking-tighter text-white">{metric.value}</p>
                <div className={`mb-1 flex items-center gap-1 text-[10px] font-bold ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-blue-500' : 'text-white/20'}`}>
                  {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : metric.trend === 'down' ? <TrendingUp className="w-3 h-3 rotate-180" /> : null}
                  {metric.trend !== 'stable' && '2.4%'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Pulse: Technical Audit - Pro Log Viewer */}
      <section className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase text-white">System Pulse</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 mt-2">Real-time Technical Audit Trail</p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all">
                Export Log
              </button>
              <button className="px-6 py-3 bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                View All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              { time: '12:45:01', user: 'SATYAM', action: 'AUTH_OVERRIDE_SUCCESS', id: 'NODE_01', severity: 'info' },
              { time: '12:44:52', user: 'SYSTEM', action: 'DB_VACUUM_COMPLETE', id: 'CORE_DB', severity: 'success' },
              { time: '12:44:30', user: 'AHMED', action: 'SALE_TRANSACTION_FINALIZED', id: 'POS_04', severity: 'info' },
              { time: '12:44:15', user: 'SARA', action: 'REPAIR_STATUS_UPDATED', id: 'REP_92', severity: 'info' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between py-5 border-b border-white/5 group cursor-pointer hover:bg-white/[0.02] px-4 -mx-4 rounded-xl transition-all">
                <div className="flex items-center gap-10">
                  <span className="text-[10px] font-mono text-white/20">{log.time}</span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black tracking-tight text-white/90 group-hover:text-blue-500 transition-colors uppercase">{log.action}</span>
                      <div className={`w-1 h-1 rounded-full ${log.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    </div>
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">{log.user} • {log.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[8px] font-mono text-white/10 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Trace: 0x442A</span>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
