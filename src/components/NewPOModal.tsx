import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X, Plus, Search, Trash2, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface NewPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewPOModal: React.FC<NewPOModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [landedCosts, setLandedCosts] = useState({
    shipping: 0,
    customs: 0,
    insurance: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get('/api/suppliers');
      setSuppliers(res.data);
    } catch (error) {
      toast.error("Failed to fetch suppliers");
    }
  };

  const searchProducts = async (query: string) => {
    setSearch(query);
    if (query.length < 2) {
      setProducts([]);
      return;
    }
    try {
      const res = await axios.get(`/api/products/search?q=${query}`);
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addItem = (product: any) => {
    if (items.find(i => i.productId === product._id)) return;
    setItems([...items, {
      productId: product._id,
      name: product.name,
      quantity: 1,
      unitCost: product.cost || 0
    }]);
    setSearch("");
    setProducts([]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.productId !== id));
  };

  const updateItem = (id: string, field: string, value: number) => {
    setItems(items.map(i => i.productId === id ? { ...i, [field]: value } : i));
  };

  const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);
  const totalLanded = subtotal + landedCosts.shipping + landedCosts.customs + landedCosts.insurance;

  const handleSubmit = async () => {
    if (!selectedSupplier) return toast.error("Select a supplier");
    if (items.length === 0) return toast.error("Add at least one item");

    try {
      setIsSubmitting(true);
      await axios.post('/api/suppliers/purchase-orders', {
        supplierId: selectedSupplier,
        items,
        landedCostBreakdown: landedCosts
      });
      toast.success("Purchase Order created successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to create PO");
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
            className="relative bg-surface-container-lowest border border-border rounded-[4rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-12 border-b border-border flex items-start justify-between">
              <div>
                <h2 className="text-5xl font-serif italic tracking-tight leading-none">New Procurement</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Purchase Order Generation (ID 127)</p>
              </div>
              <button onClick={onClose} className="p-4 hover:bg-surface-container rounded-full text-muted-foreground transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 no-scrollbar">
              <div className="lg:col-span-8 space-y-10">
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">1. Select Vendor</label>
                  <select 
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full bg-surface border border-border p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all"
                  >
                    <option value="">Choose Supplier...</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">2. Add Line Items</label>
                  <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search Product Matrix..."
                      value={search}
                      onChange={(e) => searchProducts(e.target.value)}
                      className="w-full bg-surface border border-border pl-14 pr-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all"
                    />
                    <AnimatePresence>
                      {products.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 w-full bg-surface-container-lowest border border-border mt-2 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto no-scrollbar"
                        >
                          {products.map(p => (
                            <div 
                              key={p._id}
                              onClick={() => addItem(p)}
                              className="p-4 hover:bg-muted cursor-pointer text-[10px] font-black uppercase tracking-widest flex justify-between items-center group/item"
                            >
                              <span className="group-hover/item:text-primary transition-colors">{p.name}</span>
                              <span className="text-primary font-mono font-black">{p.cost?.toFixed(3) || '0.000'} KD</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.productId} className="flex items-center gap-4 p-6 bg-surface border border-border rounded-2xl group">
                        <div className="flex-1">
                          <p className="text-[10px] font-black uppercase tracking-widest">{item.name}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Qty</span>
                            <input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => updateItem(item.productId, 'quantity', parseInt(e.target.value))}
                              className="w-20 bg-muted border border-border p-2 rounded-lg text-center font-mono font-black text-xs"
                            />
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Unit Cost</span>
                            <input 
                              type="number" 
                              value={item.unitCost}
                              onChange={(e) => updateItem(item.productId, 'unitCost', parseFloat(e.target.value))}
                              className="w-28 bg-muted border border-border p-2 rounded-lg text-center font-mono font-black text-xs"
                            />
                          </div>
                          <button onClick={() => removeItem(item.productId)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className="bg-surface border border-border p-8 rounded-[3rem] space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-3">
                    <Calculator size={14} /> Landed Cost Matrix
                  </h3>
                  <div className="space-y-6">
                    {['shipping', 'customs', 'insurance'].map(field => (
                      <div key={field} className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest ml-2 opacity-60">{field}</label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-mono font-black opacity-40">KD</span>
                          <input 
                            type="number" 
                            value={(landedCosts as any)[field]}
                            onChange={(e) => setLandedCosts({ ...landedCosts, [field]: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-muted border border-border pl-10 pr-4 py-3 rounded-xl text-xs font-mono font-black outline-none focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Subtotal</span>
                      <span className="text-sm font-mono font-black">{subtotal.toFixed(3)} KD</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Overhead</span>
                      <span className="text-sm font-mono font-black">{(totalLanded - subtotal).toFixed(3)} KD</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <span className="text-xs font-black uppercase tracking-widest text-primary">Total Landed</span>
                      <span className="text-2xl font-mono font-black text-primary">{totalLanded.toFixed(3)} KD</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-foreground text-background py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-2xl shadow-foreground/20"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize PO"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
