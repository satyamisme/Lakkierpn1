import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Scan, ChevronRight, Package } from 'lucide-react';
import api from '../../../api/client';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  items: any[];
  onAdd: (product: any) => void;
  onUpdate: (index: number, updates: any) => void;
  onRemove: (index: number) => void;
  onScan: (index: number) => void;
  active: boolean;
  onNext: () => void;
}

export const ProductManifest: React.FC<Props> = ({ 
  items, onAdd, onUpdate, onRemove, onScan, active, onNext 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }
    const search = async () => {
      try {
        const res = await api.get(`/products?search=${searchTerm}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className={`p-10 rounded-[3.5rem] border transition-all duration-500 ${active ? 'bg-white/[0.03] border-blue-500/30 ring-4 ring-blue-500/5' : 'bg-white/[0.01] border-white/5'}`}>
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Plus className="text-white w-6 h-6" />
          </div>
          Stage 2: Product Manifest
        </h2>
        
        {active && items.length > 0 && (
          <button 
            onClick={onNext}
            className="px-6 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
          >
            Review Financials
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {active && (
        <div className="relative mb-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text"
            placeholder="Search Hardware Catalog (e.g. iPhone 15 Pro)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all placeholder:text-white/10"
          />
          
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-4 bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden z-50 shadow-2xl"
              >
                {results.map(prod => (
                  <button
                    key={prod._id}
                    onClick={() => {
                      onAdd(prod);
                      setSearchTerm('');
                      setResults([]);
                    }}
                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left group"
                  >
                    <div>
                      <h4 className="text-xs font-black uppercase text-white tracking-widest group-hover:text-blue-500 transition-colors">{prod.name}</h4>
                      <p className="text-[10px] text-white/20 font-bold uppercase mt-1">{prod.sku} • {prod.category}</p>
                    </div>
                    <Plus size={18} className="text-white/20 group-hover:text-blue-500" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="space-y-4">
        {items.length > 0 && (
          <div className="terminal-row terminal-header px-6 py-4">
            <div>Product Identity</div>
            <div className="text-center">Tiers</div>
            <div className="text-center">Stock</div>
            <div className="text-center">Identifiers</div>
            <div className="text-center">Quantity Matrix</div>
            <div className="text-right px-3">Actions</div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="h-40 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-white/20">
            <Package size={32} className="mb-4 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Manifest is empty</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <motion.div 
              key={item.productId}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="terminal-row px-6 !py-6 group transition-all"
            >
              <div>
                <h4 className="text-xs font-black uppercase text-white tracking-tight">{item.name}</h4>
                <p className="text-[8px] text-white/20 font-bold uppercase mt-1 tracking-widest">{item.sku}</p>
              </div>

              <div className="text-center text-[8px] font-black uppercase text-white/40 tracking-widest bg-white/5 py-2 rounded-xl">
                 Hardware
              </div>

              <div className="text-center text-[10px] font-mono font-bold text-white/60">
                 WH_01
              </div>

              <div className="flex justify-center">
                {item.trackingMethod !== 'none' && (
                  <button 
                    onClick={() => onScan(idx)}
                    className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase flex items-center gap-2 transition-all ${item.serials.length === item.quantity ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white'}`}
                  >
                    <Scan size={12} />
                    {item.serials.length}/{item.quantity}
                  </button>
                )}
              </div>

              <div className="flex justify-center">
                <div className="bg-black/40 border border-white/5 rounded-xl flex items-center h-10 overflow-hidden">
                  <button 
                    onClick={() => onUpdate(idx, { quantity: Math.max(1, item.quantity - 1) })}
                    className="px-3 text-white/20 hover:text-white transition-colors"
                  >-</button>
                  <input 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdate(idx, { quantity: parseInt(e.target.value) || 1 })}
                    className="w-10 bg-transparent text-center text-[10px] font-black text-white outline-none"
                  />
                  <button 
                    onClick={() => onUpdate(idx, { quantity: item.quantity + 1 })}
                    className="px-3 text-white/20 hover:text-white transition-colors"
                  >+</button>
                </div>
              </div>

              <div className="text-right">
                <button 
                  onClick={() => onRemove(idx)}
                  className="p-3 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
