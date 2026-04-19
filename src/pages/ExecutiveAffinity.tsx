import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Package, 
  TrendingUp, 
  ArrowRight,
  Filter,
  Download,
  Activity,
  Zap,
  Layers,
  ShoppingBag,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export const ExecutiveAffinity: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [affinityData, setAffinityData] = useState<any[]>([]);
  const [lostSales, setLostSales] = useState<any[]>([]);

  const fetchAffinity = async () => {
    try {
      setIsLoading(true);
      // Affinity data logic would go here (requires complex transaction correlation)
      setAffinityData([]);
      
      const inventoryRes = await axios.get('/api/inventory/low-stock');
      setLostSales(inventoryRes.data.map((item: any) => ({
        ...item,
        lostRevenue: 0 // Initialize as 0 until real impact calculator is implemented
      })).slice(0, 5));

    } catch (error) {
      toast.error("Failed to fetch affinity data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAffinity();
  }, []);

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Product Affinity</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">“Bought together” analysis & lost sales matrix (ID 294)</p>
        </div>
        <div className="flex gap-4">
          <button className="p-4 bg-surface-container border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all">
            <Download size={20} />
          </button>
          <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
            Export Report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-surface-container-lowest border border-border rounded-[4rem] overflow-hidden shadow-sm">
          <div className="p-10 border-b border-border flex justify-between items-center bg-muted/20">
            <div>
              <h3 className="text-3xl font-serif italic">Affinity Matrix</h3>
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Product pairing strength & cross-sell revenue</p>
            </div>
            <Sparkles className="text-primary animate-pulse" size={24} />
          </div>
          <div className="p-10 space-y-8">
            {affinityData.map((item, i) => (
              <motion.div
                key={item.main}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-muted/10 border border-border rounded-[2.5rem] group hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-widest">{item.main}</div>
                    <ArrowRight size={16} className="text-muted-foreground" />
                    <div className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">{item.companion}</div>
                  </div>
                  <span className="text-2xl font-mono font-black text-primary">{item.strength}%</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Cross-sell Revenue</p>
                    <p className="text-xl font-mono font-black">{item.revenue.toFixed(3)} KD</p>
                  </div>
                  <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.strength}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-border rounded-[4rem] overflow-hidden shadow-sm">
          <div className="p-10 border-b border-border flex justify-between items-center bg-red-500/[0.02]">
            <div>
              <h3 className="text-3xl font-serif italic text-red-500">Lost Sales Matrix</h3>
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Revenue impact of stock-outs</p>
            </div>
            <Package className="text-red-500" size={24} />
          </div>
          <div className="p-10 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Calculating Impact...</p>
              </div>
            ) : lostSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Activity size={64} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Lost Sales Detected</p>
              </div>
            ) : (
              lostSales.map((item, i) => (
                <motion.div
                  key={item.sku}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-8 bg-red-500/[0.02] border border-red-500/10 rounded-[2.5rem] flex items-center justify-between group hover:bg-red-500/[0.05] transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-muted rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                      <img src={`https://picsum.photos/seed/${item.sku}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tighter">{item.name}</h4>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Lost Revenue</p>
                    <p className="text-2xl font-mono font-black text-red-500">-{item.lostRevenue.toFixed(3)} KD</p>
                  </div>
                </motion.div>
              ))
            )}
            <div className="pt-10 mt-10 border-t border-border flex justify-between items-center">
              <div className="text-left">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Opportunity Cost</p>
                <p className="text-4xl font-mono font-black text-red-500">
                  {lostSales.reduce((sum, item) => sum + item.lostRevenue, 0).toFixed(3)} KD
                </p>
              </div>
              <button className="px-8 py-4 bg-surface-container border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center gap-3">
                Bulk Restock <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
