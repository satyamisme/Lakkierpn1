import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Activity,
  RefreshCcw,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { Gate } from '../components/PermissionGuard';

/**
 * ID 192: Executive Cockpit
 * High-density revenue and security watchtower.
 */
export const Cockpit: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [criticalInventory, setCriticalInventory] = useState<any[]>([]);

  const fetchCockpitData = async () => {
    try {
      setIsLoading(true);
      // Simulate fetching from multiple endpoints
      const [salesRes, inventoryRes] = await Promise.all([
        fetch('/api/reports/z-report', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/inventory/low-stock', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);

      // Note: z-report returns a PDF in the current implementation, but we might want a JSON version for the dashboard
      // For now, we'll use mock data but structured as if it came from the API to demonstrate the UI
      
      setStats([
        { label: 'Total Revenue', value: '428,940.50 KD', trend: '+12.4%', up: true, icon: <DollarSign className="w-5 h-5" /> },
        { label: 'Target Progress', value: '85.8%', trend: 'On Track', up: true, icon: <Activity className="w-5 h-5" /> },
        { label: 'SLA Risks', value: '12', trend: 'Critical', up: false, icon: <AlertTriangle className="w-5 h-5" /> },
        { label: 'Units Sold', value: '1,402', trend: '+5.2%', up: true, icon: <Package className="w-5 h-5" /> },
      ]);

      if (inventoryRes.ok) {
        const lowStock = await inventoryRes.json();
        setCriticalInventory(lowStock.slice(0, 4));
      }

    } catch (error) {
      console.error("Cockpit fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCockpitData();
  }, []);

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
              Enterprise Mode
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest">
              <Clock size={10} /> Last Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <h1 className="text-6xl font-serif italic tracking-tight text-foreground leading-none">Executive Cockpit</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Revenue & Security Watchtower (ID 192)</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchCockpitData}
            className="p-4 bg-surface-container border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all active:scale-95"
          >
            <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-8 py-4 bg-surface-container border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all">Bulk Reorder</button>
          <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">Cash Sweep</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container-lowest border border-border p-8 rounded-[2.5rem] shadow-sm group hover:border-primary/50 transition-all relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3 bg-muted rounded-2xl text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${stat.up ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 relative z-10">{stat.label}</p>
            <h2 className={`text-3xl font-mono font-black relative z-10 ${stat.label === 'Total Revenue' ? 'text-primary' : 'text-foreground'}`}>
              {stat.value}
            </h2>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-surface-container-lowest border border-border rounded-[3rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20">
              <div>
                <h3 className="text-2xl font-serif italic">Inventory Critical Matrix</h3>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Real-time supply chain pressure</p>
              </div>
              <span className="px-4 py-1.5 bg-red-500/10 text-red-600 border border-red-500/20 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                Live Feed
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Product Identity</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">SKU</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Demand</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(criticalInventory.length > 0 ? criticalInventory : [
                    { name: 'iPhone 15 Pro Max', sku: 'IP15PM-256-BLU', stock: 2, demand: 45, critical: true },
                    { name: 'Samsung S24 Ultra', sku: 'S24U-512-TIT', stock: 14, demand: 28, critical: false },
                    { name: 'Google Pixel 8 Pro', sku: 'PX8P-128-OBS', stock: 5, demand: 12, critical: true },
                    { name: 'iPad Pro M2', sku: 'IPDM2-11-GRY', stock: 8, demand: 15, critical: false },
                  ]).map((item) => (
                    <tr key={item.sku} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                            <img src={`https://picsum.photos/seed/${item.sku}/100/100`} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="font-black uppercase text-xs tracking-tighter">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px] text-muted-foreground font-bold">{item.sku}</td>
                      <td className={`px-8 py-6 text-right font-mono font-black ${item.stock < 5 ? 'text-red-500' : 'text-foreground'}`}>{item.stock}</td>
                      <td className="px-8 py-6 text-right font-mono font-bold text-primary">{item.demand || 0}</td>
                      <td className="px-8 py-6 text-center">
                        <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">Restock</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-[3rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20">
              <div>
                <h3 className="text-2xl font-serif italic">Node Inventory Distribution</h3>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Global Asset Allocation</p>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="w-2 h-2 rounded-full bg-muted" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Store Node</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Stock</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">In-Transit</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Value (KD)</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { node: 'Salmiya Branch #04', stock: 1240, transit: 150, value: 45200.000, status: 'Optimal' },
                    { node: 'Hawally Hub #01', stock: 3850, transit: 420, value: 128400.000, status: 'Surplus' },
                    { node: 'Main Warehouse', stock: 12400, transit: 0, value: 842900.000, status: 'Optimal' },
                    { node: 'Airport Kiosk #09', stock: 180, transit: 45, value: 12400.000, status: 'Low' },
                  ].map((node) => (
                    <tr key={node.node} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-6 font-black uppercase text-xs tracking-tighter">{node.node}</td>
                      <td className="px-8 py-6 text-right font-mono font-black">{node.stock.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right font-mono text-primary font-bold">+{node.transit}</td>
                      <td className="px-8 py-6 text-right font-mono font-bold">{node.value.toFixed(3)}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          node.status === 'Optimal' ? 'bg-green-500/5 text-green-600 border-green-500/20' : 
                          node.status === 'Surplus' ? 'bg-primary/5 text-primary border-primary/20' : 'bg-red-500/5 text-red-600 border-red-500/20'
                        }`}>
                          {node.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm">
            <h3 className="text-2xl font-serif italic mb-8">SLA Risk Watchtower</h3>
            <div className="space-y-6">
              {[
                { label: 'Repair Ticket Breach', value: '8', status: 'critical', desc: 'Tickets > 48h without QC' },
                { label: 'B2B Order Breach', value: '2', status: 'warning', desc: 'PO pending > 5 days' },
                { label: 'RMA Validation', value: '14', status: 'normal', desc: 'Supplier returns pending' },
              ].map((risk) => (
                <div key={risk.label} className="p-6 bg-muted/20 rounded-[2rem] border border-border group hover:border-red-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{risk.label}</span>
                    <span className={`font-mono font-black text-2xl ${risk.status === 'critical' ? 'text-red-500' : risk.status === 'warning' ? 'text-amber-600' : 'text-foreground'}`}>
                      {risk.value}
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">{risk.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary p-10 rounded-[3rem] shadow-2xl shadow-primary/40 text-primary-foreground relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-2xl font-serif italic">System Integrity</h3>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-8">All Nodes Operational</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Uptime</span>
                  <span>99.99%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '99.99%' }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  />
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex-1 p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-[8px] opacity-60 mb-1">Latency</p>
                    <p className="font-mono font-black text-xs">14ms</p>
                  </div>
                  <div className="flex-1 p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-[8px] opacity-60 mb-1">Load</p>
                    <p className="font-mono font-black text-xs">12%</p>
                  </div>
                </div>
              </div>
            </div>
            <Activity className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute top-0 right-0 p-8">
              <Zap className="w-6 h-6 text-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
