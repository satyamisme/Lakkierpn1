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
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-serif italic tracking-tight text-foreground leading-none">Predictive Analytics</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">AI-driven insights & forecasting (ID 294-297)</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={isRefreshing}
          className={`p-5 bg-surface-container-lowest border border-border rounded-2xl text-muted-foreground hover:text-primary hover:border-primary transition-all active:scale-95 shadow-sm ${isRefreshing ? 'opacity-50' : ''}`}
        >
          <RefreshCcw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Heatmap (8 cols) */}
        <div className="lg:col-span-8">
          <Gate id={294}>
            <div className="bg-surface-container-lowest border border-border rounded-[3.5rem] p-10 shadow-sm h-full relative overflow-hidden group">
              <div className="flex items-center justify-between mb-10 relative z-10">
                <h3 className="text-3xl font-serif italic">Operational Heatmap</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary/20" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">High</span>
                  </div>
                </div>
              </div>
              <div className="relative z-10">
                <Heatmap data={heatmap} />
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
            </div>
          </Gate>
        </div>

        {/* Predictive Repair (4 cols) */}
        <div className="lg:col-span-4">
          <Gate id={296}>
            <div className="bg-surface-container-lowest border border-border rounded-[3.5rem] p-10 shadow-sm h-full relative overflow-hidden">
              <h3 className="text-3xl font-serif italic mb-10 flex items-center gap-4">
                <BrainCircuit size={28} className="text-primary" />
                Repair Matrix
              </h3>
              <div className="space-y-8">
                {predictive.map((item) => (
                  <div key={item.model} className="space-y-4 group">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">{item.model}</h4>
                        <p className="text-sm font-black uppercase tracking-tighter mt-1">Efficiency Engine</p>
                      </div>
                      <span className="text-xs font-mono font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">{item.successRate}% Success</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                      <span>Avg Resolution Time</span>
                      <span className="font-mono">{item.avgTime} Hours</span>
                    </div>
                    <div className="w-full bg-surface border border-border h-3 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.successRate}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full shadow-lg shadow-primary/20"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
            </div>
          </Gate>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Inventory Forecast (6 cols) */}
        <div className="lg:col-span-6">
          <Gate id={295}>
            <div className="bg-surface-container-lowest border border-border rounded-[3.5rem] p-10 shadow-sm h-full">
              <h3 className="text-3xl font-serif italic mb-10 flex items-center gap-4">
                <Package size={28} className="text-primary" />
                Asset Forecasting
              </h3>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Product Node</th>
                      <th className="text-right py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Current</th>
                      <th className="text-right py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Forecast</th>
                      <th className="text-right py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Directive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((item) => (
                      <tr key={item.productId} className="border-b border-border/50 hover:bg-surface transition-colors group">
                        <td className="py-6">
                          <span className="text-xs font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{item.name}</span>
                        </td>
                        <td className="text-right py-6 font-mono text-sm font-black">{item.currentStock}</td>
                        <td className="text-right py-6 font-mono text-sm font-black text-indigo-500">{item.forecastedDemand}</td>
                        <td className="text-right py-6">
                          {item.suggestedReorder > 0 ? (
                            <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20 rounded-full shadow-lg shadow-amber-500/10">
                              Reorder {item.suggestedReorder}
                            </span>
                          ) : (
                            <span className="px-4 py-1.5 bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest border border-green-500/20 rounded-full">
                              Optimal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Gate>
        </div>

        {/* Sales Velocity (6 cols) */}
        <div className="lg:col-span-6">
          <div className="bg-surface-container-lowest border border-border rounded-[3.5rem] p-10 shadow-sm h-full relative overflow-hidden">
            <h3 className="text-3xl font-serif italic mb-10 flex items-center gap-4">
              <TrendingUp size={28} className="text-primary" />
              Sales Velocity
            </h3>
            <div className="h-[400px] w-full relative z-10">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid rgba(0,0,0,0.1)', 
                      borderRadius: '1rem', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      fontSize: '10px',
                      fontWeight: '900',
                      textTransform: 'uppercase'
                    }}
                    cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3b82f6" 
                    strokeWidth={6} 
                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 8, fill: '#fff', stroke: '#3b82f6', strokeWidth: 4 }}
                    animationDuration={2000}
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
