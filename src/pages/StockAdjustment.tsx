import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeftRight, 
  Search, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  History,
  Info,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export const StockAdjustment = () => {
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
  
  const recentAdjustments = [
    { id: 'ADJ-1024', user: 'Ahmed Al-Sabah', reason: 'Damaged during transit', change: -4, date: '2024-04-22', product: 'iPhone 15 Pro [Natural]' },
    { id: 'ADJ-1025', user: 'Sara Smith', reason: 'Correction for misplaced stock', change: +12, date: '2024-04-22', product: 'Apple Watch Ultra 2' },
  ];

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight leading-none">Stock Correction</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Manual Inventory Alignment (ID 130)</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1">
              <button 
                onClick={() => setAdjustmentType('increase')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${adjustmentType === 'increase' ? 'bg-green-500 text-white' : 'text-white/40 hover:text-white'}`}
              >
                <ArrowUp size={14} /> Increase
              </button>
              <button 
                onClick={() => setAdjustmentType('decrease')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${adjustmentType === 'decrease' ? 'bg-red-500 text-white' : 'text-white/40 hover:text-white'}`}
              >
                <ArrowDown size={14} /> Decrease
              </button>
           </div>
           <button className="px-10 py-5 bg-white text-black rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-3">
             <Save size={20} /> Commit Correction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-8 space-y-8">
           {/* Selector */}
           <div className="surface-container p-10 rounded-[3rem] border border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter">Adjustment Matrix</h3>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-2">Identify hardware vector for manual override</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl text-primary">
                   <ArrowLeftRight size={24} />
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input 
                  placeholder="Search SKU or Serial..."
                  className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-6 pl-16 pr-8 text-sm font-black uppercase tracking-widest outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4">
                 <div className="space-y-4 text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Reason Codes
                   <div className="grid grid-cols-2 gap-3 pt-2">
                     {['Damage', 'Theft', 'Return', 'Discrepancy', 'Donation', 'Internal Use'].map(r => (
                       <button key={r} className="py-4 bg-white/5 border border-white/5 rounded-xl hover:border-primary/50 transition-all text-white/60">
                         {r}
                       </button>
                     ))}
                   </div>
                 </div>
                 <div className="space-y-4 text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Quantity Modifier
                    <div className="flex items-center gap-6 pt-2">
                       <input 
                         type="number"
                         placeholder="0"
                         className="flex-1 bg-black/40 border border-white/10 rounded-[1.5rem] py-6 text-center text-4xl font-black font-mono focus:border-primary outline-none"
                       />
                       <div className="w-[1px] h-12 bg-white/10" />
                       <div className="flex-1">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Current Stock</p>
                          <p className="text-2xl font-black font-mono">142 <span className="text-[10px] opacity-20">Units</span></p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="surface-container p-10 rounded-[3.5rem] border border-white/5">
              <h3 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                 <History size={20} className="text-white/20" /> Adjustment Ledger
              </h3>
              <div className="space-y-4">
                {recentAdjustments.map(adj => (
                  <div key={adj.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-6">
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${adj.change > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {adj.change > 0 ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase tracking-tight">{adj.product}</p>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1.5">{adj.reason}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="text-right">
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Impact</p>
                          <p className={`text-sm font-black font-mono ${adj.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {adj.change > 0 ? '+' : ''}{adj.change} Units
                          </p>
                       </div>
                       <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/20 text-[10px] font-black uppercase">
                         {adj.user.charAt(0)}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="col-span-12 md:col-span-4 space-y-8">
           <div className="surface-container p-10 rounded-[3rem] border border-white/5 bg-amber-500/5">
              <h3 className="text-lg font-black uppercase tracking-widest text-amber-500 flex items-center gap-3 font-serif italic">
                 <AlertTriangle size={20} /> Audit Lock
              </h3>
              <p className="mt-4 text-[10px] font-black text-amber-500/60 uppercase leading-relaxed tracking-widest">
                All manual corrections are logged in the Governance Vault with high-resolution forensics. Discrepancies exceeding 10% of node stock will trigger a physical cycle count request.
              </p>
           </div>

           <div className="surface-container p-10 rounded-[3rem] border border-white/5 space-y-8">
              <h3 className="text-lg font-black uppercase tracking-widest">Inventory Health</h3>
              <div className="flex items-center justify-between py-4 border-b border-white/5">
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Correction Velocity</span>
                 <span className="text-xs font-black uppercase text-green-500">Low (Safe)</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-white/5">
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Loss Valuation</span>
                 <span className="text-xs font-black font-mono">1.2k KD</span>
              </div>
              <div className="flex items-center justify-between py-4">
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Unresolved Skews</span>
                 <span className="text-xs font-black font-mono">14 Variants</span>
              </div>
              <div className="pt-6">
                 <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                   Full Reconciliation
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Save = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;

export default StockAdjustment;
