import React, { useState, useEffect } from 'react';
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
  Loader2,
  FileDown,
  History,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      clearInterval(interval);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/audit/logs?limit=4')
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      await api.post('/admin/seed');
      toast.success("Database Initialized: Development data successfully injected.");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Initialization failed.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      const response = await api.get('/audit/logs/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audit_logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Audit logs exported successfully.");
    } catch (err) {
      toast.error("Failed to export logs.");
    }
  };

  const domainCards = [
    { 
      id: 'pos', 
      label: 'Sales', 
      icon: ShoppingCart, 
      desc: 'Point of sale terminal, revenue tracking, and order fulfillment.',
      stats: stats ? `${stats.salesCount} Sales Today` : 'Loading...',
      color: 'text-blue-500'
    },
    { 
      id: 'repairs', 
      label: 'Repairs', 
      icon: Wrench, 
      desc: 'Device diagnostics, technician assignments, and status hub.',
      stats: stats ? `${stats.repairStats.active} Active Repairs` : 'Loading...',
      color: 'text-orange-500'
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: Boxes, 
      desc: 'Stock management, low stock alerts, and warehouse operations.',
      stats: stats ? `${stats.inventoryStats.lowStock} Stock Alerts` : 'Loading...',
      color: 'text-green-500'
    },
    { 
      id: 'crm', 
      label: 'Customers', 
      icon: Users, 
      desc: 'Client directory, loyalty program, and customer 360 view.',
      stats: stats ? `${stats.customerCount} Clients` : 'Loading...',
      color: 'text-pink-500'
    },
    { 
      id: 'governance', 
      label: 'Compliance', 
      icon: ShieldCheck, 
      desc: 'Access control, audit trails, and regulatory reporting.',
      stats: 'System Secure',
      color: 'text-slate-500'
    },
    { 
      id: 'enterprise', 
      label: 'Settings', 
      icon: BrainCircuit, 
      desc: 'System configuration, feature management, and logs.',
      stats: 'Maintenance Mode Off',
      color: 'text-amber-500'
    }
  ];

  return (
    <div className="space-y-12 pb-24">
      {/* Hero: Professional Overview */}
      <header className="relative">
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 border rounded-full ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                {isOnline ? 'Network Online' : 'Offline Mode'}
              </span>
            </div>
            <div className="h-px w-10 bg-white/5" />
            <span className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest">{user?.name} · {user?.role || 'Administrator'}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
               <h1 className="text-4xl lg:text-7xl font-bold tracking-tighter text-white leading-[0.9]">
                 Command<br />
                 <span className="text-white/40">Center</span>
               </h1>
               <p className="mt-6 text-sm lg:text-base font-medium text-white/30 leading-relaxed max-w-lg">
                 Real-time operational overview and module access. 
                 Monitor performance metrics, manage workflows, and audit system activity.
               </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                disabled={isSeeding}
                onClick={handleSeedData}
                className="group px-6 py-4 bg-white/5 text-white/60 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                {isSeeding ? <Loader2 className="animate-spin" size={16} /> : <Zap className="w-3.5 h-3.5" />}
                Init Demo
              </button>
              <button 
                onClick={() => navigate('/pos')}
                className="group px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-xl shadow-white/5"
              >
                Launch POS
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Grid: Domain Hubs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">
        {domainCards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => navigate(`/${card.id}`)}
            className="group relative bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[280px]"
          >
            <div>
              <div className={`mb-8 p-3 w-fit bg-black/40 rounded-xl border border-white/5 ${card.color}`}>
                <card.icon size={20} />
              </div>
              
              <h3 className="text-xl font-bold tracking-tight mb-2 text-white group-hover:text-primary transition-colors">
                {card.label}
              </h3>
              
              <p className="text-[10px] font-medium text-white/20 leading-relaxed mb-6 group-hover:text-white/40 transition-colors">
                {card.desc}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${card.color}`}>
                {card.stats}
              </span>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Snapshot */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Today Revenue', value: stats ? `${(stats.todayRevenue || 0).toFixed(3)} KD` : '...', icon: TrendingUp, status: 'Active' },
          { label: 'Active Sessions', value: stats ? stats.activeSessions.toString() : '...', icon: Activity, status: 'Live' },
          { label: 'Cloud Database', value: isOnline ? 'Connected' : 'Local Only', icon: Database, status: isOnline ? 'Ready' : 'Standby' },
          { label: 'System Uptime', value: '99.98%', icon: Globe, status: 'Historical' },
        ].map((metric, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] group hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-lg text-white/20 group-hover:text-white/40 transition-colors">
                <metric.icon size={16} />
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[8px] font-bold uppercase tracking-wider text-blue-500/60 break-all">{metric.status}</span>
                <div className="w-1 h-1 rounded-full bg-blue-500/40 shrink-0" />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-wider mb-1 truncate">{metric.label}</p>
              <p className="text-2xl font-bold tracking-tight text-white">{metric.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Audit Intelligence Feed */}
      <section className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-6 lg:p-10 relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <History className="text-blue-500" size={24} /> Recent Activity
            </h2>
            <p className="text-[10px] font-medium text-white/20 uppercase tracking-[0.2em] mt-2">Verified transaction and system log</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleExportLogs}
              className="flex-1 sm:flex-none px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-wider text-white/40 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <FileDown size={14} /> Export CSV
            </button>
            <button 
              onClick={() => navigate('/governance')}
              className="flex-1 sm:flex-none px-5 py-3 bg-blue-600/10 border border-blue-600/20 rounded-xl text-[9px] font-bold uppercase tracking-wider text-blue-500 hover:bg-blue-600/20 transition-all flex items-center justify-center"
            >
              Governance Hub
            </button>
          </div>
        </div>

        <div className="space-y-1 overflow-x-auto no-scrollbar">
          <div className="min-w-[600px] lg:min-w-0">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group cursor-pointer hover:bg-white/[0.02] px-4 -mx-4 rounded-xl transition-all">
              <div className="flex items-center gap-8 lg:gap-14 overflow-hidden">
                <span className="text-[10px] font-mono text-white/10 w-20 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <div className="flex flex-col min-w-0 truncate">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-white/80 group-hover:text-blue-400 transition-colors uppercase tracking-wide truncate">{log.action || 'Unknown Action'}</span>
                    <div className="px-1.5 py-0.5 rounded-sm bg-white/5 text-[8px] font-mono text-white/20 group-hover:text-blue-500/40 transition-colors uppercase shrink-0">{log.entity || 'System'}</div>
                  </div>
                  <span className="text-[9px] font-medium text-white/10 uppercase tracking-widest mt-1 truncate">{(log.userId as any)?.name || 'System'} · IP: {log.ip || 'Local'}</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/10 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
            </div>
          )) : (
            <div className="py-12 text-center">
              <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">No recent activity entries</p>
            </div>
          )}
          </div>
          {isLoading && (
             <div className="py-12 flex justify-center">
                <Loader2 className="animate-spin text-white/10" size={24} />
             </div>
          )}
        </div>
      </section>
    </div>
  );
};
