import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X, Package, Search, Plus, Trash2, CheckCircle2, AlertTriangle, Scan } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface StockIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StockIntakeModal: React.FC<StockIntakeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else if (searchQuery.length === 0) {
      handleSearch();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      handleSearch();
    }
  }, [isOpen]);

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const response = await axios.get(`/api/products/search?q=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addItem = (product: any) => {
    const existing = selectedItems.find(item => item._id === product._id);
    if (existing) {
      setSelectedItems(selectedItems.map(item => 
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setSelectedItems([...selectedItems, { ...product, quantity: 1, serials: [] }]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item._id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setSelectedItems(selectedItems.map(item => 
      item._id === id ? { ...item, quantity: Math.max(1, qty) } : item
    ));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected for intake.");
      return;
    }

    setIsSubmitting(true);
    try {
      // For each item, update stock and IMEI history
      await Promise.all(selectedItems.map(item => 
        axios.patch(`/api/products/${item._id}/stock`, { 
          stock: item.stock + item.quantity,
          imeiHistory: item.isImeiRequired ? [...(item.imeiHistory || []), ...(item.serials || [])] : item.imeiHistory,
          newSerials: item.isImeiRequired ? item.serials : []
        })
      ));

      toast.success("Stock intake processed successfully.");
      if (onSuccess) onSuccess();
      onClose();
      setSelectedItems([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to process intake.");
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
            <div className="absolute top-0 left-0 w-full h-3 bg-primary" />
            
            <div className="p-12 border-b border-border flex items-start justify-between">
              <div>
                <h2 className="text-5xl font-serif italic tracking-tight leading-none">Stock Intake</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Receive Assets into Global Matrix (ID 129)</p>
              </div>
              <button onClick={onClose} className="p-4 hover:bg-surface-container rounded-full text-muted-foreground transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar">
              {/* Search Section */}
              <div className="relative">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 mb-3 block opacity-60">Search Product to Add</label>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={20} />
                  <input 
                    type="text"
                    placeholder="Search by Name, SKU or Scan Barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface border border-border rounded-[1.5rem] py-5 pl-16 pr-8 text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all shadow-inner"
                  />
                  {isSearching && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-primary" size={20} />}
                </div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-full mt-4 bg-surface-container-lowest border border-border rounded-[2rem] shadow-2xl z-50 overflow-hidden"
                    >
                      {searchResults.map((p) => (
                        <button 
                          key={p._id}
                          onClick={() => addItem(p)}
                          className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-colors border-b border-border last:border-0 text-left group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden border border-border">
                              <img src={p.image || `https://picsum.photos/seed/${p.sku}/100/100`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{p.name}</p>
                              <p className="text-[9px] font-mono text-muted-foreground font-bold">{p.sku}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Current Stock</p>
                            <p className="text-sm font-black font-mono">{p.stock}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected Items Table */}
              <div className="space-y-6">
                <h3 className="text-xl font-serif italic flex items-center gap-3">
                  <Package size={20} className="text-primary" />
                  Intake Manifest
                </h3>
                
                {selectedItems.length === 0 ? (
                  <div className="py-20 border border-dashed border-border rounded-[3rem] text-center opacity-30">
                    <Scan size={48} className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No items staged for intake</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedItems.map((item) => (
                      <div key={item._id} className="p-6 bg-surface border border-border rounded-[2rem] flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-muted rounded-2xl overflow-hidden border border-border">
                            <img src={item.image || `https://picsum.photos/seed/${item.sku}/100/100`} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-tighter">{item.name}</p>
                            <p className="text-[9px] font-mono text-muted-foreground font-bold">{item.sku}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-10">
                          {item.isImeiRequired && (
                            <div className="flex flex-col gap-2">
                              <label className="text-[8px] font-black uppercase tracking-widest text-indigo-500">IMEI/Serial Required</label>
                              <input 
                                type="text"
                                placeholder="Scan or Enter Serial..."
                                value={item.serials?.join(', ') || ''}
                                onChange={(e) => {
                                  const serials = e.target.value.split(',').map(s => s.trim());
                                  setSelectedItems(selectedItems.map(si => 
                                    si._id === item._id ? { ...si, serials, quantity: serials.length || 1 } : si
                                  ));
                                }}
                                className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-2 text-[10px] font-mono font-black outline-none focus:ring-2 ring-indigo-500/20 w-48"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-xl border border-border">
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                            >
                              -
                            </button>
                            <input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                              className="w-12 bg-transparent text-center font-mono font-black text-xs outline-none"
                            />
                            <button 
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(item._id)}
                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-12 border-t border-border bg-surface-container-lowest flex gap-6">
              <button 
                onClick={onClose}
                className="flex-1 py-6 border border-border rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-surface-container transition-all active:scale-95"
              >
                Discard Manifest
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || selectedItems.length === 0}
                className="flex-1 py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <CheckCircle2 size={20} /> Commit to Inventory
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
