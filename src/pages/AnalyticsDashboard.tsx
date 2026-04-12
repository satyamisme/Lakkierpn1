import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Map as MapIcon, 
  Zap, 
  TrendingUp, 
  Activity, 
  Loader2, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Wrench,
  BrainCircuit
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Gate } from '../components/PermissionGuard';
import { Heatmap } from '../components/analytics/Heatmap';

interface ForecastItem {
  productId: string;
  name: string;
  currentStock: number;
  forecastedDemand: number;
  suggestedReorder: number;
}

interface PredictiveItem {
  model: string;
  avgTime: number;
  successRate: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [predictive, setPredictive] = useState<PredictiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [heatRes, foreRes, predRes] = await Promise.all([
        fetch('/api/analytics/heatmap', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/analytics/forecast', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/analytics/predictive', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);

      if (heatRes.ok && foreRes.ok && predRes.ok) {
        setHeatmap(await heatRes.json());
        setForecast(await foreRes.json());
        setPredictive(await predRes.json());
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <BrainCircuit className="absolute inset-0 m-auto w-6 h-6 text-primary/40" />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-foreground uppercase tracking-[0.4em]">Initializing AI Engines</p>
          <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mt-2">Synchronizing Matrix (ID 294-297)...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Predictive Matrix</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">AI-driven insights & forecasting (ID 294-297)</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={isRefreshing}
          className={`p-6 bg-surface-container-lowest border border-border rounded-2xl text-muted-foreground hover:text-primary hover:border-primary transition-all active:scale-90 shadow-sm ${isRefreshing ? 'opacity-50' : ''}`}
        >
          <RefreshCcw className={`w-8 h-8 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Heatmap (8 cols) */}
        <div className="lg:col-span-8">
          <Gate id={294}>
            <div className="bg-surface-container-lowest border border-border rounded-[4rem] p-12 shadow-sm h-full relative overflow-hidden group">
              <div className="flex items-center justify-between mb-12 relative z-10">
                <h3 className="text-4xl font-serif italic tracking-tight">Operational Heatmap</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-primary/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Low Density</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/40" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">High Density</span>
                  </div>
                </div>
              </div>
              <div className="relative z-10">
                <Heatmap data={heatmap} />
              </div>
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full -mr-72 -mt-72 blur-[120px] pointer-events-none" />
            </div>
          </Gate>
        </div>

        {/* Predictive Repair (4 cols) */}
        <div className="lg:col-span-4">
          <Gate id={296}>
            <div className="bg-surface-container-lowest border border-border rounded-[4rem] p-12 shadow-sm h-full relative overflow-hidden">
              <h3 className="text-4xl font-serif italic tracking-tight mb-12 flex items-center gap-4">
                <BrainCircuit size={36} className="text-primary" />
                Repair Matrix
              </h3>
              <div className="space-y-10">
                {predictive.map((item) => (
                  <div key={item.model} className="space-y-6 group">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-primary transition-colors">{item.model}</h4>
                        <p className="text-lg font-black uppercase tracking-tighter mt-2">Efficiency Engine</p>
                      </div>
                      <span className="text-xs font-mono font-black text-green-500 bg-green-500/5 px-4 py-2 rounded-full border border-green-500/10 shadow-sm">{item.successRate}% Success</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
                      <span>Avg Resolution Time</span>
                      <span className="font-mono">{item.avgTime} Hours</span>
                    </div>
                    <div className="w-full bg-surface border border-border h-4 rounded-full overflow-hidden p-1 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.successRate}%` }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="h-full bg-primary rounded-full shadow-xl shadow-primary/30"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
            </div>
          </Gate>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Inventory Forecast (6 cols) */}
        <div className="lg:col-span-6">
          <Gate id={295}>
            <div className="bg-surface-container-lowest border border-border rounded-[4rem] p-12 shadow-sm h-full relative overflow-hidden">
              <h3 className="text-4xl font-serif italic tracking-tight mb-12 flex items-center gap-4">
                <Package size={36} className="text-primary" />
                Asset Forecast
              </h3>
              <div className="overflow-x-auto no-scrollbar relative z-10">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Product Node</th>
                      <th className="text-right py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Current</th>
                      <th className="text-right py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Forecast</th>
                      <th className="text-right py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Directive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((item) => (
                      <tr key={item.productId} className="border-b border-border/50 hover:bg-surface transition-all group">
                        <td className="py-8">
                          <span className="text-sm font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{item.name}</span>
                        </td>
                        <td className="text-right py-8 font-mono text-base font-black">{item.currentStock}</td>
                        <td className="text-right py-8 font-mono text-base font-black text-indigo-500">{item.forecastedDemand}</td>
                        <td className="text-right py-8">
                          {item.suggestedReorder > 0 ? (
                            <span className="px-6 py-2 bg-amber-500/5 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/10 rounded-full shadow-xl shadow-amber-500/5">
                              Reorder {item.suggestedReorder}
                            </span>
                          ) : (
                            <span className="px-6 py-2 bg-green-500/5 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/10 rounded-full">
                              Optimal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-100/[0.02] pointer-events-none" />
            </div>
          </Gate>
        </div>

        {/* Sales Velocity (6 cols) */}
        <div className="lg:col-span-6">
          <div className="bg-surface-container-lowest border border-border rounded-[4rem] p-12 shadow-sm h-full relative overflow-hidden">
            <h3 className="text-4xl font-serif italic tracking-tight mb-12 flex items-center gap-4">
              <TrendingUp size={36} className="text-primary" />
              Sales Velocity
            </h3>
            <div className="h-[450px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { time: '09:00', sales: 12 },
                  { time: '11:00', sales: 45 },
                  { time: '13:00', sales: 30 },
                  { time: '15:00', sales: 85 },
                  { time: '17:00', sales: 60 },
                  { time: '19:00', sales: 110 },
                  { time: '21:00', sales: 40 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 900, fill: 'rgba(0,0,0,0.3)' }}
                    dy={20}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 900, fill: 'rgba(0,0,0,0.3)' }}
                    dx={-20}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid rgba(0,0,0,0.05)', 
                      borderRadius: '2rem', 
                      boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                      padding: '1.5rem',
                      fontSize: '11px',
                      fontWeight: '900',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}
                    cursor={{ stroke: 'rgba(59, 130, 246, 0.1)', strokeWidth: 4 }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={8} 
                    dot={{ r: 8, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 12, fill: '#fff', stroke: '#3b82f6', strokeWidth: 6 }}
                    animationDuration={2500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-100/[0.03] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
