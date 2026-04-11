import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Smartphone, 
  CreditCard, 
  ShieldCheck, 
  Globe, 
  Zap, 
  ArrowRight,
  Star,
  Package
} from 'lucide-react';

/**
 * ID 301: Extended Features
 * Trade-ins, BNPL, and specialized flows.
 */
export const ExtendedFeatures: React.FC = () => {
  const features = [
    { id: 301, label: 'Trade-In Flow', desc: 'Grade devices and apply value to new sales.', icon: <Smartphone className="w-6 h-6" /> },
    { id: 302, label: 'BNPL Integration', desc: 'Tamara & Tabby instalment payment management.', icon: <CreditCard className="w-6 h-6" /> },
    { id: 304, label: 'Apple GSX', desc: 'Official Apple parts ordering and warranty check.', icon: <Globe className="w-6 h-6" /> },
    { id: 305, label: 'GSMA Blacklist', desc: 'Real-time stolen device verification.', icon: <ShieldCheck className="w-6 h-6" /> },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-5xl font-serif italic tracking-tight text-foreground">Extended Features</h1>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Specialized Enterprise Modules (ID 301)</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8">
                <Smartphone className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif italic mb-4">Device Trade-In (ID 301)</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">
                Professional grading engine for pre-owned devices. Automatically calculates trade-in value based on visual damage map and battery health.
              </p>
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20 group">
                Start Trade-In Assessment
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest border border-border p-6 rounded-[2rem] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground"><CreditCard className="w-5 h-5" /></div>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">ID 302</span>
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-2">BNPL Hub</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Manage Tamara/Tabby instalment plans and approvals.</p>
            </div>
            <div className="bg-surface-container-lowest border border-border p-6 rounded-[2rem] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground"><Globe className="w-5 h-5" /></div>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">ID 304</span>
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-2">Apple GSX</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Direct integration with Apple Authorized Service Provider tools.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm">
            <h3 className="text-xl font-serif italic mb-8 flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Premium Add-Ons
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Warranty Extension', price: '15.000 KD', icon: <ShieldCheck className="w-4 h-4" /> },
                { label: 'Cloud Backup Sync', price: '5.000 KD', icon: <Zap className="w-4 h-4" /> },
                { label: 'Priority Support', price: '10.000 KD', icon: <Star className="w-4 h-4" /> },
                { label: 'Bulk Accessories', price: 'Variable', icon: <Package className="w-4 h-4" /> },
              ].map((addon) => (
                <div key={addon.label} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border hover:border-primary/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-card rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                      {addon.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">{addon.label}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-primary">{addon.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-8 rounded-[3rem] text-center">
            <h3 className="text-xl font-serif italic mb-2">Need a Custom Module?</h3>
            <p className="text-xs text-muted-foreground mb-6">Our senior architects can atomize any business requirement into a Lakki module.</p>
            <button className="px-6 py-3 bg-muted border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all">Contact Enterprise Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};
