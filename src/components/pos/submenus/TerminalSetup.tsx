import React, { useState } from "react";
import { Settings, Printer, Percent, Store, Save, RefreshCw, Monitor, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export const TerminalSetup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'hardware' | 'fiscal'>('general');

  return (
    <div className="flex flex-col h-full space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif italic text-white leading-tight">Terminal Configuration</h2>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Local Environment & Node Parameters</p>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all">
           <Save size={16} />
           Commit Changes to Cloud
        </button>
      </div>

      <div className="grid grid-cols-12 gap-10 flex-1 min-h-0">
         <div className="col-span-3 space-y-2">
            {[
              { id: 'general', label: 'General Protocol', icon: Settings },
              { id: 'hardware', label: 'Hardware Matrix', icon: Monitor },
              { id: 'fiscal', label: 'Fiscal Context', icon: Percent }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all text-left group ${
                  activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-white/20 hover:text-white/40 hover:bg-white/5'
                }`}
              >
                <tab.icon size={20} className={activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
         </div>

         <div className="col-span-9 bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 overflow-y-auto custom-scrollbar space-y-10">
            {activeTab === 'general' && (
              <div className="space-y-12">
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] ml-1">Terminal Identity</label>
                       <input 
                         type="text" 
                         value="TERM-KUWAIT-01A"
                         readOnly
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[12px] font-black tracking-widest text-white/40 outline-none"
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] ml-1">Assigned Store Node</label>
                       <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[12px] font-black tracking-widest text-white outline-none focus:border-primary appearance-none">
                          <option>Main Branch (OBSIDIAN)</option>
                          <option>Fahaheel HUB</option>
                          <option>Avenues Store</option>
                       </select>
                    </div>
                 </div>

                 <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                          <ShieldCheck size={28} />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">Supervisor Override required</h4>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">For sensitive property alterations</p>
                       </div>
                    </div>
                    <button className="px-6 py-3 border border-white/10 rounded-xl text-[9px] font-black text-white/40 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">Authorize Session</button>
                 </div>
              </div>
            )}

            {activeTab === 'hardware' && (
              <div className="space-y-10">
                 <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Printer size={24} className="text-primary" />
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">Thermal Matrix (80mm)</h4>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                       </label>
                    </div>
                    <div className="flex gap-4">
                       <input 
                         type="text" 
                         placeholder="IP ADDRESS (e.g. 192.168.1.100)"
                         className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[10px] font-black tracking-widest text-white outline-none focus:border-primary"
                       />
                       <button className="px-6 py-4 bg-white/5 text-white/40 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all">Test Pulse</button>
                    </div>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
