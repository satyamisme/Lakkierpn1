import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X, Plus, Package, Tag, Layers, Smartphone } from 'lucide-react';

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
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newProduct)
      });
      if (response.ok) {
        setNewProduct({ name: "", sku: "", category: "Accessories", price: 0, cost: 0, stock: 0, isImeiRequired: false });
        if (onSuccess) onSuccess();
        onClose();
        alert("Product registered successfully in the global matrix.");
      } else {
        const err = await response.json();
        alert(`Error: ${err.error || 'Failed to register product'}`);
      }
    } catch (error) {
      console.error("Add product error:", error);
      alert("Network error: Failed to reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card border border-border p-8 rounded-[3rem] shadow-2xl w-full max-w-xl relative overflow-hidden"
          >
            {/* Background Accents */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Package size={200} />
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-serif italic tracking-tight">Register Asset</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">Enterprise Inventory Ingestion</p>
              </div>
              <div className="flex items-center gap-2">
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
                  className="px-3 py-1.5 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-white transition-all"
                >
                  Dry Run Data
                </button>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Smartphone size={10} /> Product Identity
                  </label>
                  <input 
                    required
                    placeholder="e.g. iPhone 15 Pro"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-muted/50 border border-border p-4 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Tag size={10} /> SKU / Model ID
                  </label>
                  <input 
                    required
                    placeholder="e.g. IP15P-128-BL"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    className="w-full bg-muted/50 border border-border p-4 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Layers size={10} /> Classification
                  </label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full bg-muted/50 border border-border p-4 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option>Phones</option>
                    <option>Accessories</option>
                    <option>Parts</option>
                    <option>Services</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Initial Stock Level</label>
                  <input 
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                    className="w-full bg-muted/50 border border-border p-4 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Acquisition Cost (KD)</label>
                  <input 
                    type="number"
                    step="0.001"
                    required
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({...newProduct, cost: parseFloat(e.target.value)})}
                    className="w-full bg-muted/50 border border-border p-4 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Retail Price (KD)</label>
                  <input 
                    type="number"
                    step="0.001"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    className="w-full bg-muted/50 border border-border p-4 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                <input 
                  type="checkbox"
                  id="globalImeiReq"
                  checked={newProduct.isImeiRequired}
                  onChange={(e) => setNewProduct({...newProduct, isImeiRequired: e.target.checked})}
                  className="w-5 h-5 accent-primary rounded-lg"
                />
                <label htmlFor="globalImeiReq" className="text-[10px] font-black uppercase tracking-widest cursor-pointer select-none">
                  Strict IMEI/Serial Tracking Required for this Asset
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <Plus size={16} /> Register Asset
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
