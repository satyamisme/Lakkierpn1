import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Megaphone, 
  Mail, 
  MessageCircle, 
  Smartphone, 
  Plus, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Users, 
  Clock,
  CheckCircle2,
  Send,
  MoreVertical,
  Layout,
  Globe
} from 'lucide-react';
import { toast } from "sonner";

interface Campaign {
  _id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'sms' | 'push';
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  reach: number;
  openRate?: number;
  conversionRate?: number;
  createdAt: string;
}

export const Marketing: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { _id: 'C-001', name: 'Ramadan Special Offer', type: 'whatsapp', status: 'completed', reach: 4500, openRate: 92, conversionRate: 12.4, createdAt: new Date().toISOString() },
    { _id: 'C-002', name: 'iPhone 15 Pro Launch', type: 'email', status: 'running', reach: 12800, openRate: 24.5, conversionRate: 3.2, createdAt: new Date().toISOString() },
    { _id: 'C-003', name: 'Back to School 2026', type: 'sms', status: 'scheduled', reach: 8000, createdAt: new Date().toISOString() },
  ]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'running': return 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse';
      case 'scheduled': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-white/10 text-white/40 border-white/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle size={18} className="text-green-500" />;
      case 'email': return <Mail size={18} className="text-blue-500" />;
      case 'sms': return <Smartphone size={18} className="text-amber-500" />;
      default: return <Megaphone size={18} />;
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Influence Center</h1>
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
             Campaign Orchestration & Omni-Channel Marketing (ID 207)
           </p>
        </div>
        <button className="px-8 py-4 bg-primary text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-primary/20">
           <Plus size={18} /> Initiate Campaign
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 p-8 rounded-[3.5rem] space-y-10 shadow-2xl shadow-primary/5">
                <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Zap size={24} />
                    </div>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest border border-primary/20 px-3 py-1 rounded-full">Pro Optimized</span>
                </div>
                <div className="space-y-6">
                    <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Total Audience</p>
                        <p className="text-4xl font-black font-mono tracking-tighter">24,812</p>
                    </div>
                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Active Credits</span>
                            <span className="text-[10px] font-mono font-black">12.5k</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Avg ROAS</span>
                            <span className="text-[10px] font-mono font-black text-green-500">4.2x</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] space-y-8">
                <h4 className="text-lg font-serif italic">Inventory Triggers</h4>
                <div className="space-y-6">
                   {[
                       { label: 'Back in Stock', count: 142, icon: CheckCircle2 },
                       { label: 'Price Drop', count: 88, icon: Zap },
                       { label: 'Abandoned Cart', count: 215, icon: Clock }
                   ].map(trigger => (
                       <div key={trigger.label} className="flex items-center justify-between group cursor-pointer">
                           <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-white/5 group-hover:bg-primary/10 rounded-xl flex items-center justify-center text-white/20 group-hover:text-primary transition-all">
                                   <trigger.icon size={18} />
                               </div>
                               <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{trigger.label}</span>
                           </div>
                           <span className="text-[10px] font-mono font-black opacity-20 group-hover:opacity-100 transition-opacity">{trigger.count}</span>
                       </div>
                   ))}
                </div>
            </div>
        </aside>

        <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                     { label: 'Avg Engagement', value: '18.4%', icon: BarChart3, color: 'text-blue-500' },
                     { label: 'New Subscribers', value: '+142', icon: Users, color: 'text-green-500' },
                     { label: 'Active Channels', value: '4 Nodes', icon: Globe, color: 'text-purple-500' }
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
                   <h3 className="text-2xl font-serif italic text-white/80">Campaign History</h3>
                   <div className="flex gap-4">
                        <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">All Streams</button>
                        <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Performance Only</button>
                   </div>
                </div>

                <div className="divide-y divide-white/5">
                    {campaigns.map(camp => (
                        <motion.div 
                            key={camp._id}
                            className="p-10 flex items-center justify-between group hover:bg-white/[0.01] transition-all"
                        >
                            <div className="flex items-center gap-10">
                                <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                                    {getTypeIcon(camp.type)}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-base font-black uppercase tracking-tight">{camp.name}</h4>
                                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(camp.status)}`}>
                                            {camp.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                            <Send size={12} /> {camp.reach.toLocaleString()} Reached
                                        </div>
                                        {camp.openRate && (
                                            <div className="flex items-center gap-2 text-[9px] font-black text-blue-400/60 uppercase tracking-widest">
                                                <Layout size={12} /> {camp.openRate}% Engaged
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-right">
                                    <p className="text-sm font-black font-mono tracking-tighter text-white/80">{new Date(camp.createdAt).toLocaleDateString()}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Matrix Generation</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                                        <MoreVertical size={18} />
                                    </button>
                                    <button className="px-6 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                        ANALYZE
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 p-12 rounded-[4rem] relative overflow-hidden group">
                 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                     <div className="max-w-md">
                        <h3 className="text-3xl font-serif italic mb-4">Neural Segmenting</h3>
                        <p className="text-sm font-bold text-white/40 leading-relaxed uppercase">
                            Our AI is currently analyzing cross-node purchasing patterns to suggest the next 3 bulk-buy segments.
                        </p>
                     </div>
                     <button className="px-10 py-5 bg-primary text-black rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 transition-all flex items-center gap-4">
                        Generate Segments <ArrowRight size={20} />
                     </button>
                 </div>
                 <div className="absolute bottom-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                    <BarChart3 size={120} />
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
