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
import { Gate } from '../components/Gate';
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

  const fetchData = async () => {
    try {
      setIsLoading(true);
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
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Running AI Engines (ID 294-297)...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Predictive Analytics</h1>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">AI-Driven Insights & Forecasting (ID 294, 295, 296, 297)</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-3 bg-card border border-border text-muted-foreground hover:text-primary transition-all active:scale-95"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Heatmap */}
        <div className="lg:col-span-2">
          <Gate id={294}>
            <Heatmap data={heatmap} />
          </Gate>
        </div>

        {/* Predictive Repair */}
        <div className="lg:col-span-1">
          <Gate id={296}>
            <div className="bg-card border border-border p-8 shadow-sm h-full">
              <h3 className="text-lg font-black uppercase tracking-tighter italic mb-6 flex items-center gap-2">
                <BrainCircuit size={20} className="text-primary" />
                Predictive Repair (ID 296)
              </h3>
              <div className="space-y-6">
                {predictive.map((item) => (
                  <div key={item.model} className="p-4 bg-muted/30 border border-border space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black uppercase tracking-widest">{item.model}</h4>
                      <span className="text-[10px] font-black text-green-500">{item.successRate}% Success</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Avg Repair Time</span>
                      <span className="text-xs font-black font-mono">{item.avgTime} Hours</span>
                    </div>
                    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${item.successRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Gate>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Forecast */}
        <Gate id={295}>
          <div className="bg-card border border-border p-8 shadow-sm">
            <h3 className="text-lg font-black uppercase tracking-tighter italic mb-6 flex items-center gap-2">
              <Package size={20} className="text-primary" />
              Inventory Forecast (ID 295)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</th>
                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Stock</th>
                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Forecasted Demand</th>
                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((item) => (
                    <tr key={item.productId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4">
                        <span className="text-xs font-black uppercase tracking-tighter">{item.name}</span>
                      </td>
                      <td className="text-right py-4 font-mono text-xs font-bold">{item.currentStock}</td>
                      <td className="text-right py-4 font-mono text-xs font-bold text-indigo-500">{item.forecastedDemand}</td>
                      <td className="text-right py-4">
                        {item.suggestedReorder > 0 ? (
                          <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
                            Reorder {item.suggestedReorder}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/20">
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

        {/* Sales Velocity */}
        <div className="bg-card border border-border p-8 shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-tighter italic mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Sales Velocity (ID 297)
          </h3>
          <div className="h-[300px] w-full">
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#666' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '0', color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
