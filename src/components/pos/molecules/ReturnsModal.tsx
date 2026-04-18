import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, RotateCcw, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface ReturnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReturnsModal: React.FC<ReturnsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [saleNumber, setSaleNumber] = useState("");
  const [sale, setSale] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [returnReasons, setReturnReasons] = useState<Record<string, string>>({});
  const [returnCondition, setReturnCondition] = useState<Record<string, 'restock' | 'defective'>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSale = async () => {
    if (!saleNumber) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/sales/search?number=${saleNumber}`);
      if (response.data) {
        setSale(response.data);
      } else {
        toast.error("Sale not found in registry");
      }
    } catch (error) {
      toast.error("Vector identification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    const itemsToReturn = Object.entries(selectedItems)
      .filter(([_, selected]) => selected)
      .map(([itemId, _]) => {
        const item = sale.items.find((i: any) => i._id === itemId);
        return {
          productId: item.productId,
          variantId: item.variantId,
          identifier: item.imei,
          quantity: item.quantity,
          price: item.price,
          reason: returnReasons[itemId] || "Customer Return",
          condition: returnCondition[itemId] || "restock"
        };
      });

    if (itemsToReturn.length === 0) {
      toast.error("Select at least one entity to return");
      return;
    }

    try {
      setIsProcessing(true);
      const totalRefund = itemsToReturn.reduce((sum, item) => sum + item.price, 0);
      
      await axios.post('/api/pos-returns', {
        saleId: sale._id,
        items: itemsToReturn,
        refundMethod: 'cash', 
        totalRefund
      });

      toast.success("Return protocol executed");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Protocol failure: Return rejected");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
              <div>
                <h2 className="text-3xl font-serif italic tracking-tight text-white leading-none">Reverse Matrix</h2>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-3 leading-none">Exchange & Returns Engine (ID 17, 18, 21)</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-foreground transition-colors" size={18} />
                  <input 
                    type="text"
                    value={saleNumber}
                    onChange={(e) => setSaleNumber(e.target.value)}
                    placeholder="IDENTIFY RECEIPT VECTOR / SKU..."
                    className="w-full bg-white/[0.02] border border-white/5 pl-14 pr-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:border-primary-foreground/40 transition-all placeholder:text-white/10 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && fetchSale()}
                    autoFocus
                  />
                </div>
                <button 
                  onClick={fetchSale}
                  disabled={isLoading}
                  className="px-8 bg-primary-foreground/20 text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-foreground hover:text-white active:scale-[0.98] transition-all disabled:opacity-20"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Identify Node"}
                </button>
              </div>

              {sale && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex items-center justify-between shadow-inner">
                    <div>
                      <p className="text-[8px] font-black text-primary-foreground uppercase tracking-widest mb-1 leading-none">Operator Presence</p>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-white/80">{sale.customerId?.name || "ANONYMOUS VECTOR"}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-mono text-white/10 uppercase tracking-widest">{new Date(sale.createdAt).toLocaleString()}</p>
                      <p className="text-xl font-black text-primary-foreground mt-1">{sale.total.toFixed(3)} KD</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10 text-center mb-4 leading-none">Vector Neutralization Grid</p>
                    {sale.items.map((item: any) => (
                      <div key={item._id} className={`p-5 border rounded-2xl transition-all flex items-center gap-6 ${selectedItems[item._id] ? 'bg-primary-foreground/10 border-primary-foreground/40' : 'bg-white/[0.01] border-white/5 opacity-40 hover:opacity-100 hover:bg-white/[0.03]'}`}>
                        <div className="relative">
                           <input 
                             type="checkbox"
                             checked={!!selectedItems[item._id]}
                             onChange={(e) => setSelectedItems(prev => ({ ...prev, [item._id]: e.target.checked }))}
                             className="w-5 h-5 rounded-md accent-primary-foreground cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                           />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-black uppercase tracking-tight text-white/80 leading-none">{item.productId?.name}</p>
                          <p className="text-[9px] font-mono text-white/20 tracking-widest uppercase mt-1 leading-none">{item.imei || item.variantId?.sku || "GENERIC_NODE"}</p>
                        </div>
                        
                        {selectedItems[item._id] && (
                          <div className="flex gap-2">
                            <select 
                              value={returnCondition[item._id] || 'restock'}
                              onChange={(e) => setReturnCondition(prev => ({ ...prev, [item._id]: e.target.value as any }))}
                              className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-[8px] font-black uppercase tracking-widest outline-none text-white/60 focus:border-primary-foreground/40"
                            >
                              <option value="restock">RESTOCK</option>
                              <option value="defective">DEFECTIVE</option>
                            </select>
                            <input 
                              type="text"
                              value={returnReasons[item._id] || ""}
                              onChange={(e) => setReturnReasons(prev => ({ ...prev, [item._id]: e.target.value }))}
                              placeholder="VECTOR REASON..."
                              className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-[8px] font-black uppercase tracking-widest outline-none w-32 text-white placeholder:text-white/10 focus:border-primary-foreground/40"
                            />
                          </div>
                        )}
                        <div className="text-right font-mono font-black text-[12px] text-white/40">
                          {item.price.toFixed(3)} KD
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3 text-amber-400 opacity-60">
                <AlertCircle size={16} />
                <p className="text-[8px] font-black uppercase tracking-[0.2em]">Registry reconciliation active // sync enabled</p>
              </div>
              <button 
                onClick={handleReturn}
                disabled={isProcessing || !sale}
                className="px-10 py-5 bg-primary-foreground text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary-foreground/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 flex items-center gap-3"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw size={16} />}
                Neutralize Vector
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
