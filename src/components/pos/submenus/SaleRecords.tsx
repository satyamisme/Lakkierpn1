import React, { useState } from "react";
import { Search, FileText, Download, Printer, Eye, Filter, Calendar } from "lucide-react";
import { motion } from "motion/react";

export const SaleRecords: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const dummySales = [
    { id: "INV-2024-001", customer: "Walking Client", total: 45.000, date: "2024-03-20 14:30", items: 2, method: "Cash" },
    { id: "INV-2024-002", customer: "Ahmed Q.", total: 320.500, date: "2024-03-20 12:15", items: 1, method: "KNET" },
    { id: "INV-2024-003", customer: "Sarah M.", total: 12.000, date: "2024-03-19 18:45", items: 4, method: "KNET" },
    { id: "INV-2024-004", customer: "Walking Client", total: 85.000, date: "2024-03-19 11:20", items: 1, method: "Cash" },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic text-white leading-none">Sale Records</h2>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-3">Transaction Manifest Archive</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input 
                type="text" 
                placeholder="SEARCH INVOICE / CLIENT..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[9px] font-black tracking-widest text-white placeholder:text-white/10 focus:border-primary outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
              <Filter size={16} />
           </button>
           <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
              <Calendar size={16} />
           </button>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col min-h-0 flex-1">
        <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-white/[0.03] border-b border-white/5">
           <div className="col-span-2 text-[8px] font-black text-white/20 uppercase tracking-widest">Archive ID</div>
           <div className="col-span-3 text-[8px] font-black text-white/20 uppercase tracking-widest">Entity / Client</div>
           <div className="col-span-2 text-[8px] font-black text-white/20 uppercase tracking-widest">Temporal Vector</div>
           <div className="col-span-2 text-[8px] font-black text-white/20 uppercase tracking-widest">Fiscal Value</div>
           <div className="col-span-1 text-[8px] font-black text-white/20 uppercase tracking-widest text-center">Payload</div>
           <div className="col-span-2 text-[8px] font-black text-white/20 uppercase tracking-widest text-right">Actions</div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-4 space-y-2">
           {dummySales.map((sale) => (
             <motion.div 
               key={sale.id}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl items-center group hover:bg-white/[0.08] hover:border-primary/30 transition-all cursor-pointer"
             >
                <div className="col-span-2">
                   <p className="text-[10px] font-black text-white uppercase tracking-tight">{sale.id}</p>
                </div>
                <div className="col-span-3">
                   <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{sale.customer}</p>
                   <p className="text-[8px] font-black text-white/20 uppercase mt-0.5">{sale.method}</p>
                </div>
                <div className="col-span-2">
                   <p className="text-[9px] font-black text-white/40 uppercase tracking-tighter">{sale.date}</p>
                </div>
                <div className="col-span-2">
                   <p className="text-[12px] font-black text-primary font-mono">{sale.total.toFixed(3)} <span className="text-[8px]">KD</span></p>
                </div>
                <div className="col-span-1 text-center">
                   <div className="inline-block px-2 py-0.5 bg-primary/10 rounded text-[7px] font-black text-primary uppercase">
                      {sale.items} SKUs
                   </div>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                   <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all">
                      <Eye size={14} />
                   </button>
                   <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all">
                      <Printer size={14} />
                   </button>
                   <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all">
                      <Download size={14} />
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};
