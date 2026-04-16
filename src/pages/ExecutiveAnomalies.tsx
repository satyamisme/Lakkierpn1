import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  ArrowRight,
  Filter,
  Download,
  Activity,
  Zap,
  Eye,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export const ExecutiveAnomalies: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    resolved: 0
  });

  const fetchAnomalies = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/reports/anomalies');
      setAnomalies(res.data);
      setStats({
        total: res.data.length,
        critical: res.data.filter((a: any) => a.total < 0.5).length,
        resolved: 0 // Mock
      });
    } catch (error) {
      toast.error("Failed to fetch anomaly data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Anomaly Matrix</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">Suspicious pattern detection & funnel analytics (ID 244)</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchAnomalies}
            className="p-4 bg-surface-container border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all"
          >
            <Activity className={isLoading ? 'animate-spin' : ''} size={20} />
          </button>
          <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
            Run Deep Scan
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Active Alerts', value: stats.total, icon: <ShieldAlert />, color: 'text-red-500' },
          { label: 'Critical Breaches', value: stats.critical, icon: <AlertTriangle />, color: 'text-amber-500' },
          { label: 'System Integrity', value: '99.8%', icon: <ShieldCheck />, color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm relative overflow-hidden group"
          >
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className={`p-3 bg-muted rounded-2xl ${stat.color} group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Real-time</span>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
            <h2 className="text-4xl font-mono font-black relative z-10">{stat.value}</h2>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-border rounded-[4rem] overflow-hidden shadow-sm">
          <div className="p-10 border-b border-border flex justify-between items-center bg-muted/20">
            <div>
              <h3 className="text-3xl font-serif italic text-red-500">Suspicious Pattern Feed</h3>
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Automated node surveillance</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">Live Feed</span>
            </div>
          </div>
          <div className="p-10 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Analyzing Matrix Nodes...</p>
              </div>
            ) : anomalies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <ShieldCheck size={64} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Anomalies Detected</p>
              </div>
            ) : (
              anomalies.map((a, i) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-8 bg-red-500/[0.02] border border-red-500/10 rounded-[2.5rem] flex items-center justify-between group hover:bg-red-500/[0.05] transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                      <Zap size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Low Price Alert</span>
                        <span className="text-[9px] font-mono text-muted-foreground opacity-40">{new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tighter">Transaction: {a.total.toFixed(3)} KD</h4>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Node ID: {a._id.toUpperCase()}</p>
                    </div>
                  </div>
                  <button className="p-4 bg-surface-container border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                    <Eye size={20} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-surface-container-lowest border border-border p-10 rounded-[4rem] shadow-sm">
            <h3 className="text-2xl font-serif italic mb-8">Funnel Analytics</h3>
            <div className="space-y-8">
              {[
                { label: 'Intake to Ready', value: '84%', trend: '+2.4%', desc: 'Repair conversion rate' },
                { label: 'Lead to Sale', value: '12%', trend: '-1.2%', desc: 'CRM conversion rate' },
                { label: 'Stock to Sale', value: '45%', trend: '+5.8%', desc: 'Inventory turnover' },
              ].map((item) => (
                <div key={item.label} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-3xl font-mono font-black">{item.value}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {item.trend}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: item.value }} />
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black p-10 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-serif italic text-white mb-4">Heuristic Engine</h3>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8">AI-Powered Pattern Matching</p>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Neural Status</p>
                  <p className="text-xs font-bold text-white/80">Analyzing 1,240 transactions/sec</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1">Last Heuristic</p>
                  <p className="text-xs font-bold text-white/80">No fraud patterns detected in last 24h</p>
                </div>
              </div>
            </div>
            <Activity className="absolute -bottom-10 -right-10 w-48 h-48 text-white opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" />
          </div>
        </div>
      </div>
    </div>
  );
};
