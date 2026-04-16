import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X, Package, Search, Plus, Trash2, CheckCircle2, AlertTriangle, Scan, History, Tag } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface StockIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialItems?: any[];
}

export const StockIntakeModal: React.FC<StockIntakeModalProps> = ({ isOpen, onClose, onSuccess, initialItems }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && initialItems && initialItems.length > 0) {
      const itemsWithUnits = initialItems.map(p => ({
        ...p,
        quantity: 1,
        units: [{
          id: Math.random().toString(36).substr(2, 9),
          identifier: '',
          cost: p.cost || 0,
          price: p.price || 0
        }]
      }));
      setSelectedItems(itemsWithUnits);
    }
  }, [isOpen, initialItems]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get('/api/stores');
        setStores(res.data);
        if (res.data.length > 0) {
          setBatchMetadata(prev => ({ ...prev, targetStoreId: res.data[0]._id }));
        }
      } catch (error) {
        console.error("Failed to fetch stores", error);
      }
    };
    fetchStores();
  }, []);

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

  const [batchMetadata, setBatchMetadata] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString(),
    supplierId: '',
    targetStoreId: 'Warehouse-Main',
    notes: ''
  });

  const addItem = (item: any) => {
    const existing = selectedItems.find(si => si._id === item._id);
    if (existing) {
      toast.info("Item already in manifest. Adjust quantities below.");
      return;
    }
    
    // Initialize with one unit
    const initialUnit = {
      id: Math.random().toString(36).substr(2, 9),
      identifier: '',
      cost: item.cost || 0,
      price: item.price || 0,
      manufacturingDate: '',
      warrantyExpiry: ''
    };

    setSelectedItems([...selectedItems, { 
      ...item, 
      units: [initialUnit],
      quantity: 1
    }]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const addUnit = (itemId: string) => {
    setSelectedItems(selectedItems.map(item => {
      if (item._id === itemId) {
        const lastUnit = item.units[item.units.length - 1];
        return {
          ...item,
          quantity: item.quantity + 1,
          units: [...item.units, {
            id: Math.random().toString(36).substr(2, 9),
            identifier: '',
            cost: lastUnit?.cost || item.cost || 0,
            price: lastUnit?.price || item.price || 0,
            manufacturingDate: lastUnit?.manufacturingDate || '',
            warrantyExpiry: lastUnit?.warrantyExpiry || ''
          }]
        };
      }
      return item;
    }));
  };

  const removeUnit = (itemId: string, unitId: string) => {
    setSelectedItems(selectedItems.map(item => {
      if (item._id === itemId) {
        const newUnits = item.units.filter((u: any) => u.id !== unitId);
        return {
          ...item,
          quantity: Math.max(0, newUnits.length),
          units: newUnits
        };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const updateUnit = (itemId: string, unitId: string, field: string, value: any) => {
    setSelectedItems(selectedItems.map(item => {
      if (item._id === itemId) {
        return {
          ...item,
          units: item.units.map((u: any) => u.id === unitId ? { ...u, [field]: value } : u)
        };
      }
      return item;
    }));
  };

  const bulkAddIdentifiers = (itemId: string, text: string) => {
    const identifiers = text.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
    if (identifiers.length === 0) return;

    setSelectedItems(selectedItems.map(item => {
      if (item._id === itemId) {
        const lastUnit = item.units[item.units.length - 1];
        const newUnits = identifiers.map(id => ({
          id: Math.random().toString(36).substr(2, 9),
          identifier: id,
          cost: lastUnit?.cost || item.cost || 0,
          price: lastUnit?.price || item.price || 0,
          manufacturingDate: lastUnit?.manufacturingDate || '',
          warrantyExpiry: lastUnit?.warrantyExpiry || ''
        }));
        return {
          ...item,
          quantity: newUnits.length,
          units: newUnits
        };
      }
      return item;
    }));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected for intake.");
      return;
    }

    // Validate Identifiers
    for (const item of selectedItems) {
      if (item.trackingMethod && item.trackingMethod !== 'none') {
        const missing = item.units.some((u: any) => !u.identifier);
        if (missing) {
          toast.error(`Missing ${item.trackingMethod.toUpperCase()} for some units of ${item.name}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      // Prepare batch data
      const batchData = {
        ...batchMetadata,
        items: selectedItems.map(item => ({
          productId: item._id, // This is actually the variantId
          quantity: item.quantity,
          binLocation: item.binLocation,
          units: item.units.map((u: any) => ({
            identifier: u.identifier,
            cost: u.cost,
            price: u.price,
            manufacturingDate: u.manufacturingDate || undefined,
            warrantyExpiry: u.warrantyExpiry || undefined
          }))
        }))
      };

      // Send to backend
      await axios.post('/api/inventory/batch-intake', batchData);

      toast.success("Batch intake processed successfully.");
      if (onSuccess) onSuccess();
      onClose();
      setSelectedItems([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to process batch intake.");
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
                <h2 className="text-5xl font-serif italic tracking-tight leading-none">Intake Desk</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Operational Stock Receiving (ID 129)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Scanner Active</span>
                </div>
                <button onClick={onClose} className="p-4 hover:bg-surface-container rounded-full text-muted-foreground transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar">
              {/* Step 1: PO / Source Identification */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 block opacity-60">1. Identify Purchase Order / Source</label>
                  <div className="relative">
                    <Scan className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={20} />
                    <input 
                      type="text"
                      placeholder="Scan PO Barcode or Enter Supplier Name..."
                      value={batchMetadata.supplierId}
                      onChange={(e) => setBatchMetadata({...batchMetadata, supplierId: e.target.value})}
                      className="w-full bg-surface border border-border rounded-[1.5rem] py-5 pl-16 pr-8 text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 block opacity-60">Target Store</label>
                  <select 
                    value={batchMetadata.targetStoreId}
                    onChange={(e) => setBatchMetadata({...batchMetadata, targetStoreId: e.target.value})}
                    className="w-full bg-surface border border-border rounded-[1.5rem] py-5 px-8 text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    {stores.map(s => (
                      <option key={s._id} value={s._id} className="bg-[#0A0A0A]">{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Product Search / Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 block opacity-60">2. Select Product Variant</label>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={20} />
                  <input 
                    type="text"
                    placeholder="Search by SKU, Name or Scan Variant Barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface border border-border rounded-[1.5rem] py-5 pl-16 pr-8 text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all shadow-inner"
                  />
                  {isSearching && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-primary" size={20} />}
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 mt-2 bg-surface-container-lowest border border-border rounded-[2rem] shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
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
                              <p className="text-xs font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{p.brand} {p.name}</p>
                              <p className="text-[9px] font-mono text-muted-foreground font-bold">
                                {p.sku} {p.attributes ? `• ${Object.values(p.attributes).join(' • ')}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tracking</p>
                            <p className="text-[10px] font-black uppercase text-blue-500">{p.trackingMethod || 'None'}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Step 3: Intake Manifest & Scanning */}
              <div className="space-y-6">
                <div className="flex items-center justify-between ml-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block opacity-60">3. Intake Manifest & Scanning</label>
                  {selectedItems.length > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total Units: {selectedItems.reduce((acc, item) => acc + item.quantity, 0)}</div>
                    </div>
                  )}
                </div>
                
                {selectedItems.length === 0 ? (
                  <div className="py-24 border border-dashed border-border rounded-[3rem] text-center opacity-30 bg-surface">
                    <Package size={48} className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No items staged for intake</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {selectedItems.map((item) => (
                      <div key={item._id} className="p-10 bg-surface border border-border rounded-[3rem] space-y-8 group hover:border-primary/30 transition-all relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20" />
                        
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-8">
                            <div className="w-24 h-24 bg-muted rounded-[2rem] overflow-hidden border border-border shadow-inner">
                              <img src={item.image || `https://picsum.photos/seed/${item.sku}/100/100`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-2xl font-black uppercase tracking-tighter leading-none">{item.brand} {item.name}</p>
                              <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-mono text-muted-foreground font-bold uppercase tracking-widest">{item.sku}</span>
                                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-black text-blue-500 uppercase tracking-widest">{item.trackingMethod || 'None'}</span>
                                {item.attributes && Object.entries(item.attributes).map(([k, v]: any) => (
                                  <span key={k} className="text-[9px] font-black text-white/20 uppercase tracking-widest">{k}: {v}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-4">
                            <button 
                              onClick={() => setSelectedItems(selectedItems.filter(si => si._id !== item._id))}
                              className="p-3 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                            >
                              <Trash2 size={20} />
                            </button>
                            <div className="px-6 py-3 bg-primary/5 border border-primary/10 rounded-2xl">
                              <p className="text-[8px] font-black text-primary uppercase tracking-widest text-center mb-1">Staged Qty</p>
                              <p className="text-xl font-black font-mono text-center">{item.quantity}</p>
                            </div>
                          </div>
                        </div>

                        {/* Batch Info & Scanning Grid */}
                        <div className="grid grid-cols-12 gap-8">
                          {/* Left: Batch Info */}
                          <div className="col-span-4 space-y-6 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Batch Information</h4>
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">Landed Cost (KD)</label>
                                <input 
                                  type="number"
                                  value={item.units[0]?.cost || 0}
                                  onChange={(e) => {
                                    const cost = parseFloat(e.target.value);
                                    setSelectedItems(selectedItems.map(si => si._id === item._id ? {
                                      ...si,
                                      units: si.units.map((u: any) => ({ ...u, cost }))
                                    } : si));
                                  }}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-blue-500 font-mono"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">Bin Location</label>
                                <input 
                                  placeholder="e.g. A-12-04"
                                  value={item.binLocation || ''}
                                  onChange={(e) => {
                                    setSelectedItems(selectedItems.map(si => si._id === item._id ? { ...si, binLocation: e.target.value } : si));
                                  }}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-blue-500 uppercase tracking-widest"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">Mfg Date</label>
                                  <input 
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-blue-500"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-2">Warranty Expiry</label>
                                  <input 
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Scanning Area */}
                          <div className="col-span-8 space-y-6">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Unit Identifiers ({item.trackingMethod?.toUpperCase()})</h4>
                              <button 
                                onClick={() => addUnit(item._id)}
                                className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[9px] font-black text-blue-500 uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                              >
                                <Plus size={14} /> Manual Add
                              </button>
                            </div>

                            {item.trackingMethod && item.trackingMethod !== 'none' && (
                              <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[1.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <textarea 
                                  placeholder={`SCAN OR PASTE ${item.trackingMethod.toUpperCase()}S HERE...`}
                                  className="relative w-full bg-surface border border-border rounded-[1.5rem] p-6 text-xs font-mono font-bold text-white outline-none focus:border-primary transition-all min-h-[120px] shadow-inner"
                                  onBlur={(e) => bulkAddIdentifiers(item._id, e.target.value)}
                                />
                                <div className="absolute right-6 bottom-6 flex items-center gap-2 opacity-40">
                                  <Scan size={16} className="text-primary" />
                                  <span className="text-[8px] font-black uppercase tracking-widest">Scanner Active</span>
                                </div>
                              </div>
                            )}

                            {/* Units Grid */}
                            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                              {item.units.map((unit: any, idx: number) => (
                                <div key={unit.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/unit hover:border-white/10 transition-all">
                                  <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-black text-white/10">#{idx + 1}</span>
                                    <input 
                                      placeholder="IDENTIFIER"
                                      value={unit.identifier}
                                      onChange={(e) => updateUnit(item._id, unit.id, 'identifier', e.target.value)}
                                      className="bg-transparent border-none outline-none text-[10px] font-mono font-bold text-white w-32"
                                    />
                                  </div>
                                  <button 
                                    onClick={() => removeUnit(item._id, unit.id)}
                                    className="p-2 text-red-500/0 group-hover/unit:text-red-500/40 hover:!text-red-500 transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
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
