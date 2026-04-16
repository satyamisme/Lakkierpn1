import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  Package, 
  Truck, 
  ArrowRightLeft, 
  Search, 
  Plus,
  ArrowRight,
  Box,
  MapPin,
  Activity,
  BarChart3,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { StockIntakeModal } from '../components/StockIntakeModal';
import { StockTransferModal } from '../components/StockTransferModal';

/**
 * ID 121: Warehouse Matrix (Warehouse.tsx)
 * High-density bin management and logistics orchestration.
 */
export const Warehouse: React.FC = () => {
  const [bins, setBins] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [stockRes, transfersRes] = await Promise.all([
        axios.get('/api/inventory/global-stock'),
        axios.get('/api/inventory/transfers')
      ]);
      
      // Transform stock data into bins
      const transformedBins = stockRes.data.map((item: any) => ({
        id: `BIN-${item.sku.slice(0, 5)}`,
        category: item.category,
        items: item.stock,
        status: item.stock > 50 ? 'full' : item.stock > 10 ? 'low' : 'critical',
        trend: '+0%'
      }));
      
      setBins(transformedBins.slice(0, 4));
      setTransfers(transfersRes.data);
    } catch (error) {
      console.error("Warehouse fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Warehouse Matrix</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">Bin Locations & Logistics Orchestration (ID 121)</p>
        </div>
        <div className="flex gap-6">
          <button 
            onClick={() => setIsTransferOpen(true)}
            className="px-10 py-5 bg-surface-container border border-border rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all flex items-center gap-3 shadow-sm"
          >
            <ArrowRightLeft size={18} /> Stock Transfer
          </button>
          <button 
            onClick={() => setIsIntakeOpen(true)}
            className="px-10 py-5 bg-primary text-primary-foreground rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <Plus size={18} /> New Intake
          </button>
        </div>
      </header>

      {/* High-Density Bin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Scanning Bin Matrix...</p>
          </div>
        ) : bins.map((bin, index) => (
          <motion.div 
            key={bin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface-container-lowest border border-border p-10 rounded-[3.5rem] shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="w-16 h-16 bg-muted rounded-[1.5rem] flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-500 shadow-inner">
                <Box size={28} />
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                bin.status === 'full' ? 'bg-green-500/5 text-green-500 border-green-500/10' : 
                bin.status === 'low' ? 'bg-amber-500/5 text-amber-500 border-amber-500/10' : 'bg-red-500/5 text-red-500 border-red-500/10'
              }`}>
                {bin.status}
              </span>
            </div>
            
            <div className="relative z-10">
              <h3 className="font-mono font-black text-lg mb-2 tracking-tighter">{bin.id}</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 opacity-60">{bin.category}</p>
              
              <div className="flex items-end justify-between pt-8 border-t border-border">
                <div>
                  <p className="text-4xl font-mono font-black leading-none">{bin.items}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-2 opacity-40">Units Stored</p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-black ${bin.trend.startsWith('+') ? 'text-green-500' : 'text-muted-foreground'}`}>{bin.trend}</p>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-30">Velocity</p>
                </div>
              </div>
            </div>

            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
              <Package size={200} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Active Picking Lists (ID 124) */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-border rounded-[4rem] p-12 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
              <h3 className="text-4xl font-serif italic leading-none">Picking Orchestration</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-4 opacity-60">Active Fulfillment Streams</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={16} />
              <input 
                type="text" 
                placeholder="Search Lists..." 
                className="w-full bg-surface border border-border pl-14 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner" 
              />
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {transfers.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <ArrowRightLeft size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest">No active fulfillment streams</p>
              </div>
            ) : transfers.map((list) => (
              <motion.div 
                key={list._id} 
                whileHover={{ x: 10 }}
                className="flex items-center justify-between p-8 bg-surface border border-border rounded-[2.5rem] group hover:border-primary/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-muted border border-border rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:rotate-12 transition-all duration-500 shadow-inner">
                    <ArrowRightLeft size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-black uppercase tracking-tighter">TRF-{list._id.slice(-6).toUpperCase()}</p>
                      <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                        {list.fromStore} → {list.toStore}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-[10px] text-foreground font-black uppercase tracking-widest">{list.items?.length || 0} Items</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                        <Activity size={12} className="text-primary" />
                        {new Date(list.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                    list.status === 'completed' ? 'bg-green-500/5 text-green-500 border-green-500/10' : 
                    list.status === 'pending' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {list.status}
                  </span>
                  <button className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90 shadow-sm">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Background Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
        </div>

        {/* Logistics Analytics */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-surface-container-lowest border border-border p-12 rounded-[4rem] shadow-sm relative overflow-hidden">
            <h3 className="text-3xl font-serif italic mb-10 relative z-10">Supply Health</h3>
            <div className="space-y-8 relative z-10">
              <div className="p-8 bg-muted/30 border border-border rounded-[2.5rem] shadow-inner">
                <div className="flex items-center gap-3 mb-4 opacity-40">
                  <BarChart3 size={14} className="text-primary" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Avg Picking Time</p>
                </div>
                <p className="text-5xl font-mono font-black tracking-tighter">14.2 <span className="text-sm text-muted-foreground uppercase tracking-widest font-sans opacity-40">min</span></p>
              </div>
              <div className="p-8 bg-muted/30 border border-border rounded-[2.5rem] shadow-inner">
                <div className="flex items-center gap-3 mb-4 opacity-40">
                  <Activity size={14} className="text-primary" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Inventory Accuracy</p>
                </div>
                <p className="text-5xl font-mono font-black tracking-tighter text-green-500">98.4<span className="text-sm uppercase tracking-widest font-sans opacity-40">%</span></p>
              </div>
              <div className="p-8 bg-red-500/[0.03] border border-red-500/10 rounded-[2.5rem] shadow-inner">
                <div className="flex items-center gap-3 mb-4 opacity-40">
                  <AlertTriangle size={14} className="text-red-500" />
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Stockout Impact</p>
                </div>
                <p className="text-5xl font-mono font-black tracking-tighter text-red-500">-$1,240</p>
                <p className="text-[9px] font-black text-red-500/40 uppercase tracking-widest mt-2">Daily Revenue Leakage</p>
              </div>
            </div>
            <button className="w-full mt-10 py-6 bg-foreground text-background rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20">
              Run Supply Forecast
            </button>
          </div>
        </div>
      </div>
      {/* Add Product Modal */}
      <StockIntakeModal 
        isOpen={isIntakeOpen} 
        onClose={() => setIsIntakeOpen(false)} 
        onSuccess={fetchData}
      />
      <StockTransferModal 
        isOpen={isTransferOpen} 
        onClose={() => setIsTransferOpen(false)} 
        onSuccess={fetchData}
      />
    </div>
  );
};
