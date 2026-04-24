import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gift, 
  CreditCard, 
  Star, 
  Plus, 
  Search, 
  ArrowRight, 
  Zap, 
  History, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Tag
} from 'lucide-react';
import { toast } from "sonner";

interface LoyaltyProfile {
  _id: string;
  customerId: { name: string; email: string };
  points: number;
  tier: 'silver' | 'gold' | 'platinum' | 'elite';
  activeGiftCards: number;
  totalSavings: number;
}

export const POSLoyalty: React.FC = () => {
  const [profiles, setProfiles] = useState<LoyaltyProfile[]>([
    { _id: 'LP-001', customerId: { name: 'Abdullah Mansour', email: 'abdullah@example.com' }, points: 1450, tier: 'gold', activeGiftCards: 1, totalSavings: 45.000 },
    { _id: 'LP-002', customerId: { name: 'Mariam Al-Ali', email: 'mariam@example.com' }, points: 8200, tier: 'elite', activeGiftCards: 2, totalSavings: 280.000 },
    { _id: 'LP-003', customerId: { name: 'Ali Hussain', email: 'ali@example.com' }, points: 240, tier: 'silver', activeGiftCards: 0, totalSavings: 5.000 },
  ]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'bg-purple-500/20 text-purple-500 border-purple-500/20';
      case 'platinum': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
      case 'gold': return 'bg-amber-500/20 text-amber-500 border-amber-500/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Loyalty Engine</h1>
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
             Elite Rewards & Gift Card Orchestration (ID 14)
           </p>
        </div>
        <div className="flex gap-4">
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                <QrCode size={18} /> Issue Gift Card
            </button>
            <button className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-white/5">
                <Plus size={18} /> Register Member
            </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Matrix Points', value: '1.2M', icon: Star, color: 'text-amber-500' },
                    { label: 'Gift Card Liability', value: '4.2k KD', icon: Gift, color: 'text-purple-500' },
                    { label: 'Redemption Rate', value: '24.2%', icon: Zap, color: 'text-blue-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0A0A0A] border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-white/20 transition-all">
                        <div>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-black font-mono tracking-tighter">{stat.value}</h4>
                        </div>
                        <div className={`p-4 bg-white/5 rounded-2xl ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-[4rem] overflow-hidden">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-6 flex-1 max-w-xl">
                        <Search className="text-white/20" size={18} />
                        <input 
                            type="text" 
                            placeholder="Select member profile..." 
                            className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest w-full placeholder:text-white/10 text-white"
                        />
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {profiles.map(profile => (
                        <motion.div 
                            key={profile._id}
                            className="p-10 flex items-center justify-between group hover:bg-white/[0.01] transition-all"
                        >
                            <div className="flex items-center gap-10">
                                <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 overflow-hidden">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black italic">
                                        {profile.customerId.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-lg font-black uppercase tracking-tight">{profile.customerId.name}</h4>
                                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getTierColor(profile.tier)}`}>
                                            {profile.tier} TIER
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                            <Star size={12} className="text-amber-500" /> {profile.points.toLocaleString()} Points
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                            <Gift size={12} className="text-purple-500" /> {profile.activeGiftCards} Active Cards
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-right">
                                    <p className="text-xl font-black font-mono tracking-tighter text-white/80">{profile.totalSavings.toFixed(3)}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">KD Life Savings</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                                        <MoreVertical size={18} />
                                    </button>
                                    <button className="px-8 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3">
                                        MANAGE <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-10">
            <div className="bg-primary text-black rounded-[4rem] p-10 space-y-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-serif italic leading-tight text-black">Gift Card<br/>Provisioning</h3>
                    <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center">
                        <CreditCard size={32} />
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="p-8 bg-black/5 rounded-[2.5rem] border border-black/5 relative overflow-hidden group">
                        <p className="text-[9px] font-black uppercase text-black/40 tracking-widest mb-4">Quick Denominations</p>
                        <div className="grid grid-cols-2 gap-4">
                            {[10, 25, 50, 100].map(val => (
                                <button key={val} className="py-4 bg-black text-white rounded-2xl font-black text-[11px] hover:scale-105 transition-all">
                                    {val} KD
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3">
                         Custom Amount <Plus size={14} />
                    </button>
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] space-y-8">
                <div className="flex items-center gap-4 text-primary">
                    <Tag size={24} />
                    <h4 className="text-lg font-serif italic text-white/80">Active Promotions</h4>
                </div>
                <div className="space-y-4">
                   {[
                       { label: 'Double Points Weekend', status: 'RUNNING', expiry: '2d left' },
                       { label: 'Elite Trade-In Boost', status: 'ACTIVE', expiry: 'Ongoing' }
                   ].map((promo, i) => (
                       <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{promo.label}</span>
                                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">{promo.status}</span>
                            </div>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{promo.expiry}</p>
                       </div>
                   ))}
                </div>
            </div>

            <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[3rem] flex items-center gap-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <History size={24} />
                </div>
                <div>
                    <p className="text-[11px] font-black uppercase tracking-tight text-white/80 leading-tight">Last Point Sweep</p>
                    <p className="text-[9px] text-blue-500/60 font-bold uppercase tracking-widest mt-1">42 Member tiers updated 14m ago</p>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
};

export default POSLoyalty;
