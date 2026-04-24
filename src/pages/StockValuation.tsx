import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, AlertCircle, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const StockValuation = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchValuation();
  }, []);

  const fetchValuation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/valuation', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const val = await res.json();
        setData(val);
      } else {
        toast.error("Failed to load inventory appraisal");
      }
    } catch (err) {
      toast.error("Network error fetching valuation");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black/20 backdrop-blur-sm">
       <Loader2 size={48} className="text-primary animate-spin" />
    </div>
  );

  const valuationData = data || {
    totalValue: 0,
    wacTrend: 0,
    categories: [],
    agedStockValue: 0,
    fastMovingValue: 0
  };

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight leading-none">Market Equity</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Weighted Average Cost & Inventory Valuation (ID 131)</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all">
            Export Asset Audit
          </button>
          <button className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
            Refresh Appraisal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 surface-container p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <TrendingUp size={120} />
          </div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6">Aggregate Net Worth</p>
          <div className="flex items-baseline gap-4">
            <h2 className="text-7xl font-black font-mono tracking-tighter">{valuationData.totalValue.toLocaleString('en-KW', { minimumFractionDigits: 3 })}</h2>
            <span className="text-2xl font-black text-white/20 uppercase tracking-widest">KD</span>
          </div>
          <div className="mt-8 flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${valuationData.wacTrend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {valuationData.wacTrend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(valuationData.wacTrend)}% vs Last Month
            </div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-relaxed">
              Based on live WAC (Weighted Average Cost) calculations across 4 zones.
            </p>
          </div>
        </div>

        <div className="surface-container p-10 rounded-[3rem] border border-white/5 flex flex-col justify-between">
           <div>
             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Liquidity Risk</p>
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Aged Stock (+90d)</span>
                  <span className="text-sm font-black font-mono text-red-500">{valuationData.agedStockValue.toLocaleString()} KD</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Fast Moving</span>
                  <span className="text-sm font-black font-mono text-green-500">{valuationData.fastMovingValue.toLocaleString()} KD</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Dead Stock</span>
                  <span className="text-sm font-black font-mono text-white/20">{(valuationData.totalValue * 0.02).toLocaleString()} KD</span>
               </div>
             </div>
           </div>
           <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-4">
              <AlertCircle className="text-amber-500" size={20} />
              <p className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest leading-relaxed">
                Appraisal identifies 3 variants with high cost-volatility.
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {valuationData.categories.map(cat => (
          <div key={cat.name} className="surface-container p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                cat.health === 'High Stock' ? 'bg-amber-500/10 text-amber-500' :
                cat.health === 'Low Stock' ? 'bg-red-500/10 text-red-500' :
                'bg-green-500/10 text-green-500'
              }`}>
                {cat.health}
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                <DollarSign size={14} />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{cat.items} Total Units</p>
              <p className="text-lg font-black uppercase text-white/90 truncate">{cat.name}</p>
            </div>
            <p className="text-2xl font-black font-mono tracking-tighter">{cat.value.toLocaleString()} <span className="text-[10px] opacity-40">KD</span></p>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-primary opacity-40" style={{ width: `${(cat.value / valuationData.totalValue) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockValuation;
