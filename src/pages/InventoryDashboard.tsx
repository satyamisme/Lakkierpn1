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

  const filteredProducts = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query) ||
      p.modelNumber?.toLowerCase().includes(query)
    );
  }, [allProducts, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p._id)));
    }
  };

  const toggleSelectProduct = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  useEffect(() => {
    const handleOpenIntake = (e: any) => {
      setIntakeInitialItems(e.detail.products);
      setIsIntakeModalOpen(true);
    };
    window.addEventListener('open-stock-intake', handleOpenIntake);
    return () => window.removeEventListener('open-stock-intake', handleOpenIntake);
  }, []);

  useEffect(() => {
    const sku = searchParams.get('sku');
    if (sku) setSearchQuery(sku);
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [showTrash]);

  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [bulkPin, setBulkPin] = useState("");
  const [bulkActionType, setBulkActionType] = useState<'recycle' | 'purge' | 'restore'>('recycle');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [lowStockRes, transfersRes, allProductsRes] = await Promise.all([
        axios.get('/api/products/low-stock'),
        axios.get('/api/inventory/transfers'),
        axios.get(`/api/products?showDeleted=${showTrash}`)
      ]);
      
      if (lowStockRes.status === 200) {
        setLowStock(lowStockRes.data.map((p: any) => ({
          ...p,
          image: p.image || `https://picsum.photos/seed/${p.sku}/200/200`
        })));
      }
      if (transfersRes.status === 200) setTransfers(transfersRes.data);
      if (allProductsRes.status === 200) {
        const data = allProductsRes.data;
        const productsList = Array.isArray(data) ? data : (data.products || []);
        setAllProducts(productsList.map((p: any) => ({
          ...p,
          image: p.image || `https://picsum.photos/seed/${p.sku}/200/200`
        })));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to sync inventory matrix.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceive = async (id: string) => {
    try {
      const response = await axios.patch(`/api/inventory/transfers/${id}/status`, { status: 'received' });
      if (response.status === 200) {
        fetchData();
        toast.success("Transfer received & stock updated!");
      }
    } catch (error) {
      console.error("Receive error:", error);
      toast.error("Failed to process transfer.");
    }
  };

  const deleteProduct = (id: string) => {
    setItemToDelete({ id, type: 'product' });
  };

  const deleteVariant = (id: string) => {
    setItemToDelete({ id, type: 'variant' });
  };

  const repairDatabaseAction = async (fullPurge = false) => {
    const pin = prompt(`ENTER 4-DIGIT SECURITY PIN TO AUTHORIZE ${fullPurge ? 'NUCLEAR PURGE' : 'REPAIR'}:`);
    if (!pin) return;
    
    setIsRepairing(true);
    try {
      const res = await axios.post('/api/products/repair-database', { fullPurge, pin });
      toast.success(res.data.message || `Repair Complete: ${JSON.stringify(res.data.summary)}`);
      await fetchData();
      setIsMaintenanceOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Repair failed.");
    } finally {
      setIsRepairing(false);
    }
  };

  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'product' | 'variant' } | null>(null);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    if (!deletePin || deletePin.length < 4) {
      toast.error("Security PIN required for destruction.");
      return;
    }
    try {
      if (itemToDelete.type === 'product') {
        const url = showTrash 
          ? `/api/products/${itemToDelete.id}/purge`
          : `/api/products/${itemToDelete.id}`;
        
        if (showTrash) {
          await axios.post(url, { pin: deletePin });
          toast.success("Product permanently purged.");
        } else {
          await axios.delete(url, { data: { pin: deletePin } });
          toast.success("Product moved to Recycle Bin.");
        }
      } else {
        await axios.delete(`/api/products/variants/${itemToDelete.id}`, { data: { pin: deletePin } });
        toast.success("Variant moved to Recycle Bin.");
      }
      setItemToDelete(null);
      setDeletePin("");
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Action blocked by security module.");
      setDeletePin("");
    }
  };

  const handleRestore = async (id: string) => {
    const pin = prompt("ENTER 4-DIGIT SECURITY PIN TO RESTORE ASSET:");
    if (!pin) return;

    try {
      await axios.post(`/api/products/${id}/restore`, { pin });
      toast.success("Asset restored successfully.");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Restore failed.");
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) return;
    setBulkActionType(showTrash ? 'purge' : 'recycle');
    setIsBulkConfirmOpen(true);
  };

  const executeBulkAction = async () => {
    try {
      let url = '';
      let successMsg = '';
      
      switch(bulkActionType) {
        case 'purge':
          url = '/api/products/bulk-purge-permanent';
          successMsg = 'Assets permanently purged from matrix';
          break;
        case 'recycle':
          url = '/api/products/bulk-delete';
          successMsg = 'Assets moved to Recycle Bin';
          break;
        case 'restore':
          url = '/api/products/bulk-restore';
          successMsg = 'Assets recovered from Recycle Bin';
          break;
      }

      await axios.post(url, {
        ids: Array.from(selectedProducts),
        pin: bulkPin
      });

      toast.success(successMsg);
      setIsBulkConfirmOpen(false);
      setBulkPin("");
      setSelectedProducts(new Set());
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Batch operation failed.");
    }
  };

  const handleBulkRestore = () => {
    if (selectedProducts.size === 0) return;
    setBulkActionType('restore');
    setIsBulkConfirmOpen(true);
  };

  const handleBulkReprice = async () => {
    try {
      await axios.post('/api/products/bulk-reprice', {
        ids: Array.from(selectedProducts),
        ...(bulkPriceData.mode === 'percentage' 
            ? { percentage: bulkPriceData.percentage } 
            : { fixedAmount: bulkPriceData.fixedAmount })
      });
      toast.success("Asset Matrix Re-priced.");
      setIsBulkPriceModalOpen(false);
      setSelectedProducts(new Set());
      fetchData();
    } catch (err: any) {
      toast.error("Bulk re-pricing failed.");
    }
  };

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const toggleTrashMode = () => {
    setSelectedProducts(new Set());
    setShowTrash(!showTrash);
  };

  return (
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
          </div>
        </Gate>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Low Stock Widget (ID 125) */}
        <div className="lg:col-span-4">
          <Gate id={125}>
            <div className="bg-surface-container-lowest border border-border p-10 rounded-[3.5rem] shadow-sm space-y-10 h-full relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <h2 className="text-3xl font-serif italic flex items-center gap-4 text-red-500">
                  <AlertTriangle size={24} />
                  Stock Alarms
                </h2>
                <span className="px-4 py-1.5 bg-red-500/10 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20">Critical</span>
              </div>
              <div className="space-y-5 relative z-10">
                {lowStock.length === 0 ? (
                  <div className="py-20 border border-dashed border-border rounded-[2.5rem] text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">All levels healthy</p>
                  </div>
                ) : (
                  lowStock.slice(0, 5).map((p) => (
                    <div key={p._id} className="p-5 bg-red-500/[0.02] border border-red-500/10 rounded-3xl flex items-center gap-5 group hover:bg-red-500/[0.05] transition-all">
                      <div className="w-14 h-14 bg-muted rounded-2xl overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-500 border border-red-500/10">
                        <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black uppercase tracking-tighter leading-tight truncate group-hover:text-red-500 transition-colors">{p.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground font-bold opacity-60">{p.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-red-500 font-mono leading-none">{p.stock}</span>
                        <p className="text-[9px] font-black text-red-500/40 uppercase tracking-widest mt-1">Left</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
            </div>
          </Gate>
        </div>

        {/* Transfer Approvals (ID 124) */}
        <div className="lg:col-span-8">
          <Gate id={124}>
            <div className="bg-surface-container-lowest border border-border p-10 rounded-[3.5rem] shadow-sm space-y-10 h-full relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <h2 className="text-3xl font-serif italic flex items-center gap-4 text-primary">
                  <ArrowRightLeft size={24} />
                  Incoming Transfers
                </h2>
                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">In Transit</span>
              </div>
              <div className="space-y-5 relative z-10">
                {transfers.filter(t => t.status === 'shipped').length === 0 ? (
                  <div className="py-32 border border-dashed border-border rounded-[3rem] text-center">
                    <Truck className="w-16 h-16 text-muted-foreground/10 mx-auto mb-6" />
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">No pending arrivals</p>
                  </div>
                ) : (
                  transfers.filter(t => t.status === 'shipped').map((t) => (
                    <div key={t._id} className="p-8 bg-surface border border-border rounded-[2.5rem] flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm">
                      <div className="flex items-center gap-8">
                        <div className="p-5 bg-primary/5 rounded-[1.5rem] text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                          <Truck className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-lg font-black uppercase tracking-tighter">From: {t.fromStoreId}</p>
                          <p className="text-[11px] font-mono text-muted-foreground font-bold mt-2 opacity-60">{t.items.length} Items • Requested by Admin</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleReceive(t._id)}
                        className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-green-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-2xl shadow-green-500/30"
                      >
                        <CheckCircle2 size={18} /> Receive Node
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
            </div>
          </Gate>
        </div>
      </div>

      {/* Global Stock Table (ID 121) */}
      <Gate id={121}>
        <div className="space-y-10">
          <div className="bg-surface-container-lowest border border-border rounded-[4rem] shadow-sm overflow-hidden">
            <div className="p-10 border-b border-border bg-surface-container-lowest/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h2 className="text-4xl font-serif italic tracking-tight flex items-center gap-4">
                  <Smartphone size={32} className="text-primary" />
                  IMEI / Serial Lookup
                </h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-3 opacity-60">Locate individual units across all nodes</p>
              </div>
              <div className="flex items-center gap-6">
                <Link 
                  to="/inventory/serial-matrix"
                  className="px-6 py-3 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all flex items-center gap-2"
                >
                  <ExternalLink size={14} /> Full Registry
                </Link>
                <div className="relative w-full md:w-96">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={20} />
                <input 
                  type="text" 
                  placeholder="Scan IMEI or Serial..."
                  className="w-full bg-surface border border-border pl-16 pr-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner placeholder:opacity-30"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val) {
                        try {
                          const res = await axios.get(`/api/inventory/lookup?q=${val}`);
                          if (res.data) {
                            toast.success(`Unit found: ${res.data.productName} (${res.data.status})`);
                          } else {
                            toast.error("Unit not found in matrix.");
                          }
                        } catch (err) {
                          toast.error("Lookup failed.");
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-border rounded-[4rem] shadow-sm overflow-hidden">
            <div className="p-10 border-b border-border bg-surface-container-lowest/50 flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <h2 className="text-4xl font-serif italic tracking-tight flex items-center gap-4">
                    <Package size={32} className="text-primary" />
                    Global Stock Matrix
                  </h2>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-3 opacity-60">Real-time cross-node inventory synchronization</p>
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
                      placeholder="Search Matrix..."
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
                      {showTrash && (
                        <button 
                          onClick={handleBulkRestore}
                          className="px-6 py-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap hover:bg-green-500 hover:text-white transition-all shadow-sm"
                        >
                          <RefreshCcw size={14} /> Bulk Restore
                        </button>
                      )}
                      
                      <button 
                        onClick={() => setSelectedProducts(new Set())}
                        className="px-6 py-3 text-muted-foreground text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all"
                      >
                        Cancel Selection
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-border">
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">
                      <input 
                        type="checkbox" 
                        checked={selectedProducts.size > 0 && selectedProducts.size === filteredProducts.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-primary rounded cursor-pointer"
                      />
                    </th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Product Identity</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">SKU / Model</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Category</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 text-right">Available</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 text-right">Value (KD)</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-40 text-center">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-20" />
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-40 text-center text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-30 italic">
                        No matching assets found in matrix
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <React.Fragment key={p._id}>
                        <tr 
                          className={`hover:bg-surface transition-colors group cursor-pointer ${expandedProducts.has(p._id) || selectedProducts.has(p._id) ? 'bg-surface' : ''}`}
                          onClick={() => p.variants?.length > 0 && toggleProduct(p._id)}
                        >
                          <td className="px-10 py-8">
                            <input 
                              type="checkbox"
                              checked={selectedProducts.has(p._id)}
                              onClick={(e) => toggleSelectProduct(p._id, e)}
                              onChange={() => {}} // Controlled by onClick
                              className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-6">
                              {p.variants?.length > 0 ? (
                                expandedProducts.has(p._id) ? <ChevronDown size={16} className="text-primary" /> : <ChevronRight size={16} className="text-muted-foreground" />
                              ) : <div className="w-4" />}
                              <div className="w-16 h-16 bg-muted rounded-2xl overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-700 border border-border shadow-sm">
                                <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{p.name}</span>
                                {p.variants?.length > 0 && (
                                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">{p.variants.length} Variants</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-xs font-mono text-muted-foreground font-bold opacity-60">{p.sku}</td>
                          <td className="px-10 py-8">
                            <span className="px-4 py-1.5 bg-surface border border-border rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <span className={`text-lg font-black font-mono ${p.stock < 5 ? 'text-red-500' : 'text-foreground'}`}>{p.stock}</span>
                          </td>
                          <td className="px-10 py-8 text-sm font-black font-mono text-right text-primary">{(p.cost * p.stock).toFixed(3)}</td>
                           <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {showTrash ? (
                                <>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRestore(p._id);
                                    }}
                                    className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 hover:bg-green-500 hover:text-white transition-all tooltip"
                                    title="Restore Asset"
                                  >
                                    <RefreshCcw size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteProduct(p._id);
                                    }}
                                    className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all tooltip"
                                    title="Purge Permanently"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {!p.isConfigurable && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIntakeInitialItems([p]);
                                        setIsIntakeModalOpen(true);
                                      }}
                                      className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                    >
                                      Add Stock
                                    </button>
                                  )}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingProduct(p);
                                      setIsAddModalOpen(true);
                                    }}
                                    className="p-2 bg-white/5 border border-border rounded-lg text-muted-foreground hover:text-primary transition-all"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteProduct(p._id);
                                    }}
                                    className="p-2 bg-white/5 border border-border rounded-lg text-muted-foreground hover:text-red-500 transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Variants Sub-table */}
                        <AnimatePresence>
                          {expandedProducts.has(p._id) && p.variants?.map((v: any) => (
                            <motion.tr 
                              key={v._id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-surface/30 border-l-4 border-primary"
                            >
                              <td className="px-10 py-4 pl-24">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden border border-border">
                                    <img src={v.images?.[0] || p.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-tight">{Object.values(v.attributes).join(' / ')}</span>
                                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{v.trackingMethod.toUpperCase()} Tracking</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-10 py-4 text-[10px] font-mono text-muted-foreground font-bold">{v.sku}</td>
                              <td className="px-10 py-4">
                                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{v.binLocation || 'No Bin'}</span>
                              </td>
                              <td className="px-10 py-4 text-right">
                                <span className={`text-sm font-black font-mono ${v.stock < 5 ? 'text-red-500' : 'text-foreground'}`}>{v.stock}</span>
                              </td>
                              <td className="px-10 py-4 text-right text-[10px] font-black font-mono text-primary/60">{(v.cost * v.stock).toFixed(3)}</td>
                              <td className="px-10 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIntakeInitialItems([{ ...v, name: `${p.name} (${Object.values(v.attributes).join('/')})`, brand: p.brand }]);
                                      setIsIntakeModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 bg-primary/5 text-primary rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                  >
                                    Add Stock
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteVariant(v._id);
                                    }}
                                    className="p-2 bg-white/5 border border-border rounded-lg text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Gate>

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
  );
};
