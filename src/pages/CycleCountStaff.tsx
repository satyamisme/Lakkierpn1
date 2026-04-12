import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Package, Check, Save, Loader2, QrCode, Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  sku: string;
}

export const CycleCountStaff: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [items, setItems] = useState<{ productId: string, sku: string, actualCount: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startSession = async () => {
    try {
      const res = await axios.post('/api/inventory/cycle-count/start', { storeId: '65f1a2b3c4d5e6f7a8b9c0d1' }); // Mock storeId
      setSessionId(res.data.sessionId);
      toast.success("Cycle count session started");
    } catch (error) {
      toast.error("Failed to start session");
    }
  };

  const searchProducts = async (q: string) => {
    if (q.length < 2) return;
    try {
      const res = await axios.get(`/api/products/search?q=${q}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addItem = (product: Product) => {
    const existing = items.find(i => i.productId === product._id);
    if (existing) {
      toast.error("Product already in list");
      return;
    }
    setItems([...items, { productId: product._id, sku: product.sku, actualCount: 0 }]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const updateCount = (index: number, count: number) => {
    const newItems = [...items];
    newItems[index].actualCount = count;
    setItems(newItems);
  };

  const submitCount = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      await axios.post('/api/inventory/cycle-count/submit', { sessionId, items });
      toast.success("Cycle count submitted for review");
      setSessionId(null);
      setItems([]);
    } catch (error) {
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Package size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Inventory Cycle Count</h1>
          <p className="text-muted-foreground max-w-md mx-auto">Start a new blind cycle count session to verify stock levels in your store.</p>
          <button 
            onClick={startSession}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
          >
            Start Counting
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Active Session</h1>
          <p className="text-xs font-mono text-muted-foreground">{sessionId}</p>
        </div>
        <button 
          onClick={submitCount}
          disabled={isSubmitting || items.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
          Submit Review
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search size={20} />
        </div>
        <input 
          type="text"
          placeholder="Scan barcode or search product..."
          className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl focus:ring-2 ring-primary/20 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            searchProducts(e.target.value);
          }}
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
            {searchResults.map(p => (
              <button 
                key={p._id}
                onClick={() => addItem(p)}
                className="w-full p-4 text-left hover:bg-muted flex items-center justify-between border-b border-border last:border-0"
              >
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{p.sku}</p>
                </div>
                <Plus size={16} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div 
            key={item.productId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 bg-card border border-border rounded-2xl flex items-center justify-between"
          >
            <div>
              <p className="font-bold">{item.sku}</p>
              <p className="text-[10px] text-muted-foreground">Product ID: {item.productId}</p>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number"
                className="w-24 p-3 bg-muted border border-border rounded-xl text-center font-bold"
                value={item.actualCount}
                onChange={(e) => updateCount(index, parseInt(e.target.value) || 0)}
              />
            </div>
          </motion.div>
        ))}
        {items.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl">
            <p className="text-muted-foreground">No items added yet. Search above to start counting.</p>
          </div>
        )}
      </div>
    </div>
  );
};
