import React from 'react';
import { motion } from 'motion/react';
import { 
  Layers, 
  Package, 
  Truck, 
  ArrowRightLeft, 
  Search, 
  Plus,
  ArrowRight
} from 'lucide-react';

/**
 * ID 121: Warehouse Management
 * Bin locations, picking, and bulk storage.
 */
export const Warehouse: React.FC = () => {
  const bins = [
    { id: 'BIN-A1-01', category: 'Screens', items: 45, status: 'full' },
    { id: 'BIN-A1-02', category: 'Batteries', items: 12, status: 'low' },
    { id: 'BIN-B2-05', category: 'Accessories', items: 88, status: 'full' },
    { id: 'BIN-C1-10', category: 'Tools', items: 5, status: 'critical' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight text-foreground">Warehouse Matrix</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Bin Locations & Picking (ID 121)</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-muted border border-border rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted/80 transition-all">
            <Layers size={16} /> Bin Manager
          </button>
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Plus size={16} /> New Intake
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {bins.map((bin) => (
          <div key={bin.id} className="bg-surface-container-lowest border border-border p-6 rounded-[2rem] shadow-sm group hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-muted rounded-2xl text-muted-foreground group-hover:text-primary transition-colors"><Package size={20} /></div>
              <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                bin.status === 'full' ? 'bg-green-500/10 text-green-500' : 
                bin.status === 'low' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {bin.status}
              </span>
            </div>
            <h3 className="font-mono font-bold text-sm mb-1">{bin.id}</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">{bin.category}</p>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xl font-mono font-black">{bin.items} <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Units</span></span>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors"><ArrowRight size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-border rounded-[3rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif italic">Active Picking Lists</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input type="text" placeholder="Search Lists..." className="bg-muted border border-border pl-10 pr-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary" />
            </div>
          </div>
          <div className="space-y-4">
            {[
              { id: 'PICK-001', store: 'Salmiya Branch', items: 12, status: 'In Progress' },
              { id: 'PICK-002', store: 'Hawally Branch', items: 45, status: 'Pending' },
              { id: 'PICK-003', store: 'Main Warehouse', items: 8, status: 'Completed' },
            ].map((list) => (
              <div key={list.id} className="flex items-center justify-between p-6 bg-muted/30 border border-border rounded-3xl group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-card border border-border rounded-2xl text-muted-foreground group-hover:text-primary transition-colors">
                    <ArrowRightLeft size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{list.id} • {list.store}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{list.items} Items to Pick</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    list.status === 'Completed' ? 'bg-green-500 text-white' : 
                    list.status === 'In Progress' ? 'bg-indigo-500 text-white' : 'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {list.status}
                  </span>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors"><ArrowRight size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm flex flex-col">
          <h3 className="text-xl font-serif italic mb-8">Supply Chain Health</h3>
          <div className="flex-1 space-y-6">
            <div className="p-6 bg-muted/30 border border-border rounded-3xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Avg Picking Time</p>
              <p className="text-3xl font-mono font-black">14.2 <span className="text-xs text-muted-foreground">min</span></p>
            </div>
            <div className="p-6 bg-muted/30 border border-border rounded-3xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Inventory Accuracy</p>
              <p className="text-3xl font-mono font-black text-green-500">98.4%</p>
            </div>
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Out of Stock Impact</p>
              <p className="text-3xl font-mono font-black text-red-500">-$1,240 <span className="text-xs">/day</span></p>
            </div>
          </div>
          <button className="w-full mt-8 py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all">
            Run Supply Forecast
          </button>
        </div>
      </div>
    </div>
  );
};
