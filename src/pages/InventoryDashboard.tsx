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
  Layers
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";
import { toast } from "sonner";
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
  const [searchQuery, setSearchQuery] = useState(searchParams.get('sku') || "");

  useEffect(() => {
    const sku = searchParams.get('sku');
    if (sku) setSearchQuery(sku);
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [lowStockRes, transfersRes, allProductsRes] = await Promise.all([
        axios.get('/api/products/low-stock'),
        axios.get('/api/inventory/transfers'),
        axios.get('/api/products')
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

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Inventory Hub</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">Multi-store stock matrix & supply chain (ID 121)</p>
        </div>
        <Gate id={122}>
          <div className="flex gap-6">
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
        <div className="bg-surface-container-lowest border border-border rounded-[4rem] shadow-sm overflow-hidden">
          <div className="p-10 border-b border-border bg-surface-container-lowest/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h2 className="text-4xl font-serif italic tracking-tight flex items-center gap-4">
                <Package size={32} className="text-primary" />
                Global Stock Matrix
              </h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-3 opacity-60">Real-time cross-node inventory synchronization</p>
            </div>
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
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest border-b border-border">
                  <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Product Identity</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">SKU / Model</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Category</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 text-right">Available</th>
                  <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 text-right">Value (KD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-40 text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-20" />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-40 text-center text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-30 italic">
                      No matching assets found in matrix
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-surface transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-muted rounded-2xl overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-700 border border-border shadow-sm">
                            <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{p.name}</span>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchData}
      />

      <StockIntakeModal 
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};
