import React, { useState } from "react";
import api from "../../../api/client";
import { Search, RotateCcw, ShieldAlert, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export const ReturnsHub: React.FC = () => {
  const [invoiceId, setInvoiceId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundSale, setFoundSale] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const handleSearch = async () => {
    if (!invoiceId) return;
    setIsSearching(true);
    try {
      const { data } = await api.get(`/sales/lookup?q=${invoiceId}`);
      if (data) {
        setFoundSale(data);
        setSelectedItems(new Set());
      } else {
        toast.error("Manifest not found in system matrix");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Search Vector Failed");
      setFoundSale(null);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleItemSelection = (index: number) => {
    const newItems = new Set(selectedItems);
    if (newItems.has(index)) newItems.delete(index);
    else newItems.add(index);
    setSelectedItems(newItems);
  };

  const handleReturnAction = async () => {
    if (selectedItems.size === 0) {
      toast.error("Zero nodes selected for reversal");
      return;
    }

    setIsProcessing(true);
    try {
      const returnPayload = {
        saleId: foundSale._id,
        items: foundSale.items
          .filter((_: any, idx: number) => selectedItems.has(idx))
          .map((item: any) => ({
            productId: item.productId?._id || item.productId,
            variantId: item.variantId?._id || item.variantId,
            quantity: item.quantity,
            identifier: item.imei || item.serial,
            condition: 'restock', // Default for now
            price: item.price
          })),
        refundMethod: 'cash', // Default
        totalRefund: foundSale.items
          .filter((_: any, idx: number) => selectedItems.has(idx))
          .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
      };

      await api.post('/sales/returns', returnPayload);
      toast.success("Asset Reversal Successful", {
        description: "Inventory vectors updated for HQ Registry."
      });
      setFoundSale(null);
      setInvoiceId("");
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Reversal Logic Error");
    } finally {
      setIsProcessing(false);
    }
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
                    <p className="text-xl font-black text-white uppercase tracking-tighter">{foundSale.saleNumber || foundSale._id}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Total Value</p>
                    <p className="text-xl font-black text-primary font-mono">{foundSale.total.toFixed(3)} KD</p>
                 </div>
              </div>
              
              <div className="p-8 space-y-4">
                 {foundSale.items.map((item: any, idx: number) => (
                   <div 
                    key={idx} 
                    onClick={() => toggleItemSelection(idx)}
                    className={`p-4 border rounded-2xl flex items-center justify-between group transition-all cursor-pointer ${
                      selectedItems.has(idx) 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-white/5 border-white/5 hover:border-primary/30'
                    }`}
                   >
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedItems.has(idx) ? 'bg-primary text-white' : 'bg-white/5 text-white/40'}`}>
                            {selectedItems.has(idx) ? <CheckCircle2 size={18} /> : <FileText size={18} />}
                         </div>
                         <div>
                            <p className="text-sm font-black text-white uppercase tracking-tight">{item.productId?.name || 'Asset Entry'}</p>
                            {(item.imei || item.serial) && <p className="text-[8px] font-mono text-primary font-black mt-1">{item.imei || item.serial}</p>}
                         </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white/80 font-mono">{(item.price * item.quantity).toFixed(3)} KD</p>
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">{item.quantity} Unit(s)</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                 <button 
                  onClick={() => { setFoundSale(null); setInvoiceId(""); }}
                  className="text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-all"
                 >
                  Clear Search
                 </button>
                 <div className="flex gap-4">
                    <button 
                      onClick={handleReturnAction}
                      disabled={isProcessing || selectedItems.size === 0}
                      className="px-10 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:grayscale"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={16} /> : `Execute Return (${selectedItems.size} items)`}
                    </button>
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
