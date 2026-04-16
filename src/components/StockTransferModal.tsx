import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ArrowRightLeft, Plus, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [fromStore, setFromStore] = useState('');
  const [toStore, setToStore] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const res = await axios.get(`/api/products?search=${searchTerm}`);
          setSearchResults(res.data.products || res.data);
        } catch (e) {
          console.error(e);
        }
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const addItem = (product: any) => {
    if (product.stock <= 0) {
      toast.error(`Cannot transfer ${product.name}. Stock is zero.`);
      return;
    }
    const existing = items.find(i => i._id === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`Cannot add more. Max stock reached (${product.stock}).`);
        return;
      }
      setItems(items.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { ...product, quantity: 1 }]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQuantity = (id: string, qty: number, maxStock: number) => {
    if (qty > maxStock) {
      toast.error(`Insufficient stock. Max available: ${maxStock}`);
      return;
    }
    if (qty <= 0) {
      setItems(items.filter(i => i._id !== id));
    } else {
      setItems(items.map(i => i._id === id ? { ...i, quantity: qty } : i));
    }
  };

  const handleSubmit = async () => {
    if (!fromStore || !toStore || items.length === 0) {
      toast.error("Please fill all fields and add items.");
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post('/api/inventory/transfers', {
        fromStore,
        toStore,
        items: items.map(i => ({ productId: i._id, quantity: i.quantity })),
        status: 'pending'
      });
      toast.success("Transfer request created successfully.");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create transfer.");
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
                <h2 className="text-5xl font-serif italic tracking-tight leading-none">Stock Transfer</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Inter-Store Logistics (ID 145)</p>
              </div>
              <button onClick={onClose} className="p-4 hover:bg-surface-container rounded-full text-muted-foreground transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Source Store</label>
                  <select 
                    value={fromStore}
                    onChange={(e) => setFromStore(e.target.value)}
                    className="w-full bg-white/5 border border-border rounded-2xl p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary"
                  >
                    <option value="">Select Source...</option>
                    <option value="Main Warehouse">Main Warehouse</option>
                    <option value="Store A">Store A</option>
                    <option value="Store B">Store B</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Destination Store</label>
                  <select 
                    value={toStore}
                    onChange={(e) => setToStore(e.target.value)}
                    className="w-full bg-white/5 border border-border rounded-2xl p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary"
                  >
                    <option value="">Select Destination...</option>
                    <option value="Main Warehouse">Main Warehouse</option>
                    <option value="Store A">Store A</option>
                    <option value="Store B">Store B</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 mb-3 block">Search Items to Transfer</label>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={20} />
                  <input 
                    type="text"
                    placeholder="Search by SKU or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-border rounded-2xl pl-16 pr-6 py-5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="absolute z-50 top-full left-0 w-full mt-2 bg-surface-container border border-border rounded-3xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                    {searchResults.map(p => (
                      <button 
                        key={p._id}
                        onClick={() => addItem(p)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                      >
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest">{p.name}</p>
                          <p className="text-[9px] font-mono text-muted-foreground">{p.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] font-black ${p.stock <= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {p.stock} In Stock
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Transfer Manifest</h3>
                {items.length === 0 ? (
                  <div className="p-12 border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center opacity-20">
                    <ArrowRightLeft size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No items added to manifest</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item._id} className="p-6 bg-white/5 border border-border rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                            <Plus size={20} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-widest">{item.name}</p>
                            <p className="text-[9px] font-mono text-muted-foreground">Max Stock: {item.stock}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="flex items-center bg-white/5 border border-border rounded-xl overflow-hidden">
                            <button onClick={() => updateQuantity(item._id, item.quantity - 1, item.stock)} className="p-3 hover:bg-white/5 text-muted-foreground"><X size={14} /></button>
                            <input 
                              type="number" 
                              value={item.quantity} 
                              onChange={(e) => updateQuantity(item._id, parseInt(e.target.value), item.stock)}
                              className="w-16 bg-transparent text-center text-[11px] font-black font-mono outline-none"
                            />
                            <button onClick={() => updateQuantity(item._id, item.quantity + 1, item.stock)} className="p-3 hover:bg-white/5 text-muted-foreground"><Plus size={14} /></button>
                          </div>
                          <button onClick={() => updateQuantity(item._id, 0, item.stock)} className="p-3 text-red-500/40 hover:text-red-500 transition-colors">
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
                className="flex-1 py-6 border border-border rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || items.length === 0}
                className="flex-1 py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Authorize Transfer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
