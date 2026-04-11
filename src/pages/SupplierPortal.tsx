import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Truck, 
  Package, 
  FileText, 
  Plus,
  Search,
  ArrowRight
} from 'lucide-react';

/**
 * ID 122: Supplier Portal
 * Vendor management, PO tracking, and RMA.
 */
export const SupplierPortal: React.FC = () => {
  const suppliers = [
    { name: 'Apple Authorized Dist.', category: 'Devices', status: 'Preferred', activePO: 3 },
    { name: 'Samsung Gulf', category: 'Devices', status: 'Preferred', activePO: 1 },
    { name: 'Anker Official', category: 'Accessories', status: 'Active', activePO: 5 },
    { name: 'Local Parts Hub', category: 'Repair Parts', status: 'Active', activePO: 12 },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight text-foreground">Supplier Portal</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Vendor & PO Management (ID 122)</p>
        </div>
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <Plus size={16} /> Add Supplier
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier.name} className="bg-surface-container-lowest border border-border p-6 rounded-[2rem] shadow-sm group hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-muted rounded-2xl text-muted-foreground group-hover:text-primary transition-colors"><Users size={20} /></div>
              <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                supplier.status === 'Preferred' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
              }`}>
                {supplier.status}
              </span>
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-1">{supplier.name}</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">{supplier.category}</p>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xl font-mono font-black">{supplier.activePO} <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Active POs</span></span>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors"><ArrowRight size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-border rounded-[3rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif italic">Recent Purchase Orders</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input type="text" placeholder="Search POs..." className="bg-muted border border-border pl-10 pr-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary" />
            </div>
          </div>
          <div className="space-y-4">
            {[
              { id: 'PO-2024-001', supplier: 'Apple Authorized', amount: 12450.000, date: '2024-03-20', status: 'Shipped' },
              { id: 'PO-2024-002', supplier: 'Anker Official', amount: 850.500, date: '2024-03-21', status: 'Pending' },
              { id: 'PO-2024-003', supplier: 'Samsung Gulf', amount: 5200.000, date: '2024-03-22', status: 'Draft' },
            ].map((po) => (
              <div key={po.id} className="flex items-center justify-between p-6 bg-muted/30 border border-border rounded-3xl group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-card border border-border rounded-2xl text-muted-foreground group-hover:text-primary transition-colors">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{po.id} • {po.supplier}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{po.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-mono font-black">{po.amount.toFixed(3)} KD</span>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    po.status === 'Shipped' ? 'bg-green-500 text-white' : 
                    po.status === 'Pending' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {po.status}
                  </span>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors"><ArrowRight size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm flex flex-col">
          <h3 className="text-xl font-serif italic mb-8">RMA & Returns</h3>
          <div className="flex-1 space-y-6">
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Pending RMAs</p>
              <p className="text-3xl font-mono font-black text-red-500">14 <span className="text-xs">Units</span></p>
            </div>
            <div className="p-6 bg-muted/30 border border-border rounded-3xl">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Vendor Credit Balance</p>
              <p className="text-3xl font-mono font-black">450.250 <span className="text-xs text-muted-foreground">KD</span></p>
            </div>
          </div>
          <button className="w-full mt-8 py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all">
            Initiate Bulk RMA
          </button>
        </div>
      </div>
    </div>
  );
};
