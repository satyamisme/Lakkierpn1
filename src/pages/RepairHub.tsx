import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wrench, 
  Camera, 
  CreditCard, 
  ShieldCheck, 
  Layers, 
  AlertCircle, 
  History, 
  Settings,
  Search,
  Package,
  ArrowLeftRight,
  FileText,
  User,
  LayoutGrid,
  Zap
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Gate } from "../components/PermissionGuard";

/**
 * RepairHub handles sub-routes for the Repair Domain that don't have dedicated complex components.
 * It provides a unified interface for Catalog, Photos, Payments, Warranty, Parts, etc.
 */
export const RepairHub: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(window.location.pathname.split('/').pop() || 'catalog');

  useEffect(() => {
    setActiveTab(window.location.pathname.split('/').pop() || 'catalog');
  }, [window.location.pathname]);

  const tabs = [
    { id: 'catalog', label: 'Device Catalog', icon: LayoutGrid, featureId: 62 },
    { id: 'photos', label: 'Photo Gallery', icon: Camera, featureId: 64 },
    { id: 'payments', label: 'Payments & Deposits', icon: CreditCard, featureId: 100 },
    { id: 'warranty', label: 'Warranty & Claims', icon: ShieldCheck, featureId: 82 },
    { id: 'parts', label: 'Repair Parts Log', icon: Layers, featureId: 70 },
    { id: 'alerts', label: 'Repair Alerts', icon: AlertCircle, featureId: 116 },
    { id: 'archive', label: 'Repair Archive', icon: History, featureId: 110 },
    { id: 'config', label: 'Hub Config', icon: Settings, featureId: 111 }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'catalog':
        return (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-serif italic">Model Integrity Matrix</h2>
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input type="text" placeholder="Search Models..." className="w-full bg-surface border border-border pl-12 pr-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {['iPhone 15 Pro', 'iPhone 14', 'S24 Ultra', 'Pixel 8', 'iPad Air 5', 'Watch Ultra'].map((model) => (
                <motion.div 
                  key={model}
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-surface-container border border-border rounded-3xl text-center group cursor-pointer hover:border-primary transition-all"
                >
                  <div className="w-full aspect-square bg-muted rounded-2xl mb-4 overflow-hidden border border-border grayscale group-hover:grayscale-0 transition-all">
                    <img src={`https://picsum.photos/seed/${model}/300/300`} alt={model} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-tighter truncate">{model}</p>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'photos':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-serif italic">Repair Asset Gallery</h2>
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-[9px] font-black uppercase tracking-widest">+ Upload Media</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="group relative aspect-video bg-muted rounded-[2rem] overflow-hidden border border-border cursor-pointer">
                  <img src={`https://picsum.photos/seed/rep${i}/600/400`} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all p-6 flex flex-col justify-end text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">REP-4492</p>
                    <p className="text-[8px] font-medium opacity-60 italic">Pre-Repair Damage Mapping</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-serif italic">Repair Cashflow</h2>
              <span className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20">Operational</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Pending Deposits', value: '450.250', color: 'text-amber-500' },
                { label: 'Unpaid Labour', value: '125.000', color: 'text-red-500' },
                { label: 'Total Repair Rev', value: '2,490.000', color: 'text-primary' }
              ].map((stat) => (
                <div key={stat.label} className="bg-surface-container-lowest border border-border p-8 rounded-[2.5rem] shadow-sm">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 opacity-60">{stat.label}</p>
                  <p className={`text-4xl font-mono font-black ${stat.color}`}>{stat.value} <span className="text-lg">KD</span></p>
                </div>
              ))}
            </div>
            <div className="bg-surface-container-lowest border border-border rounded-[3rem] overflow-hidden shadow-sm">
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Ticket</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Customer</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Estimated</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest opacity-40">Paid</th>
                      <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest opacity-40">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="hover:bg-surface transition-colors cursor-pointer group">
                        <td className="px-10 py-6 font-mono text-[10px] font-bold">REP-100{i}</td>
                        <td className="px-10 py-6 text-xs font-black uppercase tracking-tighter">Customer Name {i}</td>
                        <td className="px-10 py-6 text-sm font-black font-mono">45.000</td>
                        <td className="px-10 py-6 text-sm font-black font-mono text-green-600">20.000</td>
                        <td className="px-10 py-6 text-right text-sm font-black font-mono text-red-500">25.000</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        );
      default:
        return (
          <div className="py-20 flex flex-col items-center justify-center opacity-20 text-center space-y-6">
            <Zap size={64} className="animate-pulse" />
            <div>
              <h3 className="text-3xl font-serif italic font-medium">Module Initializing...</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-2">Atomic Feature Mapping in Progress</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Repair Center</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">High-Fidelity Repair Domain Controller (Domain 2)</p>
        </div>
        <div className="flex gap-4 p-1.5 bg-surface-container border border-border rounded-3xl overflow-x-auto no-scrollbar max-w-[calc(100vw-2rem)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(`/repairs/${tab.id}`)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-background text-primary shadow-xl shadow-black/10' : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Gate id={tabs.find(t => t.id === activeTab)?.featureId || 61}>
          {renderTabContent()}
        </Gate>
      </motion.div>
    </div>
  );
};

export default RepairHub;
