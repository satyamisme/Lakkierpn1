import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  Search, 
  Settings, 
  Layout, 
  Smartphone, 
  Tag, 
  CheckCircle2, 
  RefreshCcw,
  Zap,
  Info,
  Trash2,
  Plus
} from 'lucide-react';
import api from '../api/client';
import { ProductLabel } from '../components/print/ProductLabel';
import { printProductLabel, triggerPrint } from '../utils/documentService';
import { toast } from 'sonner';

export const LabelPrinting = () => {
  const [selectedSize, setSelectedSize] = useState('38x25');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const { data } = await api.get(`/api/products/search?q=${searchQuery}`);
          setSearchResults(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const addToQueue = (item: any) => {
    const existing = queue.find(q => q.sku === item.sku);
    if (existing) {
      setQueue(queue.map(q => q.sku === item.sku ? { ...q, qty: q.qty + 1 } : q));
    } else {
      setQueue([...queue, { ...item, qty: 1 }]);
    }
    setSearchQuery('');
    setSearchResults([]);
    toast.success(`${item.name} added to queue`);
  };

  const updateQty = (sku: string, delta: number) => {
    setQueue(queue.map(item => {
      if (item.sku === sku) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromQueue = (sku: string) => {
    setQueue(queue.filter(item => item.sku !== sku));
  };

  const handleBatchPrint = () => {
    if (queue.length === 0) {
      toast.error("Queue is empty");
      return;
    }
    
    toast.info(`Initiating print for ${queue.reduce((acc, curr) => acc + curr.qty, 0)} labels...`);
    triggerPrint('batch-labels', 'Labels Batch');
  };

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight leading-none">Label Matrix</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">High-Resolution Asset Labeling (ID 167)</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-4 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all flex items-center gap-2">
            <Settings size={16} /> Printer Config
          </button>
          <button 
            onClick={handleBatchPrint}
            className="px-10 py-5 bg-white text-black rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-3"
          >
             <Printer size={20} /> Launch Batch Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-8 space-y-8">
          <div className="surface-container p-10 rounded-[3rem] border border-white/5 space-y-8">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Print Queue</h3>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-2">Active queue for physical attribution</p>
                </div>
                <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1">
                   {['Stock Only', 'Bins', 'Asset Tags'].map(f => (
                     <button key={f} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${f === 'Stock Only' ? 'bg-white text-black' : 'text-white/40'}`}>
                       {f}
                     </button>
                   ))}
                </div>
             </div>

             <div className="relative">
                <Search className={`absolute left-6 top-1/2 -translate-y-1/2 ${isSearching ? 'text-blue-500 animate-pulse' : 'text-white/20'}`} size={20} />
                <input 
                  placeholder="Search assets or scan SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-6 pl-16 pr-8 text-sm font-black uppercase tracking-widest focus:border-primary outline-none transition-all"
                />

                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[300px] overflow-y-auto no-scrollbar"
                    >
                      {searchResults.map(item => (
                        <button 
                          key={item.sku}
                          onClick={() => addToQueue(item)}
                          className="w-full p-4 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-primary">
                              <Smartphone size={16} />
                            </div>
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-tight">{item.name}</p>
                              <p className="text-[9px] font-mono text-white/20">{item.sku}</p>
                            </div>
                          </div>
                          <Plus size={16} className="text-white/20 group-hover:text-white" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             <div className="divide-y divide-white/5">
                {queue.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4 opacity-20">
                    <Printer size={48} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Queue is empty</p>
                  </div>
                ) : queue.map(item => (
                  <div key={item.sku} className="grid grid-cols-12 gap-6 items-center p-8 hover:bg-white/[0.02] transition-all group">
                     <div className="col-span-5 flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-primary transition-all">
                           {<Smartphone size={20} />}
                        </div>
                        <div>
                           <p className="text-sm font-black uppercase tracking-tight line-clamp-1">{item.name}</p>
                           <p className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-widest mt-1">{item.sku}</p>
                        </div>
                     </div>
                     <div className="col-span-3 text-center">
                        <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-blue-500">
                           Asset Vector
                        </span>
                     </div>
                     <div className="col-span-2 text-center">
                        <div className="flex items-center justify-center gap-4">
                           <button onClick={() => updateQty(item.sku, -1)} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:bg-white hover:text-black transition-all">-</button>
                           <span className="text-sm font-black font-mono">{item.qty}</span>
                           <button onClick={() => updateQty(item.sku, 1)} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:bg-white hover:text-black transition-all">+</button>
                        </div>
                     </div>
                     <div className="col-span-2 text-right">
                        <button onClick={() => removeFromQueue(item.sku)} className="p-3 hover:bg-red-500/10 text-white/10 hover:text-red-500 rounded-xl transition-all">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 space-y-8">
           <div className="surface-container p-10 rounded-[3rem] border border-white/5 space-y-8">
              <h3 className="text-lg font-black uppercase tracking-widest mb-4">Print Architect</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-4">Label Dimensions</label>
                    <div className="grid grid-cols-2 gap-3">
                       {['38x25', '50x30', '100x150', 'Custom'].map(size => (
                         <button 
                           key={size}
                           onClick={() => setSelectedSize(size)}
                           className={`py-4 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all ${selectedSize === size ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}
                         >
                           {size} mm
                         </button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="p-8 bg-black/40 border border-white/10 rounded-[2rem] relative overflow-hidden group flex justify-center items-center">
                    <div className="absolute top-2 right-2 px-3 py-1 bg-primary text-black text-[7px] font-black uppercase tracking-widest rounded-full opacity-40">Preview</div>
                    {queue.length > 0 ? (
                      <div className="scale-75 origin-center">
                        <ProductLabel 
                          id={`product-label-${queue[0].sku}`}
                          name={queue[0].name}
                          name_ar={queue[0].name_ar}
                          brand={queue[0].brand}
                          brand_ar={queue[0].brand_ar}
                          sku={queue[0].sku}
                          price={queue[0].price}
                          size={selectedSize}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4 w-full py-8 opacity-20">
                         <div className="w-16 h-4 bg-white/20 rounded-sm" />
                         <div className="w-full h-8 bg-white/10 flex flex-col justify-center px-4 overflow-hidden">
                            <div className="w-full h-px bg-white/40 mb-1" />
                            <div className="w-full h-px bg-white/40 mb-1" />
                            <div className="w-full h-px bg-white/40" />
                         </div>
                         <div className="w-24 h-3 bg-white/20 rounded-sm" />
                      </div>
                    )}
                 </div>

                 <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">TSPL-2 Ready</span>
                    </div>
                    <span className="text-[10px] font-mono font-black opacity-20">EP-D600</span>
                 </div>
              </div>
           </div>

           <div className="surface-container p-10 rounded-[3rem] border border-white/5 bg-primary/5">
              <h3 className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-3">
                 <Zap size={20} /> Fast Add
              </h3>
              <p className="mt-4 text-[10px] font-black text-primary/60 uppercase leading-relaxed tracking-widest">
                 Labels for items received in the last 24h can be auto-populated from the Intake Buffer.
              </p>
              <button className="w-full mt-6 py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                 <RefreshCcw size={14} /> Import from Buffer
              </button>
           </div>
        </div>
      </div>

      {/* Actual Labels for Printing (Hidden) */}
      <div className="hidden">
        <div id="batch-labels" className="flex flex-wrap gap-1">
          {queue.map(item => (
            Array.from({ length: item.qty }).map((_, i) => (
              <ProductLabel 
                key={`${item.sku}-${i}`}
                id={`print-label-${item.sku}-${i}`}
                name={item.name}
                name_ar={item.name_ar}
                brand={item.brand}
                brand_ar={item.brand_ar}
                sku={item.sku}
                price={item.price}
                size={selectedSize}
              />
            ))
          ))}
        </div>
        {queue.map(item => (
          <ProductLabel 
            key={item.sku}
            id={`product-label-${item.sku}`}
            name={item.name}
            name_ar={item.name_ar}
            brand={item.brand}
            brand_ar={item.brand_ar}
            sku={item.sku}
            price={item.price}
            size={selectedSize}
          />
        ))}
      </div>
    </div>
  );
};

export default LabelPrinting;
