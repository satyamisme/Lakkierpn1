import { useState, useEffect } from 'react';
import React from 'react';
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
  const [selectedType, setSelectedType] = useState('Price Tags');
  const [barcodeType, setBarcodeType] = useState<'barcode'|'qrcode'|'none'>('barcode');
  const [barcodeDataField, setBarcodeDataField] = useState<'sku' | 'serial' | 'imei'>('sku');
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [showName, setShowName] = useState(true);
  const [showNameAr, setShowNameAr] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showBrand, setShowBrand] = useState(true);
  const [showSkuText, setShowSkuText] = useState(true);
  const [cutAfterEach, setCutAfterEach] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(true);
  
  const [availablePrinters, setAvailablePrinters] = useState<{name: string, port: string, status: string}[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState('EP-D600 Industrial');
  const [isScanningPrinters, setIsScanningPrinters] = useState(false);

  const scanPrinters = async () => {
    setIsScanningPrinters(true);
    try {
      // First try to fetch from real API if it exists
      const { data } = await api.get('/hardware');
      if (data && data.length > 0) {
        setAvailablePrinters(data.map((d: any) => ({ 
          name: d.name, 
          port: d.connectionType || 'USB', 
          status: d.isActive ? 'Online' : 'Offline' 
        })));
        setIsSimulationMode(false);
      } else {
        // Fallback to simulation
        setTimeout(() => {
          setAvailablePrinters([
            { name: 'Xprinter XP-365B', port: 'USB001', status: 'Online' },
            { name: 'Zebra ZD410', port: 'COM3', status: 'Offline' },
            { name: 'EPSON TM-T88V', port: 'LAN', status: 'Online' },
            { name: 'EP-D600 Industrial', port: 'USB002', status: 'Online' }
          ]);
          setIsSimulationMode(true);
          toast.info("Simulation Mode: Local hardware not detected. Using virtual stack.");
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      toast.error("Hardware bridge connection failed. Using simulation.");
    } finally {
      setTimeout(() => setIsScanningPrinters(false), 1200);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>(() => {
    const saved = localStorage.getItem('label_queue');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingBuffer, setIsFetchingBuffer] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('label_queue', JSON.stringify(queue));
    if (queue.length > 0 && selectedPreviewIndex === null) {
      setSelectedPreviewIndex(0);
    }
  }, [queue]);

  const fetchIntakeBuffer = async () => {
    setIsFetchingBuffer(true);
    try {
      const { data } = await api.get('/products?limit=10&sort=-createdAt');
      const products = Array.isArray(data) ? data : (data.products || []);
      
      // Merge into queue without duplicates
      setQueue(prev => {
        const newItems = products.filter((p: any) => !prev.some(q => q.sku === p.sku));
        const updated = [...prev, ...newItems.map((p: any) => ({ ...p, qty: 1 }))];
        return updated;
      });
      
      if (products.length > 0) {
        toast.success(`Synchronized ${products.length} recent units from intake buffer`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to synchronize intake buffer");
    } finally {
      setIsFetchingBuffer(false);
    }
  };
  const [customItem, setCustomItem] = useState({
    name: '',
    name_ar: '',
    sku: '',
    price: 0,
    brand: '',
    brand_ar: ''
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        try {
          const { data } = await api.get(`/products/search?q=${searchQuery}`);
          setSearchResults(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else if (searchQuery.length === 0) {
        try {
          const { data } = await api.get('/products/search');
          setSearchResults(data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const addToQueue = (item: any) => {
    const existingIndex = queue.findIndex(q => q.sku === item.sku);
    if (existingIndex !== -1) {
      setQueue(queue.map((q, idx) => idx === existingIndex ? { ...q, qty: q.qty + 1 } : q));
      setSelectedPreviewIndex(existingIndex);
    } else {
      setQueue([...queue, { ...item, qty: 1 }]);
      setSelectedPreviewIndex(queue.length);
    }
    setSearchQuery('');
    setSearchResults([]);
    toast.success(`${item.name} added to queue`);
  };

  const addCustomToQueue = () => {
    if (!customItem.name || !customItem.sku) {
      toast.error("Name and SKU are required");
      return;
    }
    const item = { ...customItem, id: `custom-${Date.now()}` };
    setQueue([...queue, { ...item, qty: 1 }]);
    setSelectedPreviewIndex(queue.length);
    setCustomItem({ name: '', name_ar: '', sku: '', price: 0, brand: '', brand_ar: '' });
    setShowCustomForm(false);
    toast.success("Custom label added to queue");
  };

  const updateQty = (sku: string, delta: number) => {
    setQueue(queue.map(item => {
      if (item.sku === sku) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const removeFromQueue = (sku: string) => {
    const newQueue = queue.filter(item => item.sku !== sku);
    setQueue(newQueue);
    if (selectedPreviewIndex !== null && selectedPreviewIndex >= newQueue.length) {
      setSelectedPreviewIndex(newQueue.length > 0 ? newQueue.length - 1 : null);
    }
  };

  const handleBatchPrint = () => {
    if (queue.length === 0) {
      toast.error("Queue is empty");
      return;
    }
    toast.info(`Initiating print for ${queue.reduce((acc, curr) => acc + curr.qty, 0)} labels...`);
    triggerPrint('batch-labels', 'Labels Batch');
  };

  const selectedItem = selectedPreviewIndex !== null ? queue[selectedPreviewIndex] : null;

  return (
    <div className="h-full flex flex-col bg-black text-white p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              <Layout size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Printer Node 167 - Ready</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-serif italic tracking-tight">Label Printing</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 hidden sm:flex">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40 gap-2">
              <span className="opacity-50">Buffer</span>
              <span className="text-green-500">Sync</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40 gap-2">
              <span className="opacity-50">PRNT</span>
              <span className="text-white/80">EP-D600</span>
            </div>
          </div>
          <button onClick={() => toast("Printer configuration dashboard will open here", { icon: <Settings size={14} /> })} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/40">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 min-h-0">
        {/* Pane 1: Search & Input (3 cols) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 flex flex-col min-h-[300px] lg:min-h-0">
          <div className="surface-container p-6 rounded-[2.5rem] border border-white/5 flex flex-col h-full overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 shrink-0">
              <Search size={14} className="text-primary" /> Product Search
            </h3>

            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="relative shrink-0">
                <input 
                  placeholder="Scan or search SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-tight focus:border-primary outline-none transition-all"
                />
                <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isSearching ? 'text-primary animate-pulse' : 'text-white/20'}`} />
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar pr-1">
                <AnimatePresence mode="popLayout">
                  {searchResults.map(item => (
                    <motion.button 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.sku}
                      onClick={() => addToQueue(item)}
                      className="w-full p-3 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-xl flex items-center gap-3 group transition-all"
                    >
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/20 group-hover:text-primary transition-colors shrink-0">
                        <Plus size={14} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
                        <p className="text-[9px] font-mono font-medium text-white/30 truncate">{item.sku}</p>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
                {searchQuery.length > 0 && searchResults.length === 0 && !isSearching && (
                  <div className="py-8 text-center bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">No results found</p>
                  </div>
                )}
              </div>
            </div>

             <div className="mt-6 pt-6 border-t border-white/5 space-y-4 shrink-0">
              <button 
                onClick={() => setShowCustomForm(!showCustomForm)}
                className={`w-full py-3.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-2 transition-all ${showCustomForm ? 'bg-white/10 text-white' : 'bg-surface-container-high border border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}
              >
                <Tag size={16} /> {showCustomForm ? 'Close Designer' : 'Manual Designer'}
              </button>
              
              <AnimatePresence>
                {showCustomForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-surface-container-low border border-white/5 rounded-2xl space-y-4 my-2">
                       <div className="space-y-4">
                         <div>
                           <label className="block text-[10px] font-medium text-white/50 mb-1 ml-1 uppercase tracking-wider">Product Name (EN)</label>
                           <input 
                             placeholder="Enter product name"
                             value={customItem.name}
                             onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                             className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium text-white outline-none focus:border-primary/50 transition-colors"
                           />
                         </div>
                         <div>
                           <label className="block text-[10px] font-medium text-white/50 mb-1 ml-1 uppercase tracking-wider">Product Name (AR)</label>
                           <input 
                             placeholder="اسم المنتج"
                             dir="rtl"
                             value={customItem.name_ar}
                             onChange={(e) => setCustomItem({ ...customItem, name_ar: e.target.value })}
                             className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium text-white outline-none focus:border-primary/50 transition-colors"
                           />
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                           <div>
                             <label className="block text-[10px] font-medium text-white/50 mb-1 ml-1 uppercase tracking-wider">SKU / Serial</label>
                             <input 
                               placeholder="SKU-..."
                               value={customItem.sku}
                               onChange={(e) => setCustomItem({ ...customItem, sku: e.target.value })}
                               className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium text-white outline-none focus:border-primary/50 transition-colors"
                             />
                           </div>
                           <div>
                             <label className="block text-[10px] font-medium text-white/50 mb-1 ml-1 uppercase tracking-wider">Price (KD)</label>
                             <input 
                               placeholder="0.000"
                               type="number"
                               step="0.001"
                               value={customItem.price || ''}
                               onChange={(e) => setCustomItem({ ...customItem, price: parseFloat(e.target.value) || 0 })}
                               className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium text-white outline-none focus:border-primary/50 transition-colors"
                             />
                           </div>
                         </div>
                         <button 
                           onClick={addCustomToQueue}
                           className="w-full py-3 bg-primary/20 text-primary border border-primary/20 rounded-xl text-[10px] font-bold tracking-wide hover:bg-primary hover:text-primary-foreground transition-all mt-1"
                         >
                           Add to Queue
                         </button>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={fetchIntakeBuffer} disabled={isFetchingBuffer} className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <RefreshCcw size={14} className={isFetchingBuffer ? 'animate-spin' : ''} /> {isFetchingBuffer ? 'Syncing...' : 'Sync Recent Intake'}
              </button>
            </div>
          </div>
        </div>

        {/* Pane 2: Queue (5 cols) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-5 flex flex-col min-h-[400px] lg:min-h-0">
          <div className="surface-container p-6 lg:p-8 rounded-[3rem] border border-white/5 flex flex-col h-full bg-zinc-950/50 relative overflow-hidden">
            {isSimulationMode && (
              <div className="absolute top-4 right-8 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-2 z-10">
                <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Simulation</span>
              </div>
            )}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4 shrink-0">
              <div>
                <h3 className="text-xl font-serif italic tracking-tight">Printing Queue</h3>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Pending labels for processing</p>
              </div>
              <button 
                onClick={handleBatchPrint}
                disabled={queue.length === 0}
                className={`w-full xl:w-auto px-6 py-3 rounded-xl font-bold text-xs tracking-wide transition-all shadow-lg flex justify-center items-center gap-3 shrink-0 ${queue.length > 0 ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-primary/30' : 'bg-surface-container-high text-white/30 cursor-not-allowed'}`}
              >
                <Printer size={16} /> Batch Print
              </button>
            </div>

            <div className="flex bg-surface-container-low border border-white/5 rounded-xl p-1 mb-6 shrink-0 overflow-x-auto no-scrollbar">
              {['Price Tags', 'Stock ID', 'Bins', 'Asset Tags'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setSelectedType(f)}
                  className={`flex-1 min-w-[80px] py-2 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap ${selectedType === f ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 pb-4">
              <AnimatePresence mode="popLayout">
                {queue.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center flex flex-col items-center gap-4 opacity-10"
                  >
                    <Printer size={32} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Queue Vacuum Detected</p>
                  </motion.div>
                ) : queue.map((item, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.sku}
                    onClick={() => setSelectedPreviewIndex(idx)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${selectedPreviewIndex === idx ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.05)]' : 'bg-surface-container-low border-white/5 hover:border-white/10 hover:bg-surface-container'}`}
                  >
                     <div className="flex justify-between items-start gap-4">
                       <div className="flex-1 min-w-0">
                         <p className="text-[13px] font-bold text-white truncate">{item.name}</p>
                         <p className="text-[9px] font-mono text-white/40 tracking-wider mt-0.5">SKU: {item.sku}</p>
                       </div>
                       <span className="text-[13px] font-bold text-primary font-mono shrink-0">{item.price?.toFixed(3)}</span>
                     </div>
                     
                     <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1 bg-surface-container-high border border-white/10 rounded-lg p-0.5 shadow-sm">
                          <button onClick={(e) => { e.stopPropagation(); updateQty(item.sku, -1)}} className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors text-sm">-</button>
                          <span className="text-[10px] font-bold font-mono w-6 text-center text-white">{item.qty}</span>
                          <button onClick={(e) => { e.stopPropagation(); updateQty(item.sku, 1)}} className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors text-sm">+</button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              toast.info(`Printing label for ${item.name}...`);
                              triggerPrint(`print-single-${item.sku}`, item.name);
                            }}
                            className="px-3 py-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold rounded-lg hover:bg-blue-500 hover:text-white transition-all flex items-center gap-1.5"
                          >
                            <Printer size={12} />
                            Print
                          </button>

                          <button 
                            onClick={(e) => { e.stopPropagation(); removeFromQueue(item.sku)}}
                            className="p-2 text-white/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Pane 3: Preview & Config (4 cols) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col min-h-[500px] lg:min-h-0">
          <div className="surface-container p-6 lg:p-8 rounded-[3rem] border border-white/5 flex flex-col h-full bg-black/40 overflow-hidden">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Layout size={14} className="text-primary" /> Label Settings
              </h3>
              {selectedItem && (
                <div className="animate-pulse flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[8px] font-black text-green-500 uppercase">Live Render</span>
                </div>
              )}
            </div>

            <div className="relative flex-1 flex flex-col min-h-0">
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface-container-low border border-white/5 rounded-[2.5rem] relative overflow-hidden group/canvas">
                 {/* Advanced Blueprint Grid Background */}
                 <div className="absolute inset-0 pointer-events-none opacity-[0.1]">
                   <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(45deg, transparent 49%, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.1) 51%, transparent 51%)', backgroundSize: '20px 20px' }}></div>
                   <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(-45deg, transparent 49%, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.1) 51%, transparent 51%)', backgroundSize: '20px 20px' }}></div>
                 </div>
                 
                 {/* Alignment Rulers */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-blue-500/30"></div>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-6 bg-blue-500/30"></div>
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-px bg-blue-500/30"></div>
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-px bg-blue-500/30"></div>
                 
                 {selectedItem ? (
                   <div className={`relative transition-all duration-500 flex items-center justify-center ${zoomEnabled ? 'scale-[1.8] z-50' : 'hover:scale-[1.1]'}`}>
                      {/* Visual Guides: Bounds and Margins */}
                      <div className="absolute -inset-4 border border-blue-500/30 rounded-xl pointer-events-none flex items-center justify-center opacity-40 group-hover/canvas:opacity-100 transition-opacity">
                         <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[7px] font-mono text-blue-400 capitalize tracking-wider whitespace-nowrap">Bleed Bounds</span>
                         <div className="w-[calc(100%-8px)] h-[calc(100%-8px)] border border-green-500/20 border-dashed rounded-lg absolute">
                            <span className="absolute -right-5 top-1/2 -translate-y-1/2 text-[7px] translate-x-full font-mono text-green-400/60 capitalize tracking-wider whitespace-nowrap rotate-90">Safe Area</span>
                         </div>
                      </div>
                      
                      <div className="shadow-[0_0_40px_rgba(0,0,0,0.8)] ring-1 ring-white/10 rounded-sm overflow-hidden bg-white z-10 relative max-w-full">
                        <ProductLabel 
                          id={`preview-label`}
                          name={selectedItem.name}
                          name_ar={selectedItem.name_ar}
                          brand={selectedItem.brand}
                          brand_ar={selectedItem.brand_ar}
                          sku={selectedItem.sku}
                          price={selectedItem.price}
                          size={selectedSize}
                          barcodeType={barcodeType}
                          barcodeData={barcodeDataField === 'sku' ? selectedItem.sku : selectedItem.name}
                          showName={showName}
                          showNameAr={showNameAr}
                          showBrand={showBrand}
                          showPrice={showPrice}
                          showSkuText={showSkuText}
                        />
                      </div>
                   </div>
                 ) : (
                   <div className="text-center space-y-4 max-w-[200px] opacity-30 mt-6 z-10">
                      <div className="w-full aspect-[3/2] border border-dashed border-white/30 rounded-2xl flex items-center justify-center bg-black/50 backdrop-blur-sm">
                         <Layout size={32} strokeWidth={1.5} className="text-white/60" />
                      </div>
                      <p className="text-[11px] font-medium tracking-wide leading-relaxed text-white">Select a queue item to launch the blueprint architect</p>
                   </div>
                 )}

                 <button 
                   onClick={() => setZoomEnabled(!zoomEnabled)} 
                   title="Toggle Magnifier Zoom"
                   className={`absolute bottom-4 right-4 p-3 rounded-xl border transition-all z-[60] shadow-lg ${zoomEnabled ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-primary/20' : 'bg-surface-container-high border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                 >
                   <Search size={16} />
                 </button>
              </div>

              <div className="mt-6 flex-1 overflow-y-auto no-scrollbar pr-1 pb-4">
                <div className="space-y-6">
                  <div className="bg-surface-container-low p-5 rounded-2xl border border-white/5">
                    <label className="text-[10px] font-semibold text-white/40 block mb-3 uppercase tracking-wider">Media Dimensions (mm)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                       {['38x25', '50x30', '100x150', '80x25'].map(size => (
                         <button 
                           key={size}
                           onClick={() => setSelectedSize(size)}
                           className={`py-2 rounded-xl border text-[10px] font-semibold transition-all ${selectedSize === size ? 'bg-white text-black border-white shadow-md' : 'bg-surface-container border-white/10 text-white/40 hover:border-white/20 hover:text-white'}`}
                         >
                           {size}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-5 rounded-2xl border border-white/5">
                    <label className="text-[10px] font-semibold text-white/40 block mb-3 uppercase tracking-wider">Barcode Integration Data</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                       {['barcode', 'qrcode', 'none'].map((type: any) => (
                         <button 
                           key={type}
                           onClick={() => setBarcodeType(type)}
                           className={`py-2 rounded-xl border text-[10px] font-medium capitalize transition-all ${barcodeType === type ? 'bg-white/20 text-white border-white/30' : 'bg-surface-container border-white/5 text-white/40 hover:border-white/20'}`}
                         >
                           {type}
                         </button>
                       ))}
                    </div>
                    {barcodeType !== 'none' && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                         {['sku', 'serial', 'imei'].map((field: any) => (
                           <button 
                             key={field}
                             onClick={() => setBarcodeDataField(field)}
                             className={`py-2 rounded-xl border text-[9px] font-medium uppercase transition-all ${barcodeDataField === field ? 'bg-primary/20 text-primary border-primary/30' : 'bg-surface-container border-white/5 text-white/40 hover:border-white/20'}`}
                           >
                             {field}
                           </button>
                         ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] block mb-3">Label Elements</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { set: setShowBrand, val: showBrand, label: 'Brand' },
                        { set: setShowName, val: showName, label: 'Name (EN)' },
                        { set: setShowNameAr, val: showNameAr, label: 'Name (AR)' },
                        { set: setShowSkuText, val: showSkuText, label: 'SKU Text' },
                        { set: setShowPrice, val: showPrice, label: 'Price' },
                      ].map((el, i) => (
                        <label key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.04] group/check">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${el.val ? 'bg-primary border-primary text-black' : 'border-white/10 group-hover/check:border-white/30'}`}>
                            {el.val && <CheckCircle2 size={10} />}
                          </div>
                          <input type="checkbox" className="hidden" checked={el.val} onChange={() => el.set(!el.val)} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{el.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] block flex justify-between items-center">
                      Printer Configuration
                      <button onClick={scanPrinters} className="text-primary flex items-center gap-1 hover:text-white transition-colors" disabled={isScanningPrinters}>
                        <RefreshCcw size={10} className={isScanningPrinters ? 'animate-spin' : ''} />
                        <span className="text-[8px]">{isScanningPrinters ? 'Scanning...' : 'Detect'}</span>
                      </button>
                    </label>
                    
                    {availablePrinters.length > 0 && (
                      <div className="grid grid-cols-1 gap-2">
                        {availablePrinters.map(printer => (
                          <button
                            key={printer.name}
                            onClick={() => setSelectedPrinter(printer.name)}
                            className={`w-full px-4 py-2.5 flex justify-between items-center rounded-xl border text-left transition-all ${selectedPrinter === printer.name ? 'bg-primary/10 border-primary text-primary' : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04]'}`}
                          >
                            <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[150px]">{printer.name}</span>
                            <span className="text-[7px] font-mono tracking-widest opacity-60 border border-current px-1.5 py-0.5 rounded shrink-0">{printer.port}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.04]" onClick={() => setCutAfterEach(!cutAfterEach)}>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Cut After Each Label</span>
                      <div className={`w-8 h-4 rounded-full border relative transition-colors shrink-0 ${cutAfterEach ? 'bg-primary border-primary' : 'bg-black border-white/20'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${cutAfterEach ? 'left-4' : 'left-0.5'}`} />
                      </div>
                    </div>

                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-3">
                       <div className="flex items-center justify-between pb-3 border-b border-white/5">
                         <div className="flex items-center gap-3">
                           <div className={`w-1.5 h-1.5 rounded-full ${isSimulationMode ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
                           <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{isSimulationMode ? 'Simulator' : 'Hardware'}</span>
                         </div>
                         <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest">Active</span>
                       </div>
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                         <span className="text-white/20">Target Node</span>
                         <span className="text-white/60 truncate max-w-[140px] ml-4">{selectedPrinter}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print Container */}
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
                barcodeType={barcodeType}
                barcodeData={barcodeDataField === 'sku' ? item.sku : (barcodeDataField === 'serial' ? (item.serial || item.sku) : (item.imei || item.sku))}
                showName={showName}
                showNameAr={showNameAr}
                showBrand={showBrand}
                showPrice={showPrice}
                showSkuText={showSkuText}
              />
            ))
          ))}
        </div>
        
        {/* Render individual labels for single printing */}
        {queue.map(item => (
           <ProductLabel 
             key={`single-${item.sku}`}
             id={`print-single-${item.sku}`}
             name={item.name}
             name_ar={item.name_ar}
             brand={item.brand}
             brand_ar={item.brand_ar}
             sku={item.sku}
             price={item.price}
             size={selectedSize}
             barcodeType={barcodeType}
             barcodeData={barcodeDataField === 'sku' ? item.sku : item.name}
             showName={showName}
             showNameAr={showNameAr}
             showBrand={showBrand}
             showPrice={showPrice}
             showSkuText={showSkuText}
           />
        ))}
      </div>
    </div>
  );
};

export default LabelPrinting;
