import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Package, 
  AlertTriangle, 
  ArrowRightLeft, 
  TrendingUp, 
  Plus, 
  Search, 
  Loader2,
  CheckCircle2,
  Truck,
  X,
  Smartphone,
  Tag,
  Layers,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  RefreshCcw,
  Database,
  Trash
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { GlobalAddProductModal } from "../components/GlobalAddProductModal";
import { BulkImportModal } from "../components/BulkImportModal";
import { Upload } from "lucide-react";

import axios from 'axios';
import { StockIntakeModal } from "../components/StockIntakeModal";

import { useSearchParams } from "react-router-dom";

export const InventoryDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [intakeInitialItems, setIntakeInitialItems] = useState<any[]>([]);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [showNuclearConfirm, setShowNuclearConfirm] = useState(false);

  const checkHealth = async () => {
    try {
      const res = await axios.get('/api/health');
      setSystemHealth(res.data);
    } catch (err) {
      setSystemHealth({ status: 'error' });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('sku') || "");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [deletePin, setDeletePin] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [bulkPriceData, setBulkPriceData] = useState({ percentage: 0, fixedAmount: 0, mode: 'percentage' as 'percentage' | 'fixed' });
  const [currentTerminalPin, setCurrentTerminalPin] = useState("****");

  useEffect(() => {
    const fetchPin = async () => {
      try {
        const res = await axios.get('/api/security/terminal-pin');
        setCurrentTerminalPin(res.data.pin);
      } catch (err) {
        console.error("Failed to fetch PIN");
      }
    };
    if (isMaintenanceOpen) fetchPin();
  }, [isMaintenanceOpen]);

  const handleUpdatePin = async () => {
    const newPin = prompt("ENTER NEW 4-DIGIT SECURITY PIN:");
    if (!newPin || newPin.length < 4) {
      toast.error("Invalid PIN format.");
      return;
    }
    try {
      await axios.post('/api/security/terminal-pin', { newPin });
      toast.success("Terminal Security PIN updated.");
      setCurrentTerminalPin(newPin);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Update failed.");
    }
  };

  const [stores, setStores] = useState<any[]>([]);

  const fetchStores = async () => {
    try {
      const res = await axios.get('/api/stores');
      setStores(res.data);
    } catch (err) {
      console.error("Failed to fetch stores");
    }
  };

  const filteredProducts = allProducts; // We use server side search now

  const searchProducts = async (q: string) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/products/search?q=${q}`);
      setAllProducts(res.data.map((p: any) => ({
        ...p,
        image: p.image || `https://picsum.photos/seed/${p.sku}/200/200`
      })));
    } catch (err) {
      toast.error("Elastic search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [stockRes, lowRes, transRes] = await Promise.all([
        axios.get(`/api/products?deleted=${showTrash}`),
        axios.get('/api/products/low-stock'),
        axios.get('/api/inventory/transfers?status=pending')
      ]);
      setAllProducts(stockRes.data.map((p: any) => ({
        ...p,
        image: p.image || `https://picsum.photos/seed/${p.sku}/200/200`
      })));
      setLowStock(lowRes.data);
      setTransfers(transRes.data);
    } catch (err) {
      toast.error("Failed to sync matrix data");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTrashMode = () => {
    setShowTrash(!showTrash);
    setSelectedProducts(new Set());
  };

  const toggleProduct = (id: string) => {
    const next = new Set(expandedProducts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedProducts(next);
  };

  const toggleSelectProduct = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedProducts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProducts(next);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p._id)));
    }
  };

  const [bulkActionType, setBulkActionType] = useState<'delete' | 'purge' | 'restore' | null>(null);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [bulkPin, setBulkPin] = useState("");

  const handleBulkDelete = () => {
    setBulkActionType(showTrash ? 'purge' : 'delete');
    setIsBulkConfirmOpen(true);
  };

  const executeBulkAction = async () => {
    try {
      const ids = Array.from(selectedProducts);
      if (bulkActionType === 'delete') {
        await axios.post('/api/products/bulk-delete', { ids, pin: bulkPin });
        toast.success("Batch moved to Recycle Bin");
      } else if (bulkActionType === 'purge') {
        await axios.post('/api/products/bulk-purge-permanent', { ids, pin: bulkPin });
        toast.success("Terminal destruction complete");
      }
      setSelectedProducts(new Set());
      setIsBulkConfirmOpen(false);
      setBulkPin("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Batch execution failed");
    }
  };

  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/products/${itemToDelete._id}`, { data: { pin: deletePin } });
      toast.success(`${itemToDelete.type} purged successfully`);
      setItemToDelete(null);
      setDeletePin("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Purge authorization failed");
    }
  };

  const handleBulkReprice = async () => {
    try {
      const ids = Array.from(selectedProducts);
      await axios.post('/api/products/bulk-reprice', { ids, ...bulkPriceData });
      toast.success("Global price shift applied");
      setIsBulkPriceModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Price shift failed");
    }
  };

  const repairDatabaseAction = async (purge: boolean = false) => {
    try {
      setIsRepairing(true);
      if (purge) {
        await axios.post('/api/products/repair-database', { nuclear: true });
        toast.success("Inventory wiped cleanly.");
      } else {
        await axios.post('/api/products/repair-database');
        toast.success("Matrix metadata repaired.");
      }
      fetchData();
    } catch (err) {
      toast.error("Maintenance operation failed.");
    } finally {
      setIsRepairing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 1) {
        searchProducts(searchQuery);
      } else if (searchQuery.length === 0) {
        fetchData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
    fetchStores();
  }, [showTrash]);

  return (
    <Gate id={121}>
      <div className="space-y-16 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Inventory Hub</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">Multi-store stock matrix & supply chain (ID 121)</p>
        </div>
        <Gate id={122}>
          <div className="flex flex-wrap gap-4 justify-end">
            <button 
              onClick={() => setIsMaintenanceOpen(true)}
              className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
            >
              <ShieldAlert size={14} /> System Maintenance
            </button>
            <button 
              onClick={() => setIsIntakeModalOpen(true)}
              className="px-10 py-5 bg-surface-container border border-border rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all flex items-center gap-3 shadow-sm"
            >
              <Layers size={18} /> Stock Intake (ID 129)
            </button>
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="px-10 py-5 bg-surface-container border border-border rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-surface-container-high transition-all flex items-center gap-3 shadow-sm"
            >
              <Upload size={18} /> Bulk Import (ID 137)
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-10 py-5 bg-primary text-primary-foreground rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <Plus size={18} /> Register Asset
            </button>
            <Link 
              to="/inventory/labels"
              className="px-10 py-5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-500/20 transition-all flex items-center gap-3"
            >
              <Tag size={18} /> Label Matrix
            </Link>
          </div>
        </Gate>
      </header>

      {/* Matrix Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container border border-border/50 p-8 rounded-[2.5rem]">
           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4">Total Stock On-Hand</p>
           <h3 className="text-4xl font-serif italic">{allProducts.reduce((sum, p) => sum + (p.stock || 0), 0)} Units</h3>
        </div>
        <div className="bg-surface-container border border-border/50 p-8 rounded-[2.5rem]">
           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4">Inventory Valuation</p>
           <h3 className="text-4xl font-serif italic">{(allProducts.reduce((sum, p) => sum + ((p.cost || 0) * (p.stock || 0)), 0)).toLocaleString(undefined, { minimumFractionDigits: 3 })} KD</h3>
        </div>
        <Gate id={125}>
          <div className="lg:col-span-2">
            <div className="bg-red-500/[0.03] border border-red-500/10 p-8 rounded-[2.5rem] flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-red-500/60 uppercase tracking-widest mb-2">Critical Stock Alarms</p>
                <h3 className="text-4xl font-serif italic text-red-500">{lowStock.length} Items Below Safety</h3>
              </div>
              <div className="flex -space-x-4">
                {lowStock.slice(0, 4).map((p, i) => (
                  <div key={p._id} className="w-12 h-12 rounded-full border-4 border-[#050505] overflow-hidden bg-muted">
                    <img src={p.image || undefined} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Gate>
      </div>

      <div className="bg-surface-container-lowest border border-border rounded-[4rem] shadow-sm overflow-hidden">
        <div className="p-10 border-b border-border bg-surface-container-lowest/50 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h2 className="text-4xl font-serif italic tracking-tight flex items-center gap-4">
                <Package size={32} className="text-primary" />
                Multi-Store Stock Matrix
              </h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-3 opacity-60">Cross-node synchronization for {stores.length} branches</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTrashMode}
                className={`px-6 py-4 rounded-2xl border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${showTrash ? 'bg-red-500 text-white border-red-500' : 'bg-surface border-border text-muted-foreground hover:border-red-500'}`}
              >
                {showTrash ? <Trash2 size={16} /> : <Trash size={16} />}
                {showTrash ? 'Exit Recycle Bin' : 'Recycle Bin'}
              </button>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={20} />
                <input 
                  type="text" 
                  placeholder="Universal Search (e.g. iPhone 15 Blue)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border pl-16 pr-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner placeholder:opacity-30"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {selectedProducts.size > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-wrap items-center gap-4 p-6 bg-primary/5 border border-primary/20 rounded-[2rem] shadow-inner"
              >
                {/* ... existing bulk action buttons ... */}
                <div className="flex items-center gap-3 pr-4 border-r border-primary/20 mr-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black">
                    {selectedProducts.size}
                  </div>
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">Assets Selected</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => {
                      const items = allProducts.filter(p => selectedProducts.has(p._id));
                      setIntakeInitialItems(items);
                      setIsIntakeModalOpen(true);
                    }}
                    className="px-6 py-3 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-all"
                  >
                    <Layers size={14} /> Bulk Intake
                  </button>
                  <button 
                    onClick={() => setIsBulkPriceModalOpen(true)}
                    className="px-6 py-3 bg-white border border-border rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap hover:border-primary transition-all"
                  >
                    <Tag size={14} /> Batch Re-price
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash size={14} /> {showTrash ? 'Terminal Purge' : 'Bulk Purge'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-10 space-y-4 dashboard-matrix-container custom-scrollbar">
          <div className="dashboard-matrix-header mb-6">
            <div className="flex items-center gap-6">
               <input 
                  type="checkbox" 
                  checked={selectedProducts.size > 0 && selectedProducts.size === filteredProducts.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
               />
               <span>Product Identity</span>
            </div>
            <div className="text-center">SKU / Model</div>
            <div className="text-center">Category</div>
            <div className="text-center">Branch Stock</div>
            <div className="text-center">Global Total</div>
            <div className="text-center">Total Value</div>
            <div className="text-right pr-6">Actions</div>
          </div>

          <div className="space-y-4 pb-20">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-20">
                 <Loader2 className="animate-spin text-primary" size={32} />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em]">Querying Core Matrix...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[3rem] opacity-20">
                 <Package size={48} className="mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em]">Matrix Empty</p>
              </div>
            ) : filteredProducts.map(p => (
              <div key={p._id} className="space-y-4">
                <div 
                  className={`dashboard-matrix-row bg-surface/30 hover:bg-surface transition-all rounded-[2rem] border border-white/5 cursor-pointer ${expandedProducts.has(p._id) ? 'ring-2 ring-primary/20 border-primary/20 bg-surface' : ''}`}
                  onClick={() => p.variants?.length > 0 && toggleProduct(p._id)}
                >
                  <div className="flex items-center gap-6">
                    <input 
                      type="checkbox"
                      checked={selectedProducts.has(p._id)}
                      onClick={(e) => toggleSelectProduct(p._id, e)}
                      onChange={() => {}}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-4">
                      {p.variants?.length > 0 ? (
                        expandedProducts.has(p._id) ? <ChevronDown size={14} className="text-primary" /> : <ChevronRight size={14} className="text-muted-foreground" />
                      ) : <div className="w-3" />}
                      <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden border border-white/5 shadow-inner">
                        <img src={p.image || undefined} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-white tracking-tight leading-tight">
                        {p.displayName || p.name}
                      </h4>
                      <p className="text-[9px] text-white/20 font-black uppercase mt-1.5 tracking-widest">{p.brand}</p>
                    </div>
                  </div>

                  <div className="text-center text-[10px] font-mono font-bold text-white/40">
                    {p.sku}
                  </div>

                  <div className="text-center">
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase text-white/30">
                      {p.category}
                    </span>
                  </div>

                  <div className="flex justify-center flex-wrap gap-1">
                      {stores.slice(0, 3).map(s => {
                        const inv = p.storeInventory?.find((i: any) => i.storeId === s._id);
                        return (
                          <div key={s._id} className="w-6 h-6 bg-white/5 rounded-md flex items-center justify-center text-[8px] font-black text-white/40 border border-white/5" title={s.name}>
                            {inv?.quantity || 0}
                          </div>
                        );
                      })}
                      {stores.length > 3 && <span className="text-[8px] font-black text-white/10 self-end">+{stores.length - 3}</span>}
                  </div>

                  <div className="text-center">
                    <span className={`text-xl font-black font-mono tracking-tighter ${p.stock < 5 ? 'text-red-500' : 'text-white'}`}>
                      {p.stock}
                    </span>
                  </div>

                  <div className="text-center font-mono font-black text-primary text-xs">
                    {(p.cost * p.stock).toFixed(3)}
                  </div>

                  <div className="flex justify-end gap-2">
                     {!p.isConfigurable && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIntakeInitialItems([p]);
                            setIsIntakeModalOpen(true);
                          }}
                          className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          Intake
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct(p);
                          setIsAddModalOpen(true);
                        }}
                        className="p-3 bg-white/5 rounded-xl hover:bg-white/10 hover:text-primary transition-all border border-white/5"
                      >
                        <Edit2 size={14} />
                      </button>
                  </div>
                </div>

                {/* Variants Expansion */}
                <AnimatePresence>
                  {expandedProducts.has(p._id) && p.variants?.map((v: any) => (
                    <motion.div 
                      key={v._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="dashboard-matrix-row !py-4 pl-12 bg-white/[0.01] border-l-4 border-primary/40 ml-10 rounded-r-[1.5rem]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-white/5 rounded-lg overflow-hidden border border-white/5 grayscale">
                           <img src={v.images?.[0] || p.image || undefined} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/60 uppercase">{Object.values(v.attributes).join(' | ')}</p>
                          <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em] mt-0.5">{v.trackingMethod} tracking</p>
                        </div>
                      </div>
                      <div className="text-center text-[9px] font-mono text-white/30">{v.sku}</div>
                      <div className="text-center text-[8px] font-black text-white/10 uppercase tracking-widest">{v.binLocation || 'UNASSIGNED'}</div>
                      <div className="text-center">
                        <div className="flex justify-center gap-1">
                          {stores.slice(0, 2).map(s => {
                            const inv = v.storeInventory?.find((inv: any) => inv.storeId === s._id);
                            return (
                              <div key={s._id} className="w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[7px] font-black text-white/40" title={s.name}>
                                {inv?.quantity || 0}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-center font-mono font-black text-white/80">{v.stock}</div>
                      <div className="text-center font-mono text-[10px] text-primary/40">{(v.cost * v.stock).toFixed(3)}</div>
                      <div className="flex justify-end gap-2">
                         <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIntakeInitialItems([{ ...v, name: `${p.name} (${Object.values(v.attributes).join('/')})`, brand: p.brand }]);
                              setIsIntakeModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase transition-all"
                          >
                            Add Stock
                         </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BulkImportModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={fetchData}
      />

      <GlobalAddProductModal 
        isOpen={isAddModalOpen} 
        initialData={editingProduct}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }} 
        onSuccess={fetchData}
      />

      <StockIntakeModal 
        isOpen={isIntakeModalOpen}
        onClose={() => {
          setIsIntakeModalOpen(false);
          setIntakeInitialItems([]);
        }}
        onSuccess={fetchData}
        initialItems={intakeInitialItems}
      />

      {/* Obsidian Maintenance Portal */}
      <AnimatePresence>
        {isMaintenanceOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-xl w-full bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(255,0,0,0.1)]"
            >
              <div className="p-10 border-b border-white/5 bg-red-500/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/20">
                    <ShieldAlert className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Maintenance Portal</h2>
                    <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-[0.2em] mt-1">Obsidian Core System v2.6</p>
                  </div>
                </div>
                <button onClick={() => setIsMaintenanceOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-10 space-y-8">
                {/* Health Check Matrix */}
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Database Engine</span>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${systemHealth?.env?.mongodb ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                       <span className="text-[10px] font-mono text-white/60">{systemHealth?.env?.mongodb ? 'SYNCHRONIZED' : 'OFFLINE'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">API Endpoint</span>
                    <span className="text-[10px] font-mono text-white/60">/api/v1/terminal</span>
                  </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Security Configuration</h3>
                   <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-black text-white uppercase tracking-widest">Terminal Security PIN</p>
                          <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-0.5">Required for all destructive operations</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-black text-white/40 tracking-[0.3em] font-mono">{currentTerminalPin}</span>
                          <button 
                            onClick={handleUpdatePin}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Diagnostic Operations</h3>
                   
                   <div className="grid grid-cols-1 gap-3">
                     <button 
                       disabled={isRepairing}
                       onClick={() => repairDatabaseAction(false)}
                       className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group"
                     >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                             <Database size={18} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-white uppercase tracking-widest">Standard Asset Repair</p>
                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-0.5">Cleans soft-deleted items & fixes metadata</p>
                          </div>
                        </div>
                        <RefreshCcw className={`w-4 h-4 text-white/20 group-hover:text-blue-500 transition-colors ${isRepairing ? 'animate-spin' : ''}`} />
                     </button>

                     <button 
                       disabled={isRepairing}
                       onClick={() => setShowNuclearConfirm(true)}
                       className="w-full flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl hover:bg-red-500/10 transition-all text-left group"
                     >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                             <Trash size={18} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-white uppercase tracking-widest">Nuclear Atomic Purge</p>
                            <p className="text-[9px] text-red-500/40 font-bold uppercase tracking-widest mt-0.5">Wipes entire inventory catalog</p>
                          </div>
                        </div>
                        <ShieldAlert className="w-4 h-4 text-red-500/20 group-hover:text-red-500 transition-colors" />
                     </button>

                     {showNuclearConfirm && (
                       <div className="mt-4 p-6 bg-red-500 rounded-3xl space-y-4">
                          <p className="text-black font-black text-[11px] uppercase tracking-tighter">Are you absolutely sure? This will wipe the ENTIRE database permanently.</p>
                          <div className="flex gap-2">
                             <button onClick={() => setShowNuclearConfirm(false)} className="px-4 py-2 bg-black/20 text-black text-[10px] font-black uppercase rounded-lg">Abort</button>
                             <button onClick={() => { setShowNuclearConfirm(false); repairDatabaseAction(true); }} className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase rounded-lg">Proceed with Purge</button>
                          </div>
                       </div>
                     )}
                   </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/5">
                <p className="text-[8px] font-black text-center text-white/10 uppercase tracking-[0.4em]">CAUTION: PURGE OPERATIONS ARE IRREVERSIBLE AND TERMINAL</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBulkConfirmOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-10 space-y-8 shadow-2xl"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase">{bulkActionType === 'purge' ? 'Terminal Purge' : 'Batch Recycling'}</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Authorized Resource Destruction</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-white/60 leading-relaxed">
                  You are authorizing the {bulkActionType === 'purge' ? 'Permanent Purge' : 'Recycling'} of <span className="text-white font-bold">{selectedProducts.size}</span> matrix assets. This action is terminal and logged.
                </p>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Security PIN Required</label>
                  <input 
                    type="password"
                    maxLength={4}
                    placeholder="****"
                    autoFocus
                    value={bulkPin}
                    onChange={(e) => setBulkPin(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-red-500/50 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsBulkConfirmOpen(false)}
                  className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
                <button 
                  onClick={executeBulkAction}
                  disabled={bulkPin.length < 4}
                  className="py-4 bg-red-500 text-black hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
                >
                  Execute Batch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-10 space-y-8 shadow-2xl"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                  <Trash size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase">Terminal Purge</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Resource Destruction Protocol</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-white/60 leading-relaxed">
                  You are about to permanently move this {itemToDelete.type} to the Recycle Bin. It will be retained for 90 days before final destruction.
                </p>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Authorize Action (Enter PIN)</label>
                  <input 
                    type="password"
                    maxLength={4}
                    placeholder="****"
                    value={deletePin}
                    onChange={(e) => setDeletePin(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-red-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Abort Action
                </button>
                <button 
                  onClick={confirmDelete}
                  className="py-4 bg-red-500 text-black hover:bg-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
                >
                  Execute Purge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Quick Action (ID 122) */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-12 right-12 w-20 h-20 bg-primary text-primary-foreground rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-50 border-4 border-surface-container-lowest group"
      >
        <Plus size={32} />
        <span className="absolute right-full mr-6 px-4 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-[0.3em] rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-2xl">Register Asset (ID 122)</span>
      </motion.button>

      {/* Bulk Reprice Modal */}
      <AnimatePresence>
        {isBulkPriceModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-md w-full bg-[#111] border border-white/10 rounded-[2.5rem] p-10 space-y-8"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <Tag size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Batch Re-price</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">{selectedProducts.size} Assets Selected</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex bg-white/5 p-2 rounded-2xl">
                  <button 
                    onClick={() => setBulkPriceData({ ...bulkPriceData, mode: 'percentage' })}
                    className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${bulkPriceData.mode === 'percentage' ? 'bg-white text-black' : 'text-white/40'}`}
                  >
                    Percentage (%)
                  </button>
                  <button 
                    onClick={() => setBulkPriceData({ ...bulkPriceData, mode: 'fixed' })}
                    className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${bulkPriceData.mode === 'fixed' ? 'bg-white text-black' : 'text-white/40'}`}
                  >
                    Fixed Price (Dinar)
                  </button>
                </div>

                {bulkPriceData.mode === 'percentage' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Adjustment Percentage</label>
                    <input 
                      type="number"
                      placeholder="e.g. 10 or -5"
                      value={bulkPriceData.percentage}
                      onChange={(e) => setBulkPriceData({ ...bulkPriceData, percentage: parseFloat(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-2xl font-black text-white outline-none focus:border-blue-500 transition-all"
                    />
                    <p className="text-[8px] font-bold text-center text-white/20 uppercase tracking-widest">Positive for markup, negative for discount</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">New Fixed Price</label>
                    <input 
                      type="number"
                      placeholder="0.000"
                      value={bulkPriceData.fixedAmount}
                      onChange={(e) => setBulkPriceData({ ...bulkPriceData, fixedAmount: parseFloat(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-2xl font-black text-white outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsBulkPriceModalOpen(false)}
                  className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBulkReprice}
                  className="py-4 bg-blue-500 text-black hover:bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                >
                  Apply Global Shift
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </Gate>
);
};
