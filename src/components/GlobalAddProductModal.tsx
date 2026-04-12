import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X, Plus, Package, Tag, Layers, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import axios from 'axios';

interface GlobalAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GlobalAddProductModal: React.FC<GlobalAddProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "Accessories",
    price: 0,
    cost: 0,
    stock: 0,
    isImeiRequired: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/products', newProduct);
      if (response.status === 201) {
        setNewProduct({ name: "", sku: "", category: "Accessories", price: 0, cost: 0, stock: 0, isImeiRequired: false });
        toast.success("Product registered successfully in the global matrix.");
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("Add product error:", error);
      toast.error(`Error: ${error.response?.data?.error || 'Failed to register product'}`);
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
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-surface-container-lowest border border-border rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-3 bg-primary" />
            
            {/* Background Accents */}
            <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none rotate-12">
              <Package size={300} />
            </div>

            <div className="p-16 relative z-10">
              <div className="flex items-start justify-between mb-12">
                <div>
                  <h2 className="text-6xl font-serif italic tracking-tight leading-none">Register Asset</h2>
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">Enterprise Inventory Ingestion</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setNewProduct({
                      name: "Dry Run Product " + Math.floor(Math.random() * 1000),
                      sku: "DRY-" + Math.random().toString(36).substring(7).toUpperCase(),
                      category: "Accessories",
                      price: 15.500,
                      cost: 10.000,
                      stock: 50,
                      isImeiRequired: false
                    })}
                    className="px-5 py-2.5 bg-yellow-500/5 text-yellow-600 border border-yellow-500/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-yellow-500 hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    Dry Run Data
                  </button>
                  <button 
                    onClick={onClose} 
                    className="p-4 hover:bg-surface-container rounded-full text-muted-foreground transition-all active:scale-90"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60 flex items-center gap-2">
                      <Smartphone size={12} className="text-primary" /> Product Identity
                    </label>
                    <input 
                      required
                      placeholder="e.g. iPhone 15 Pro"
                      value={newProduct.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        // Enhanced Auto-SKU Generation (ID 159)
                        let sku = newProduct.sku;
                        if (name.length >= 3 && (!newProduct.sku || newProduct.sku.startsWith(newProduct.name.substring(0, 3).toUpperCase()))) {
                          const prefix = name.substring(0, 3).toUpperCase();
                          const random = Math.floor(1000 + Math.random() * 9000);
                          sku = `${prefix}-${random}`;
                        }
                        setNewProduct({...newProduct, name, sku});
                      }}
                      className="w-full bg-surface border border-border rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60 flex items-center gap-2">
                      <Tag size={12} className="text-primary" /> SKU / Model ID
                    </label>
                    <input 
                      required
                      placeholder="e.g. IP15P-128-BL"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                      className="w-full bg-surface border border-border rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60 flex items-center gap-2">
                      <Layers size={12} className="text-primary" /> Classification
                    </label>
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full bg-surface border border-border rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none shadow-inner cursor-pointer"
                    >
                      <option>Phones</option>
                      <option>Accessories</option>
                      <option>Parts</option>
                      <option>Services</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60">Initial Stock Level</label>
                    <input 
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                      className="w-full bg-surface border border-border rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-mono shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60">Acquisition Cost (KD)</label>
                    <input 
                      type="number"
                      step="0.001"
                      required
                      value={newProduct.cost}
                      onChange={(e) => setNewProduct({...newProduct, cost: parseFloat(e.target.value)})}
                      className="w-full bg-surface border border-border rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-mono shadow-inner"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60">Retail Price (KD)</label>
                    <input 
                      type="number"
                      step="0.001"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                      className="w-full bg-surface border border-border rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-mono shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 p-8 bg-primary/5 border border-primary/10 rounded-[2rem] group hover:bg-primary/10 transition-all duration-500">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox"
                      id="globalImeiReq"
                      checked={newProduct.isImeiRequired}
                      onChange={(e) => setNewProduct({...newProduct, isImeiRequired: e.target.checked})}
                      className="w-6 h-6 accent-primary rounded-lg cursor-pointer"
                    />
                  </div>
                  <label htmlFor="globalImeiReq" className="text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer select-none text-foreground/80 group-hover:text-primary transition-colors">
                    Strict IMEI/Serial Tracking Required for this Asset
                  </label>
                </div>

                <div className="flex gap-6 pt-10">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-6 border border-border rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-surface-container transition-all active:scale-95"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <CheckCircle2 size={20} /> Register Asset
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
