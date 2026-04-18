import React, { useState } from "react";
import { Gift, Star, CreditCard, ArrowUpRight, Search, PlusCircle, History } from "lucide-react";
import { motion } from "motion/react";

export const GiftsLoyalty: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'gifts' | 'loyalty'>('gifts');

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif italic text-white leading-tight">Gifts & Loyalty</h2>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Value & Reward Synapse</p>
        </div>
        
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
           {[
             { id: 'gifts', label: 'GIFT CARDS', icon: Gift },
             { id: 'loyalty', label: 'LOYALTY NODES', icon: Star }
           ].map((seg) => (
             <button
               key={seg.id}
               onClick={() => setActiveSegment(seg.id as any)}
               className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${
                 activeSegment === seg.id 
                 ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                 : 'text-white/20 hover:text-white/40'
               }`}
             >
               <seg.icon size={16} />
               <span className="text-[9px] font-black uppercase tracking-widest">{seg.label}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
         <div className="col-span-8 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
            {activeSegment === 'gifts' ? (
              <>
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-white/10 rounded-[2.5rem] relative overflow-hidden group hover:from-indigo-500/30 transition-all cursor-pointer">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                         <CreditCard size={120} />
                      </div>
                      <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Issued Capital</h4>
                      <h2 className="text-4xl font-black text-white font-mono leading-none">8,420.000 <span className="text-sm">KD</span></h2>
                      <div className="flex items-center gap-2 mt-8">
                         <div className="w-2 h-2 rounded-full bg-emerald-500" />
                         <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Active Reserve</span>
                      </div>
                   </div>
                   <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center space-y-6 group hover:bg-white/[0.08] transition-all cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                         <PlusCircle size={32} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Issue New Voucher</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between px-2">
                      <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Active Ledger</h4>
                      <button className="text-[8px] font-black text-primary uppercase tracking-widest hover:underline">View All Records</button>
                   </div>
                   {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-white/20 transition-all">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-all">
                              <Gift size={24} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-white uppercase tracking-widest">GC-8822-110{i}</p>
                              <p className="text-[8px] font-black text-white/20 uppercase mt-1">Expiry: Dec 2024</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-black text-white font-mono">15.000 <span className="text-[9px]">KD</span></p>
                           <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest mt-1">Available</p>
                        </div>
                     </div>
                   ))}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/10 rounded-[3rem]">
                 <Star size={64} className="mb-6" />
                 <p className="text-sm font-black uppercase tracking-[0.6em]">Loyalty Engine Synchronization Pending</p>
              </div>
            )}
         </div>

         <div className="col-span-4 bg-white/5 border border-white/5 rounded-[3rem] p-8 space-y-8 flex flex-col">
            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Verification Hub</h4>
            
            <div className="space-y-4">
               <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">Card / Ref Number</label>
               <div className="relative">
                  <input 
                    type="text" 
                    placeholder="ENTER CODE..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[12px] font-black tracking-[0.4em] text-center text-white placeholder:text-white/10 outline-none focus:border-primary transition-all"
                  />
               </div>
               <button className="w-full py-5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Validate & Check Balance
               </button>
            </div>

            <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-center">
               <History size={32} className="text-white/10" />
               <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-relaxed">Scan card or enter reference above to pull historic value nodes</p>
            </div>
         </div>
      </div>
    </div>
  );
};
