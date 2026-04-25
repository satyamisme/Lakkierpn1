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
  const [selectedType, setSelectedType] = useState('Price Tags');
  const [barcodeType, setBarcodeType] = useState<'barcode'|'qrcode'|'none'>('barcode');
  const [barcodeDataField, setBarcodeDataField] = useState<'sku'>('sku');
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [showName, setShowName] = useState(true);
  const [showNameAr, setShowNameAr] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showBrand, setShowBrand] = useState(true);
  const [showSkuText, setShowSkuText] = useState(true);
  const [cutAfterEach, setCutAfterEach] = useState(false);
  
  const [availablePrinters, setAvailablePrinters] = useState<{name: string, port: string}[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState('EP-D600');
  const [isScanningPrinters, setIsScanningPrinters] = useState(false);

  const scanPrinters = async () => {
    setIsScanningPrinters(true);
    // Simulate detecting local printers (USB/COM)
    setTimeout(() => {
      setAvailablePrinters([
        { name: 'Xprinter XP-365B', port: 'USB001' },
        { name: 'Zebra ZD410', port: 'COM3' },
        { name: 'EPSON TM-T88V', port: 'LAN' },
        { name: 'EP-D600 Industrial', port: 'USB002' }
      ]);
      setSelectedPrinter('EP-D600 Industrial');
      setIsScanningPrinters(false);
      toast.success("Local printers detected via Agent");
    }, 1500);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | null>(null);
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
    <div className="min-h-screen bg-black text-white p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              <Layout size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Node 167 - Active</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-serif italic tracking-tight">Label Matrix</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Buffer Status</span>
              <span className="text-[10px] font-bold text-green-500 uppercase">Synchronized</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Printer Info</span>
              <span className="text-[10px] font-bold text-white/60">EP-D600 [TSPL-2]</span>
            </div>
          </div>
          <button onClick={() => toast("Printer configuration dashboard will open here", { icon: <Settings size={14} /> })} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white/40">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 h-full">
        {/* Pane 1: Search & Input (3 cols) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="surface-container p-6 rounded-[2.5rem] border border-white/5 flex flex-col h-full">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Search size={14} className="text-primary" /> Input Terminal
            </h3>

            <div className="space-y-4">
              <div className="relative">
                <input 
                  placeholder="Scan or search SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-tight focus:border-primary outline-none transition-all"
                />
                <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isSearching ? 'text-primary animate-pulse' : 'text-white/20'}`} />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
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
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                        <Plus size={14} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase truncate">{item.displayName || item.name}</p>
                        <p className="text-[8px] font-mono font-bold text-white/30">{item.sku}</p>
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

            <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
              <button 
                onClick={() => setShowCustomForm(!showCustomForm)}
                className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${showCustomForm ? 'bg-primary text-black' : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'}`}
              >
                <Tag size={14} /> {showCustomForm ? 'Close Designer' : 'Manual Designer'}
              </button>
              
              <AnimatePresence>
                {showCustomForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl space-y-4 my-2">
                       <div className="space-y-3">
                         <input 
                           placeholder="ITEM NAME (EN)"
                           value={customItem.name}
                           onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                           className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-primary"
                         />
                         <input 
                           placeholder="اسم المنتج (AR)"
                           dir="rtl"
                           value={customItem.name_ar}
                           onChange={(e) => setCustomItem({ ...customItem, name_ar: e.target.value })}
                           className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-primary"
                         />
                         <div className="grid grid-cols-2 gap-2">
                           <input 
                             placeholder="SKU"
                             value={customItem.sku}
                             onChange={(e) => setCustomItem({ ...customItem, sku: e.target.value })}
                             className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-primary"
                           />
                           <input 
                             placeholder="PRICE KD"
                             type="number"
                             value={customItem.price || ''}
                             onChange={(e) => setCustomItem({ ...customItem, price: parseFloat(e.target.value) || 0 })}
                             className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-primary"
                           />
                         </div>
                         <button 
                           onClick={addCustomToQueue}
                           className="w-full py-4 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                         >
                           Enqueue Label
                         </button>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={() => toast.success("Intake Buffer data fetched and synchronized")} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <RefreshCcw size={14} /> Intake Buffer
              </button>
            </div>
          </div>
        </div>

        {/* Pane 2: Queue (5 cols) */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="surface-container p-8 rounded-[3rem] border border-white/5 flex flex-col h-full bg-zinc-950/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-serif italic italic tracking-tight">Active Queue</h3>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Pending assignment to physical assets</p>
              </div>
              <button 
                onClick={handleBatchPrint}
                disabled={queue.length === 0}
                className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${queue.length > 0 ? 'bg-primary text-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95' : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'}`}
              >
                <Printer size={16} /> Execute Batch
              </button>
            </div>

            <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 mb-6">
              {['Price Tags', 'Stock ID', 'Bins', 'Asset Tags'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setSelectedType(f)}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedType === f ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2 pb-6">
              <AnimatePresence mode="popLayout">
                {queue.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center flex flex-col items-center gap-4 opacity-10"
                  >
                    <Printer size={40} strokeWidth={1} />
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
                    className={`p-5 rounded-3xl border transition-all cursor-pointer group ${selectedPreviewIndex === idx ? 'bg-primary/5 border-primary/20' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedPreviewIndex === idx ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'}`}>
                        <Smartphone size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-black uppercase truncate group-hover:text-primary transition-colors">{item.name}</p>
                          <p className="text-sm font-black font-mono text-primary">{item.price?.toFixed(3)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] font-mono font-bold text-white/30 tracking-widest">{item.sku}</p>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-lg p-1">
                              <button onClick={(e) => { e.stopPropagation(); updateQty(item.sku, -1)}} className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-white/40 transition-colors">-</button>
                              <span className="text-[10px] font-black font-mono w-6 text-center">{item.qty}</span>
                              <button onClick={(e) => { e.stopPropagation(); updateQty(item.sku, 1)}} className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-white/40 transition-colors">+</button>
                            </div>
                            
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                toast.info(`Printing label for ${item.name}...`);
                                triggerPrint(`print-single-${item.sku}`, item.name);
                              }}
                              className="px-3 py-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-blue-500 hover:text-black transition-colors"
                            >
                              Print
                            </button>

                            <button 
                              onClick={(e) => { e.stopPropagation(); removeFromQueue(item.sku)}}
                              className="p-2 text-white/10 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Pane 3: Preview & Config (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="surface-container p-8 rounded-[3rem] border border-white/5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Layout size={14} className="text-primary" /> Label architect
              </h3>
              {selectedItem && (
                <div className="animate-pulse flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[8px] font-black text-green-500 uppercase">Live Render</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-10 bg-black/40 border border-white/5 rounded-[3rem] relative overflow-hidden">
               {/* Grid Background */}
               <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
               
               {selectedItem ? (
                 <div className={`relative group transition-transform duration-500 ${zoomEnabled ? 'scale-[1.5]' : 'hover:scale-110'}`}>
                    {/* Safe Margin Indicator */}
                    <div className="absolute -inset-2 border border-blue-500/20 rounded-lg pointer-events-none border-dashed" />
                    
                    <div className="shadow-2xl shadow-black ring-1 ring-white/10 rounded-sm overflow-hidden">
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
                    
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{selectedSize}mm • Safe Margin Active</span>
                    </div>
                 </div>
               ) : (
                 <div className="text-center space-y-6 max-w-[180px] opacity-20">
                    <div className="w-full aspect-[3/2] border-2 border-dashed border-white/20 rounded-[2rem] flex items-center justify-center">
                       <Smartphone size={32} strokeWidth={1} />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest leading-loose">Select an item from the queue to initialize the architect</p>
                 </div>
               )}

               <button 
                 onClick={() => setZoomEnabled(!zoomEnabled)} 
                 className={`absolute bottom-6 right-6 p-3 rounded-xl border transition-all ${zoomEnabled ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
               >
                 <Search size={16} />
               </button>
            </div>

            <div className="mt-10 space-y-8">
              <div>
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] block mb-4">Media Dimensions</label>
                <div className="grid grid-cols-2 gap-3">
                   {['38x25', '50x30', '100x150', '80x25'].map(size => (
                     <button 
                       key={size}
                       onClick={() => setSelectedSize(size)}
                       className={`py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${selectedSize === size ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/10 hover:text-white'}`}
                     >
                       {size} mm
                     </button>
                   ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] block mb-4">Barcode Configuration</label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                   {['barcode', 'qrcode', 'none'].map((type: any) => (
                     <button 
                       key={type}
                       onClick={() => setBarcodeType(type)}
                       className={`py-3 rounded-2xl border font-black text-[9px] uppercase tracking-widest transition-all ${barcodeType === type ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/10'}`}
                     >
                       {type}
                     </button>
                   ))}
                </div>
                {barcodeType !== 'none' && (
                  <div className="grid grid-cols-2 gap-3">
                     {['sku', 'name'].map((field: any) => (
                       <button 
                         key={field}
                         onClick={() => setBarcodeDataField(field)}
                         className={`py-3 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all ${barcodeDataField === field ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/10'}`}
                       >
                         Data: {field}
                       </button>
                     ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] block mb-4">Label Elements</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.04]">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${showBrand ? 'bg-primary border-primary text-black' : 'border-white/20'}`}>
                      {showBrand && <CheckCircle2 size={12} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Brand</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.04]">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${showName ? 'bg-primary border-primary text-black' : 'border-white/20'}`}>
                      {showName && <CheckCircle2 size={12} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Name (EN)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.04]">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${showNameAr ? 'bg-primary border-primary text-black' : 'border-white/20'}`}>
                      {showNameAr && <CheckCircle2 size={12} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Name (AR)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.04]">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${showSkuText ? 'bg-primary border-primary text-black' : 'border-white/20'}`}>
                      {showSkuText && <CheckCircle2 size={12} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">SKU Text</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.04]">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${showPrice ? 'bg-primary border-primary text-black' : 'border-white/20'}`}>
                      {showPrice && <CheckCircle2 size={12} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Price</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] block mb-4 flex justify-between items-center">
                  Printer Configuration
                  <button onClick={scanPrinters} className="text-primary flex items-center gap-1 hover:text-white transition-colors" disabled={isScanningPrinters}>
                    <RefreshCcw size={10} className={isScanningPrinters ? 'animate-spin' : ''} />
                    {isScanningPrinters ? 'Scanning...' : 'Detect'}
                  </button>
                </label>
                
                {availablePrinters.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {availablePrinters.map(printer => (
                      <button
                        key={printer.name}
                        onClick={() => setSelectedPrinter(printer.name)}
                        className={`w-full p-3 flex justify-between items-center rounded-xl border text-left transition-all ${selectedPrinter === printer.name ? 'bg-primary/10 border-primary text-primary' : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04]'}`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">{printer.name}</span>
                        <span className="text-[8px] font-mono tracking-widest opacity-60 border border-current px-2 py-0.5 rounded">{printer.port}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                <label className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.04]">
                  <span className="text-[10px] font-black uppercase tracking-widest">Cut After Each Label</span>
                  <div className={`w-10 h-6 rounded-full border relative transition-colors ${cutAfterEach ? 'bg-primary border-primary' : 'bg-black border-white/20'}`} onClick={() => setCutAfterEach(!cutAfterEach)}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${cutAfterEach ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </label>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                 <div className="flex items-center justify-between pb-4 border-b border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                     <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">TSPL Protocol</span>
                   </div>
                   <span className="text-[10px] font-mono text-white/20">READY</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className="text-white/20">Hardware</span>
                   <span className="text-white/60">EP-D600 Industrial</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className="text-white/20">Latency</span>
                   <span className="text-green-500/60 font-mono">14ms</span>
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
                barcodeData={barcodeDataField === 'sku' ? item.sku : item.name}
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
