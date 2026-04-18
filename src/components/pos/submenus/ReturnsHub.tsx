import React, { useState } from "react";
import { Search, RotateCcw, ShieldAlert, FileText, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const ReturnsHub: React.FC = () => {
  const [invoiceId, setInvoiceId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundSale, setFoundSale] = useState<any | null>(null);

  const handleSearch = () => {
    if (!invoiceId) return;
    setIsSearching(true);
    // Simulate lookup
    setTimeout(() => {
      setFoundSale({
        id: invoiceId,
        date: "2024-03-15",
        total: 245.500,
        items: [
           { id: 1, name: "iPhone 15 Pro", price: 230.000, serial: "IMEI-8822-11" },
           { id: 2, name: "Silicon Case", price: 15.500 }
        ]
      });
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif italic text-white leading-tight">Returns Hub</h2>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Reversal & Asset Recovery</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
              <ShieldAlert size={16} className="text-amber-500" />
              <div>
                <p className="text-[6px] font-black text-amber-500/40 uppercase tracking-widest">Active Policy</p>
                <p className="text-[9px] font-black text-amber-500 uppercase">14-Day Warranty Reversal</p>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-6">
        <div className="relative group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
           <input 
             type="text" 
             placeholder="SCAN RECEIPT OR ENTER INVOICE / IMEI..."
             className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-sm font-black tracking-[0.2em] text-white placeholder:text-white/10 focus:border-primary focus:bg-white/[0.05] outline-none transition-all shadow-2xl"
             value={invoiceId}
             onChange={(e) => setInvoiceId(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
           />
           <button 
             onClick={handleSearch}
             className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
           >
             {isSearching ? <RotateCcw size={14} className="animate-spin" /> : "LOCATE"}
           </button>
        </div>

        <AnimatePresence mode="wait">
          {foundSale ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                 <div>
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Invoice Record</h4>
                    <p className="text-xl font-black text-white uppercase tracking-tighter">{foundSale.id}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Total Value</p>
                    <p className="text-xl font-black text-primary font-mono">{foundSale.total.toFixed(3)} KD</p>
                 </div>
              </div>
              
              <div className="p-8 space-y-4">
                 {foundSale.items.map((item: any) => (
                   <div key={item.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                            <FileText size={18} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-white uppercase tracking-tight">{item.name}</p>
                            {item.serial && <p className="text-[8px] font-mono text-primary font-black mt-1">{item.serial}</p>}
                         </div>
                      </div>
                      <button className="px-4 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                         Select For Return
                      </button>
                   </div>
                 ))}
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-between">
                 <button className="text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-all">Clear Search</button>
                 <div className="flex gap-4">
                    <button className="px-8 py-3 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">Void entire sale</button>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/10 rounded-[3rem]">
               <RotateCcw size={64} className="mb-6" />
               <p className="text-sm font-black uppercase tracking-[0.6em]">Awaiting Sale Identification</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
