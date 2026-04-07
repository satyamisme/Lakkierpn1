import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Package, 
  AlertTriangle, 
  ArrowRightLeft, 
  TrendingUp, 
  Plus, 
  Search, 
  Loader2,
  CheckCircle2,
  Truck
} from "lucide-react";
import { Gate } from "../components/Gate";

export const InventoryDashboard: React.FC = () => {
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [lowStockRes, transfersRes] = await Promise.all([
        fetch('/api/inventory/low-stock', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/inventory/transfers', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);
      
      if (lowStockRes.ok) setLowStock(await lowStockRes.json());
      if (transfersRes.ok) setTransfers(await transfersRes.json());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceive = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory/transfers/${id}/receive`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        fetchData();
        alert("Transfer received & stock updated!");
      }
    } catch (error) {
      console.error("Receive error:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Inventory Hub</h1>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">Multi-store stock & transfers</p>
        </div>
        <Gate id={122}>
          <button className="bg-primary text-primary-foreground px-6 py-3 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all">
            <Plus size={16} /> New Transfer Request
          </button>
        </Gate>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Widget (ID 125) */}
        <Gate id={125}>
          <div className="bg-card border border-border p-6 shadow-xl space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-red-500">
              <AlertTriangle size={18} />
              Low Stock Alarms
            </h2>
            <div className="space-y-2">
              {lowStock.length === 0 ? (
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">All stock levels healthy</p>
              ) : (
                lowStock.map((p) => (
                  <div key={p._id} className="p-3 bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-tighter leading-tight">{p.name}</p>
                      <p className="text-[9px] font-mono text-muted-foreground">SKU: {p.sku}</p>
                    </div>
                    <span className="text-sm font-black text-red-500 font-mono">{p.stock}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Gate>

        {/* Transfer Approvals (ID 124) */}
        <Gate id={124}>
          <div className="lg:col-span-2 bg-card border border-border p-6 shadow-xl space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <ArrowRightLeft size={18} className="text-primary" />
              Incoming Transfers
            </h2>
            <div className="space-y-4">
              {transfers.filter(t => t.status === 'shipped').length === 0 ? (
                <div className="p-12 border border-dashed border-border text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No pending arrivals</p>
                </div>
              ) : (
                transfers.filter(t => t.status === 'shipped').map((t) => (
                  <div key={t._id} className="p-4 bg-muted/30 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Truck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tighter">From: {t.fromStoreId}</p>
                        <p className="text-[9px] font-mono text-muted-foreground">{t.items.length} Items | Requested by Admin</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleReceive(t._id)}
                      className="bg-green-500 text-white px-4 py-2 font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} /> Receive
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Gate>
      </div>

      {/* Global Stock Table (ID 121) */}
      <Gate id={121}>
        <div className="bg-card border border-border shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2">
              <Package size={20} className="text-primary" />
              Global Stock Matrix
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input 
                type="text" 
                placeholder="Filter Matrix..."
                className="bg-muted border border-border pl-10 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Product</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">SKU</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Category</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Stock</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Value (KD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : (
                  lowStock.map((p) => (
                    <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-xs font-bold uppercase tracking-widest">{p.name}</td>
                      <td className="p-4 text-xs font-mono">{p.sku}</td>
                      <td className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{p.category}</td>
                      <td className="p-4">
                        <span className={`text-xs font-black font-mono ${p.stock < 5 ? 'text-red-500' : ''}`}>{p.stock}</span>
                      </td>
                      <td className="p-4 text-xs font-black font-mono">{(p.cost * p.stock).toFixed(3)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Gate>
    </div>
  );
};
