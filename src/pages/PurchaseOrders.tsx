import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  FileText, 
  Truck, 
  Clock, 
  ChevronRight, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  FileDown,
  Trash2,
  PackageCheck,
  X,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface POItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

interface PurchaseOrder {
  _id: string;
  supplierId: { _id: string; name: string };
  items: { productId: any; quantity: number; unitCost: number }[];
  totalLanded: number;
  status: 'draft' | 'pending_approval' | 'sent' | 'received' | 'cancelled';
  createdAt: string;
}

export const PurchaseOrders = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'pending_approval' | 'sent' | 'received'>('all');
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Create PO State
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [targetStore, setTargetStore] = useState('');
  const [poItems, setPoItems] = useState<POItem[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  const fetchPOs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/inventory/po');
      setPos(response.data);
    } catch (error) {
      toast.error("Failed to fetch purchase orders");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [suppRes, prodRes, storeRes] = await Promise.all([
        axios.get('/api/suppliers'),
        axios.get('/api/products/search?q='),
        axios.get('/api/stores')
      ]);
      setSuppliers(suppRes.data);
      setProducts(prodRes.data);
      setStores(storeRes.data);
      if (storeRes.data.length > 0) setTargetStore(storeRes.data[0]._id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPOs();
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (itemSearch.length > 1) {
      setFilteredProducts(products.filter(p => 
        p.name.toLowerCase().includes(itemSearch.toLowerCase()) || 
        p.sku.toLowerCase().includes(itemSearch.toLowerCase())
      ).slice(0, 5));
    } else {
      setFilteredProducts([]);
    }
  }, [itemSearch, products]);

  const handleAddItem = (product: any) => {
    if (poItems.find(i => i.productId === product._id)) {
      toast.error("Product already in list");
      return;
    }
    setPoItems([...poItems, { productId: product._id, quantity: 1, unitCost: product.cost || 0, name: product.name } as any]);
    setItemSearch('');
  };

  const handleCreatePO = async () => {
    if (!selectedSupplier || poItems.length === 0) {
      toast.error("Please select supplier and add items");
      return;
    }

    try {
      await axios.post('/api/inventory/po', {
        supplierId: selectedSupplier,
        targetStoreId: targetStore,
        items: poItems,
        status: 'pending_approval',
        landedCostBreakdown: { shipping: 0, customs: 0, insurance: 0 }
      });
      toast.success("Purchase Order Created and sent for approval");
      setIsCreateModalOpen(false);
      fetchPOs();
    } catch (error) {
      toast.error("Creation failed");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sent': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending_approval': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'draft': return 'bg-white/5 text-white/40 border-white/10';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight leading-none">Purchase Matrix</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Supply Chain & Procurement (ID 125)</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-10 py-5 bg-primary text-black rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
        >
          <Plus size={20} /> Create Acquisition Manifest
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Open POs', value: pos.filter(p => p.status !== 'received' && p.status !== 'cancelled').length, icon: Clock, color: 'text-blue-500' },
          { label: 'Pending Arrival', value: pos.filter(p => p.status === 'sent').length, icon: Truck, color: 'text-amber-500' },
          { label: 'Total Valuation', value: `${pos.reduce((sum, p) => sum + p.totalLanded, 0).toLocaleString()} KD`, icon: DollarSign, color: 'text-green-500' },
          { label: 'Items Tracked', value: pos.reduce((sum, p) => sum + p.items.length, 0), icon: Package, color: 'text-primary' },
        ].map((stat, i) => (
          <div key={i} className="surface-container p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
            <div>
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black font-mono tracking-tighter">{stat.value}</h3>
            </div>
            <div className={`p-4 bg-white/5 rounded-2xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded-[2rem] max-w-2xl">
          {(['all', 'draft', 'pending_approval', 'sent', 'received'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-[1.5rem] text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="surface-container rounded-[3rem] border border-white/5 overflow-hidden">
          <div className="grid grid-cols-6 gap-6 p-6 bg-white/5 border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/30">
            <div className="col-span-2">Order Identification</div>
            <div>Submission Date</div>
            <div>Valuation (KD)</div>
            <div>Matrix Status</div>
            <div className="text-right px-4">Action</div>
          </div>

          <div className="divide-y divide-white/5">
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4 opacity-40">
                <Loader2 className="animate-spin" />
                <p className="text-[9px] font-black uppercase tracking-widest">Querying Procurement Database...</p>
              </div>
            ) : pos.filter(po => activeTab === 'all' || po.status === activeTab).length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4 opacity-20">
                <FileText size={48} />
                <p className="text-[9px] font-black uppercase tracking-widest">No matching records found</p>
              </div>
            ) : pos.filter(po => activeTab === 'all' || po.status === activeTab).map(po => (
              <motion.div 
                key={po._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-6 gap-6 p-8 items-center hover:bg-white/[0.02] transition-all group"
              >
                <div className="col-span-2 flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 ${po.status === 'received' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">{po.supplierId?.name || 'Unknown Supplier'}</h4>
                    <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">{po._id.slice(-8).toUpperCase()} • {po.items.length} Lines</span>
                  </div>
                </div>
                
                <p className="text-xs font-black font-mono text-white/40">{new Date(po.createdAt).toLocaleDateString()}</p>
                
                <p className="text-sm font-black font-mono text-white/80">{po.totalLanded.toLocaleString()}</p>
                
                <div>
                  <span className={`px-4 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${getStatusColor(po.status)}`}>
                    {po.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-end items-center gap-3 pr-4">
                  <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                    <FileDown size={14} />
                  </button>
                  <button className="px-6 py-3 bg-white/5 group-hover:bg-primary group-hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                    Detail Blade
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Create PO Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-low border border-white/5 rounded-[3rem] p-12 max-w-4xl w-full shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Purchase Request</h2>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">New Acquisition Manifest</p>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-4 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Select Supplier</label>
                  <select 
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-primary transition-all"
                  >
                    <option value="">Choose Supplier...</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Ship-To Node</label>
                  <select 
                    value={targetStore}
                    onChange={(e) => setTargetStore(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-primary transition-all"
                  >
                    <option value="">Choose Node...</option>
                    {stores.map(s => <option key={s._id} value={s._id}>{s.name} ({s.address})</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <input 
                    type="text"
                    placeholder="Search Products by SKU or Name..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-sm font-black outline-none focus:border-primary transition-all"
                  />
                  
                  <AnimatePresence>
                    {filteredProducts.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-surface-container border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl"
                      >
                        {filteredProducts.map(p => (
                          <button 
                            key={p._id}
                            onClick={() => handleAddItem(p)}
                            className="w-full p-6 text-left hover:bg-white/5 flex items-center justify-between border-b border-white/5 last:border-0"
                          >
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight">{p.name}</p>
                              <p className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-widest">{p.sku}</p>
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Select Product</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="surface-container rounded-[2rem] border border-white/5 max-h-[300px] overflow-y-auto">
                   {poItems.length === 0 ? (
                     <div className="p-12 text-center opacity-20">
                       <Package size={40} className="mx-auto mb-4" />
                       <p className="text-[9px] font-black uppercase tracking-widest">Manifest is currently empty</p>
                     </div>
                   ) : (
                     <div className="divide-y divide-white/5">
                        {poItems.map((item: any, idx) => (
                          <div key={idx} className="p-6 flex items-center justify-between group">
                            <div className="flex-1">
                               <p className="text-[11px] font-black uppercase tracking-tight">{item.name}</p>
                               <p className="text-[8px] font-mono font-bold text-white/20">LINE ITEM {idx + 1}</p>
                            </div>
                            <div className="flex items-center gap-12">
                               <div className="flex flex-col items-end">
                                 <label className="text-[7px] font-black text-white/20 uppercase tracking-widest">Qty</label>
                                 <input 
                                   type="number"
                                   className="w-20 bg-transparent text-right font-mono font-black text-xs outline-none text-primary"
                                   value={item.quantity}
                                   onChange={(e) => {
                                      const newItems = [...poItems];
                                      newItems[idx].quantity = Number(e.target.value);
                                      setPoItems(newItems);
                                   }}
                                 />
                               </div>
                               <div className="flex flex-col items-end">
                                 <label className="text-[7px] font-black text-white/20 uppercase tracking-widest">Unit Cost</label>
                                 <input 
                                   type="number"
                                   step="0.001"
                                   className="w-24 bg-transparent text-right font-mono font-black text-xs outline-none text-primary"
                                   value={item.unitCost}
                                   onChange={(e) => {
                                      const newItems = [...poItems];
                                      newItems[idx].unitCost = Number(e.target.value);
                                      setPoItems(newItems);
                                   }}
                                 />
                               </div>
                               <button 
                                 onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                                 className="p-3 text-white/20 hover:text-red-500 transition-colors"
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Estimated Value</p>
                   <p className="text-2xl font-black font-mono tracking-tighter">
                     {poItems.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0).toLocaleString()} <span className="text-sm font-normal text-white/20">KD</span>
                   </p>
                </div>
                <div className="flex gap-4">
                   <button 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-8 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={handleCreatePO}
                    className="px-10 py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                   >
                     Submit Manifest
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurchaseOrders;
