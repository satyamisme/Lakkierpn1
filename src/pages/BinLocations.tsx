import React from 'react';
import { Layout, MapPin, Box, ArrowRight } from 'lucide-react';

export const BinLocations = () => {
  const zones = [
    { id: 'A', name: 'Smartphones', bins: 144, utilization: 82 },
    { id: 'B', name: 'Accessories', bins: 256, utilization: 45 },
    { id: 'C', name: 'Returns/Audit', bins: 64, utilization: 12 },
    { id: 'W', name: 'Main Warehouse', bins: 1024, utilization: 68 },
  ];

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight leading-none">Bin Matrix</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Physical Storage Architecture (ID 179)</p>
        </div>
        <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
          + Define Zone
        </button>
      </div>

      {/* Grid: Zone -> Shelf -> Bin */}
      <div className="grid grid-cols-4 gap-6">
        {zones.map(zone => (
          <div key={zone.id} className="surface-container p-8 rounded-[2.5rem] border border-white/5 space-y-6 group hover:border-primary/20 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-40 transition-opacity" />
            
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                <MapPin size={20} className="text-primary" />
              </div>
              <div className="text-right">
                <span className="text-[32px] font-black font-mono leading-none">Zone {zone.id}</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 opacity-60">Identity</p>
              <p className="text-lg font-black uppercase text-white/80">{zone.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Capacity</p>
                <p className="text-xl font-black font-mono">{zone.bins}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Stocked</p>
                <p className="text-xl font-black font-mono">{Math.floor(zone.bins * (zone.utilization / 100))}</p>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
                <span>Utilization</span>
                <span>{zone.utilization}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${zone.utilization}%` }} 
                />
              </div>
            </div>

            <button className="w-full py-4 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-white/40 group-hover:text-white">
              Manage Topology <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 surface-container rounded-[3rem] p-10 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
           <h3 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-3">
             <Box size={20} className="text-primary" /> Recent Bin Assignments
           </h3>
           <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden border border-white/5">
                      <img src={`https://picsum.photos/seed/bin-${i}/100/100`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">iPhone 15 Pro Max [256GB | Blue]</p>
                      <p className="text-[9px] font-mono font-bold text-white/30 mt-1">IMEI: 35489021445678{i}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Bin Vector</p>
                      <p className="text-sm font-black font-mono text-primary">A-12-0{i}</p>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <span className="text-[10px] font-black text-white/40 uppercase">Secured</span>
                  </div>
                </div>
              ))}
           </div>
        </div>
        
        <div className="surface-container rounded-[3rem] p-10 border border-white/5 space-y-8">
          <h3 className="text-lg font-black uppercase tracking-widest mb-4">Stock Density</h3>
          <div className="flex flex-col items-center justify-center py-10 space-y-6">
             <div className="relative w-48 h-48 rounded-full border-[12px] border-white/5 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent -rotate-45" />
                <div className="text-center">
                  <p className="text-4xl font-black font-mono">68%</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Total Occupancy</p>
                </div>
             </div>
             <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-primary" />
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Occupied</span>
                   </div>
                   <span className="text-xs font-black font-mono text-white/80">1,244 Bins</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-white/5" />
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Available</span>
                   </div>
                   <span className="text-xs font-black font-mono text-white/40">588 Bins</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinLocations;
