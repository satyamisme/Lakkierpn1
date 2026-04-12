import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  Package, 
  CreditCard, 
  ArrowUpRight, 
  Search, 
  Plus,
  ArrowRight,
  ShieldCheck,
  Globe,
  Activity,
  BarChart3,
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';
import axios from 'axios';

import { NewPOModal } from '../components/NewPOModal';
import { NewVendorModal } from '../components/NewVendorModal';
import { toast } from 'sonner';

/**
 * ID 142: Supplier Portal (SupplierPortal.tsx)
 * Vendor management, PO tracking, and landed cost reconciliation.
 */
export const SupplierPortal: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [suppliersRes, posRes] = await Promise.all([
        axios.get('/api/suppliers'),
        axios.get('/api/suppliers/purchase-orders')
      ]);
      setSuppliers(suppliersRes.data);
      setPurchaseOrders(posRes.data);
    } catch (error) {
      console.error("Supplier fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceivePO = async (id: string) => {
    try {
      await axios.patch(`/api/suppliers/purchase-orders/${id}/receive`);
      toast.success("Purchase Order received. Inventory updated.");
      fetchData();
    } catch (error) {
      toast.error("Failed to receive PO.");
    }
  };

  return (
    <div className="space-y-16 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Supplier Matrix</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">
            Global Vendor Infrastructure & Procurement Streams (ID 142)
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsPOModalOpen(true)}
            className="px-10 py-5 bg-surface-container-lowest border border-border text-foreground rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-sm hover:bg-muted transition-all flex items-center gap-3"
          >
            <Plus size={20} />
            New Purchase Order
          </button>
          <button 
            onClick={() => setIsVendorModalOpen(true)}
            className="px-10 py-5 bg-primary text-primary-foreground rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <Plus size={20} />
            Register New Vendor
          </button>
        </div>
      </header>

      {/* Vendor Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Vendor Matrix...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full text-center py-20 opacity-20">
            <Truck size={48} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest">No vendors registered</p>
          </div>
        ) : suppliers.map((vendor, index) => (
          <motion.div 
            key={vendor._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface-container-lowest border border-border rounded-[3.5rem] p-10 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-10">
              <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-all duration-500">
                <Globe size={32} />
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                vendor.outstandingDebt > 0 ? 'bg-amber-500/5 text-amber-500 border-amber-500/10' : 'bg-green-500/5 text-green-500 border-green-500/10'
              }`}>
                {vendor.outstandingDebt > 0 ? 'Outstanding' : 'Clear'}
              </span>
            </div>

            <h3 className="text-2xl font-serif italic mb-2 group-hover:text-primary transition-colors">{vendor.name}</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-8">{vendor.contactPerson || 'Global Vendor'}</p>
            
            <div className="space-y-4 pt-8 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Outstanding</span>
                <span className="text-sm font-mono font-black">{vendor.outstandingDebt.toFixed(3)} KD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Performance</span>
                <span className="text-[10px] font-black text-primary">95%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Procurement Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-border rounded-[4rem] p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
            <div>
              <h3 className="text-4xl font-serif italic">Procurement Streams</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Active Purchase Order Lifecycle</p>
            </div>
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search PO Matrix..."
                className="bg-surface border border-border pl-14 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all w-full md:w-64"
              />
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {purchaseOrders.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <Package size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest">No active purchase orders</p>
              </div>
            ) : purchaseOrders.map((po) => (
              <motion.div 
                key={po._id} 
                whileHover={{ x: 10 }}
                className="flex items-center justify-between p-8 bg-surface border border-border rounded-[2.5rem] group hover:border-primary/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-muted border border-border rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:rotate-12 transition-all duration-500 shadow-inner">
                    <Package size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-black uppercase tracking-tighter">PO-{po._id.slice(-6).toUpperCase()}</p>
                      <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                        {po.supplierId?.name || 'Unknown Supplier'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-[10px] text-foreground font-black uppercase tracking-widest">{po.items?.length || 0} Line Items</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                        <Activity size={12} className="text-primary" />
                        {new Date(po.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm font-mono font-black">{po.totalLanded.toFixed(3)} KD</p>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Landed Cost</p>
                  </div>
                  <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                    po.status === 'received' ? 'bg-green-500/5 text-green-500 border-green-500/10' : 
                    po.status === 'draft' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {po.status}
                  </span>
                  {po.status === 'draft' ? (
                    <button 
                      onClick={() => handleReceivePO(po._id)}
                      className="px-6 py-3 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                    >
                      Receive
                    </button>
                  ) : (
                    <button className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90 shadow-sm">
                      <ArrowRight size={20} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-foreground text-background rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-3xl font-serif italic mb-8">RMA Matrix</h3>
            <div className="space-y-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Pending Returns</p>
                  <p className="text-5xl font-mono font-black">14</p>
                </div>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="text-amber-500" size={32} />
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  className="h-full bg-amber-500"
                />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">65% of monthly threshold reached</p>
            </div>
            <button className="w-full mt-10 py-5 bg-white text-foreground rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-xl">
              Initiate Bulk RMA
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-[4rem] p-12 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-lg font-serif italic">Vendor Compliance</h4>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Trust Index 9.8/10</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest">VAT Verified</span>
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest">SLA Compliance</span>
                <span className="text-[10px] font-black text-primary">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewPOModal 
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        onSuccess={fetchData}
      />

      <NewVendorModal 
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

const CheckCircle2 = ({ size, className }: { size: number, className?: string }) => (
  <ShieldCheck size={size} className={className} />
);
