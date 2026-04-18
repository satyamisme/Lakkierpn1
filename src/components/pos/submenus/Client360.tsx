import React, { useState } from "react";
import { Search, User, Mail, Phone, Calendar, Package, Wrench, Heart, Users, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export const Client360: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'repairs' | 'wishlist'>('info');

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic text-white leading-none">Client 360</h2>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-3">Identity & Lifecycle Intelligence</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input 
            type="text" 
            placeholder="SEARCH MOBILE / EMAIL / NAME..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black tracking-widest text-white placeholder:text-white/10 focus:border-primary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-primary/30 transition-all cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                  A
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">Ahmed Al-Kuwaiti</h4>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">+965 9999 8888</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Premium Tier</span>
                </div>
                <ArrowRight size={14} className="text-white/10 group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden">
           <div className="flex border-b border-white/5">
              {[
                { id: 'info', label: 'Demographics', icon: User },
                { id: 'history', label: 'Purchase History', icon: Package },
                { id: 'repairs', label: 'Repair Matrix', icon: Wrench },
                { id: 'wishlist', label: 'Loyalty & Wishlist', icon: Heart }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
                    activeTab === tab.id 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-transparent text-white/20 hover:text-white/40'
                  }`}
                >
                  <tab.icon size={14} />
                  <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
           </div>

           <div className="flex-1 p-8 overflow-y-auto custom-scrollbar text-center flex flex-col items-center justify-center opacity-20">
              <Users size={64} className="mb-6" />
              <p className="text-[12px] font-black uppercase tracking-[0.5em]">Select client to aggregate 360 view</p>
           </div>
        </div>
      </div>
    </div>
  );
};
