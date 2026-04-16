import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Loader2, RotateCcw, Package, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface ProcessReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ProcessReturnModal: React.FC<ProcessReturnModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [sale, setSale] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refundMethod, setRefundMethod] = useState('cash');

  const handleLookup = async () => {
    if (!searchQuery) return;
    try {
      setIsSearching(true);
      const res = await axios.get(`/api/sales/lookup?q=${searchQuery}`);
      setSale(res.data);
      setSelectedItems([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Sale not found");
      setSale(null);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleItemSelection = (item: any) => {
    const isSelected = selectedItems.find(si => si.productId === item.productId && si.imei === item.imei);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(si => !(si.productId === item.productId && si.imei === item.imei)));
    } else {
      setSelectedItems([...selectedItems, { 
        ...item, 
        reason: 'Customer Request', 
        condition: 'restock',
        refundPrice: item.price 
      }]);
    }
  };

  const updateSelectedItem = (productId: string, imei: string | undefined, field: string, value: any) => {
    setSelectedItems(selectedItems.map(si => 
      (si.productId === productId && si.imei === imei) ? { ...si, [field]: value } : si
    ));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected for return");
      return;
    }

    setIsSubmitting(true);
    try {
      const totalRefund = selectedItems.reduce((sum, item) => sum + item.refundPrice, 0);
      
      const returnData = {
        saleId: sale._id,
        items: selectedItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          identifier: item.imei,
          quantity: item.quantity,
          price: item.refundPrice,
          reason: item.reason,
          condition: item.condition
        })),
        refundMethod,
        totalRefund
      };

      await axios.post('/api/sales/returns', returnData);
      toast.success("Return processed successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to process return");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-3xl"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative bg-surface-container-lowest border border-border rounded-[4rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-12 border-b border-border flex items-start justify-between">
              <div>
                <h2 className="text-5xl font-serif italic tracking-tight leading-none">Process Return</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Reverse Logistics Orchestration</p>
              </div>
              <button onClick={onClose} className="p-4 hover:bg-surface-container rounded-full text-muted-foreground transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar">
              {/* Lookup Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 block opacity-60">Find Original Sale</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={20} />
                    <input 
                      type="text"
                      placeholder="Enter Invoice # or Scan IMEI..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                      className="w-full bg-surface border border-border rounded-[1.5rem] py-5 pl-16 pr-8 text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all shadow-inner"
                    />
                  </div>
                  <button 
                    onClick={handleLookup}
                    disabled={isSearching}
                    className="px-8 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="animate-spin" /> : "Lookup"}
                  </button>
                </div>
              </div>

              {sale && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 bg-surface border border-border rounded-[2.5rem] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Sale Details</p>
                      <h4 className="text-xl font-black uppercase tracking-tighter">{sale.saleNumber}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground">{new Date(sale.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Paid</p>
                      <p className="text-2xl font-black font-mono text-primary">{sale.total.toFixed(3)} KD</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-serif italic flex items-center gap-3">
                      <Package size={20} className="text-primary" />
                      Select Items to Return
                    </h3>
                    <div className="space-y-4">
                      {sale.items.map((item: any, idx: number) => {
                        const isSelected = selectedItems.find(si => si.productId === item.productId && si.imei === item.imei);
                        return (
                          <div 
                            key={`${item.productId}-${item.imei || idx}`}
                            className={`p-6 border rounded-[2rem] transition-all cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary/30'}`}
                            onClick={() => toggleItemSelection(item)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                  {isSelected ? <CheckCircle2 size={20} /> : <Package size={20} />}
                                </div>
                                <div>
                                  <p className="text-xs font-black uppercase tracking-tighter">Product ID: {item.productId}</p>
                                  {item.imei && <p className="text-[10px] font-mono font-bold text-muted-foreground">IMEI: {item.imei}</p>}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black font-mono">{item.price.toFixed(3)} KD</p>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Qty: {item.quantity}</p>
                              </div>
                            </div>

                            {isSelected && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-6 pt-6 border-t border-primary/20 grid grid-cols-3 gap-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="space-y-1.5">
                                  <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-2">Return Reason</label>
                                  <select 
                                    value={isSelected.reason}
                                    onChange={(e) => updateSelectedItem(item.productId, item.imei, 'reason', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-primary"
                                  >
                                    <option value="Customer Request">Customer Request</option>
                                    <option value="Defective">Defective</option>
                                    <option value="Wrong Item">Wrong Item</option>
                                    <option value="Damaged">Damaged</option>
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-2">Condition</label>
                                  <select 
                                    value={isSelected.condition}
                                    onChange={(e) => updateSelectedItem(item.productId, item.imei, 'condition', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-primary"
                                  >
                                    <option value="restock">Restock (Sellable)</option>
                                    <option value="defective">Defective (RMA)</option>
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-2">Refund Amount</label>
                                  <input 
                                    type="number"
                                    value={isSelected.refundPrice}
                                    onChange={(e) => updateSelectedItem(item.productId, item.imei, 'refundPrice', parseFloat(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-primary font-mono"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="p-8 bg-surface-container border border-border rounded-[2.5rem] space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-serif italic">Refund Summary</h4>
                        <div className="flex gap-2">
                          {['cash', 'card', 'store_credit'].map(m => (
                            <button 
                              key={m}
                              onClick={() => setRefundMethod(m)}
                              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${refundMethod === m ? 'bg-primary text-primary-foreground' : 'bg-surface border border-border text-muted-foreground'}`}
                            >
                              {m.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-end justify-between border-t border-border pt-6">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Refund</p>
                          <p className="text-4xl font-black font-mono text-primary">
                            {selectedItems.reduce((sum, item) => sum + item.refundPrice, 0).toFixed(3)} KD
                          </p>
                        </div>
                        <button 
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="px-10 py-5 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 flex items-center gap-4 hover:scale-105 active:scale-95 transition-all"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin" /> : (
                            <>
                              <RotateCcw size={18} /> Complete Return
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
