import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Smartphone, 
  ChevronRight, 
  Wrench, 
  Info, 
  AlertCircle,
  Cpu,
  Layers,
  History,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const DeviceCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const models = [
    { id: '1', name: 'iPhone 15 Pro Max', brand: 'Apple', release: '2023', repairs: 142, difficulty: 'High', parts: 12 },
    { id: '2', name: 'Galaxy S24 Ultra', brand: 'Samsung', release: '2024', repairs: 56, difficulty: 'Medium', parts: 8 },
    { id: '3', name: 'iPhone 13', brand: 'Apple', release: '2021', repairs: 842, difficulty: 'Medium', parts: 15 },
    { id: '4', name: 'Pixel 8 Pro', brand: 'Google', release: '2023', repairs: 24, difficulty: 'High', parts: 10 },
  ];

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight leading-none">Hardware Blueprint</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Global Device Catalog & Technical Specs (ID 98)</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-4 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all">
            Update Catalog
          </button>
          <button className="px-10 py-5 bg-white text-black rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-3">
             <Plus size={20} /> Register New Model
          </button>
        </div>
      </div>

      <div className="relative max-w-4xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
        <input 
          type="text"
          placeholder="Search hardware by name, model string or A-number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-inner"
        />
      </div>

      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-3 surface-container rounded-[3.5rem] border border-white/5 overflow-hidden">
          <div className="grid grid-cols-6 gap-6 p-8 bg-white/5 border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/30">
            <div className="col-span-2 text-primary">Identity Layer</div>
            <div>Gen/Year</div>
            <div>Servicability</div>
            <div>Active Parts</div>
            <div className="text-right">Vector</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {models.map(model => (
              <motion.div 
                key={model.id}
                className="grid grid-cols-6 gap-6 p-10 items-center hover:bg-white/[0.02] transition-all group relative overflow-hidden"
              >
                <div className="col-span-2 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-white/40 group-hover:bg-primary group-hover:text-black transition-all">
                    <Smartphone size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tighter text-white">{model.name}</h4>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{model.brand} // {model.repairs} Global Tickets</span>
                  </div>
                </div>

                <div className="text-xs font-black font-mono text-white/40">{model.release}</div>
                
                <div>
                   <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                     model.difficulty === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                   }`}>
                     {model.difficulty} Complexity
                   </span>
                </div>

                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                      <Layers size={14} />
                   </div>
                   <span className="text-xs font-black font-mono">{model.parts} SKUs</span>
                </div>

                <div className="flex justify-end pr-4">
                  <button className="p-4 bg-white/5 hover:bg-white group-hover:text-black rounded-2xl transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
           <div className="surface-container p-10 rounded-[3rem] border border-white/5 space-y-8">
              <h3 className="text-lg font-black uppercase tracking-widest mb-4">Node Affinity</h3>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                       <Cpu size={18} />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">A-Series Integration</p>
                       <p className="text-xs font-black tracking-tight">Active GSX Connectivity</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                       <ShieldCheck size={18} />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Parts Authentication</p>
                       <p className="text-xs font-black tracking-tight">Encrypted Component ID</p>
                    </div>
                 </div>
              </div>
              <div className="pt-6 border-t border-white/5">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] leading-relaxed">
                   Device catalog is synced with GSX and Samsung Global parts databases every 24h.
                 </p>
              </div>
           </div>

           <div className="surface-container p-10 rounded-[3.5rem] border border-white/5 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden group">
              <Zap className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-40 transition-opacity" size={120} />
              <h3 className="text-2xl font-serif italic mb-2">Repair IQ</h3>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8">AI Technical Briefings</p>
              <button className="w-full py-5 bg-white text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                Launch Workshop Wiki
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const Plus = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default DeviceCatalog;
