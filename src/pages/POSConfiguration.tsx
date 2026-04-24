import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Settings, 
  MapPin, 
  Percent, 
  Save, 
  RefreshCcw, 
  Terminal, 
  ShieldCheck, 
  Monitor, 
  Coins, 
  FileText,
  Lock,
  Globe,
  Plus
} from 'lucide-react';
import { toast } from "sonner";

export const POSConfiguration: React.FC = () => {
  const [config, setConfig] = useState({
    storeName: 'Avenues Branch',
    storeCode: 'AVN-01',
    vatRate: 0,
    roundingMode: 'nearest_5',
    defaultCurrency: 'KWD',
    receiptPrefix: 'INV-',
    enableStaffDiscount: true,
    maxDiscountLimit: 15,
  });

  const handleSave = () => {
    toast.success("Terminal configuration sealed and broadcasted to cluster");
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Terminal Matrix</h1>
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
             Managerial Configuration & Branch Localization (ID 26)
           </p>
        </div>
        <button 
          onClick={handleSave}
          className="px-10 py-5 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center gap-3"
        >
          <Save size={20} /> Commit System Changes
        </button>
      </header>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-10">
            <section className="bg-[#0A0A0A] border border-white/10 rounded-[4rem] p-12 space-y-12 relative overflow-hidden">
                <div className="flex items-center gap-6 border-b border-white/5 pb-8">
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-primary">
                        <Monitor size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif italic">Operational Metadata</h3>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Foundational Store Identification</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {[
                        { label: 'Register Active Store', value: config.storeName, icon: MapPin },
                        { label: 'Terminal Identifier', value: config.storeCode, icon: Terminal },
                        { label: 'Receipt Sequence Prefix', value: config.receiptPrefix, icon: FileText },
                        { label: 'Settlement Currency', value: config.defaultCurrency, icon: Coins }
                    ].map((item, i) => (
                        <div key={i} className="space-y-4">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                                <item.icon size={12} className="text-primary" /> {item.label}
                            </label>
                            <input 
                                defaultValue={item.value}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-black uppercase tracking-widest outline-none focus:border-primary transition-all text-white/80"
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-[#0A0A0A] border border-white/10 rounded-[4rem] p-12 space-y-12 relative overflow-hidden">
                <div className="flex items-center gap-6 border-b border-white/5 pb-8">
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-amber-500">
                        <Lock size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif italic text-white/80">Fiscal & Discount Guardrails</h3>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Taxation, Rounding & Permission Caps</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Percent size={12} className="text-amber-500" /> VAT Provisioning (%)
                        </label>
                        <div className="relative">
                            <input 
                                type="number"
                                defaultValue={config.vatRate}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-black font-mono outline-none focus:border-primary transition-all text-white/80"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 text-[10px] font-black uppercase">Statutory</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                            <RefreshCcw size={12} className="text-amber-500" /> Rounding Logic
                        </label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all text-white/80 appearance-none">
                            <option>Nearest 5 Fils</option>
                            <option>Standard Floor</option>
                            <option>Mathematical CEIL</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck size={12} className="text-amber-500" /> Max Managerial Overwrite (%)
                        </label>
                        <input 
                            type="number"
                            defaultValue={config.maxDiscountLimit}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-black font-mono outline-none focus:border-primary transition-all text-white/80"
                        />
                    </div>
                </div>
            </section>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-10">
            <div className="bg-primary text-black rounded-[4rem] p-10 space-y-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-serif italic text-black">Global<br/>Handshake</h3>
                    <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center">
                        <Globe size={32} />
                    </div>
                </div>
                
                <div className="space-y-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-relaxed font-bold text-black border-l-2 border-black/20 pl-4">
                        These settings are shared across all 8 nodes in the Kuwait Cluster. Changing fiscal rules will trigger a mandatory system-wide X-Read.
                    </p>
                    <div className="pt-4 border-t border-black/10">
                        <button className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3">
                            Resync All Terminals <RefreshCcw size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] space-y-8">
                 <h4 className="text-xl font-serif italic text-white/80">Hardware Handshakes</h4>
                 <div className="space-y-4">
                    {[
                        { label: 'Star Micronics Spooler', status: 'ready' },
                        { label: 'MagTek Card Reader', status: 'connected' },
                        { label: 'In-Counter Scanner', status: 'calibrated' }
                    ].map((hw, i) => (
                        <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group">
                            <span className="text-[11px] font-black uppercase tracking-widest text-white/40">{hw.label}</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                        </div>
                    ))}
                 </div>
                 <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10">
                    Run Diagnostic Loop <Plus size={14} />
                 </button>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default POSConfiguration;
