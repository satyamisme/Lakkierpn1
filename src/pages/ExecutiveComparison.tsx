import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Store, 
  ArrowRight,
  Filter,
  Download,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export const ExecutiveComparison: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('7d');

  const fetchComparison = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/inventory/node-distribution');
      // Enhance with some mock performance data for comparison
      const enhancedData = res.data.map((node: any) => ({
        ...node,
        revenue: node.value * 0.1, // Conservative estimate based on stock value
        growth: 0, // Placeholder for real growth calculation logic
        efficiency: node.stock > 0 ? 95 : 0, // Simplified efficiency metric
        repairs: 0 // Placeholder for repair count
      }));
      setComparisonData(enhancedData);
    } catch (error) {
      toast.error("Failed to fetch comparison data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [timeframe]);

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Store Comparison</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">Benchmark performance across the matrix (ID 203)</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-surface-container border border-border rounded-2xl p-1">
            {['24h', '7d', '30d', '90d'].map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === t ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="p-4 bg-surface-container border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all">
            <Download size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {comparisonData.slice(0, 3).map((node, i) => (
          <motion.div
            key={node.node}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container-lowest border border-border p-10 rounded-[3.5rem] shadow-sm relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="p-4 bg-muted rounded-2xl text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                <Store size={24} />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${node.growth > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                {node.growth > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {node.growth}%
              </div>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 relative z-10">{node.node}</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-8 opacity-60 relative z-10">Active Node Performance</p>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Revenue</p>
                  <p className="text-2xl font-mono font-black">{node.revenue.toFixed(3)} KD</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Efficiency</p>
                  <p className="text-lg font-mono font-black text-primary">{node.efficiency}%</p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${node.efficiency}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                />
              </div>
            </div>
            
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
          </motion.div>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-border rounded-[4rem] overflow-hidden shadow-sm">
        <div className="p-10 border-b border-border flex justify-between items-center bg-muted/20">
          <div>
            <h3 className="text-3xl font-serif italic">Matrix Performance Benchmark</h3>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Cross-node efficiency & volume analysis</p>
          </div>
          <button className="px-8 py-4 bg-surface-container border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center gap-3">
            <Filter size={16} /> Advanced Filters
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-10 py-8 text-left text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Store Node</th>
                <th className="px-10 py-8 text-right text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Revenue (KD)</th>
                <th className="px-10 py-8 text-right text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Repairs</th>
                <th className="px-10 py-8 text-right text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Stock Value</th>
                <th className="px-10 py-8 text-right text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Growth</th>
                <th className="px-10 py-8 text-center text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonData.map((node) => (
                <tr key={node.node} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <Store size={20} />
                      </div>
                      <span className="font-black uppercase text-sm tracking-tighter">{node.node}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right font-mono font-black text-lg">{node.revenue.toFixed(3)}</td>
                  <td className="px-10 py-8 text-right font-mono font-bold text-blue-500">{node.repairs}</td>
                  <td className="px-10 py-8 text-right font-mono font-bold">{node.value.toFixed(3)}</td>
                  <td className={`px-10 py-8 text-right font-mono font-black ${node.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {node.growth > 0 ? '+' : ''}{node.growth}%
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex-1 max-w-[100px] h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${node.efficiency}%` }} />
                      </div>
                      <span className="text-[10px] font-mono font-black">{node.efficiency}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
