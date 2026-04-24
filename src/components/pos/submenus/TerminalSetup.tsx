import React, { useState } from "react";
import { Settings, Printer, Percent, Store, Save, RefreshCw, Monitor, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export const TerminalSetup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'hardware' | 'fiscal'>('general');
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([]);
  const [defaultPrinter, setDefaultPrinter] = useState("");
  const [printType, setPrintType] = useState<"thermal" | "a4">("thermal");
  const [taxRate, setTaxRate] = useState(() => Number(localStorage.getItem('terminal_tax_rate')) || 0);
  const [roundingMethod, setRoundingMethod] = useState(() => localStorage.getItem('terminal_rounding') || 'none');

  const scanDevices = () => {
    setIsScanning(true);
    // Real devices would use WebHID or similar, but for audit UI refinement:
    setTimeout(() => {
      setDiscoveredDevices([
        { id: 'dev-1', name: 'EPSON TM-T88VI', type: 'Thermal Printer', connection: 'USB', status: 'online' },
        { id: 'dev-2', name: 'HP LaserJet Pro', type: 'A4 Printer', connection: 'Network', status: 'online' },
        { id: 'dev-3', name: 'Honeywell Voyager', type: 'Barcode Scanner', connection: 'HID', status: 'online' },
        { id: 'dev-4', name: 'FaceTime HD Camera', type: 'Camera', connection: 'Internal', status: 'online' },
      ]);
      setIsScanning(false);
      toast.success("Hardware Matrix Refreshed", {
        description: "4 Active peripherals identified in cluster."
      });
    }, 1500);
  };

  const saveFiscalSettings = () => {
    localStorage.setItem('terminal_tax_rate', taxRate.toString());
    localStorage.setItem('terminal_rounding', roundingMethod);
    toast.success("Fiscal Protocol Updated", {
      description: "VAT and Rounding vectors successfully committed."
    });
  };

  return (
    <div className="flex flex-col h-full space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif italic text-white leading-tight">Terminal Configuration</h2>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Local Environment & Node Parameters</p>
        </div>
        <button 
          onClick={saveFiscalSettings}
          className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all text-center leading-none"
        >
           <Save size={16} />
           Commit Changes
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
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif italic text-white/80">Peripheral Matrix</h3>
                    <button 
                      onClick={scanDevices}
                      disabled={isScanning}
                      className="px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                    >
                       {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Monitor size={14} />}
                       {isScanning ? "RESCANNING..." : "SCAN CLUSTER"}
                    </button>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    {discoveredDevices.length === 0 ? (
                      <div className="p-20 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/10 rounded-[3rem]">
                        <Monitor size={48} className="mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No devices identified</p>
                      </div>
                    ) : (
                      discoveredDevices.map(dev => (
                        <div key={dev.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                                 {dev.type.includes('Printer') ? <Printer size={20} /> : <Settings size={20} />}
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-white uppercase tracking-tight">{dev.name}</h4>
                                 <div className="flex items-center gap-4 mt-1">
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{dev.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/10" />
                                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">{dev.connection}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              {dev.type.includes('Printer') && (
                                <button 
                                  onClick={() => {
                                    setDefaultPrinter(dev.id);
                                    setPrintType(dev.type.includes('Thermal') ? 'thermal' : 'a4');
                                  }}
                                  className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                    defaultPrinter === dev.id 
                                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                                  }`}
                                >
                                   {defaultPrinter === dev.id ? "PRIMARY" : "SET AS PRIMARY"}
                                </button>
                              )}
                              <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                                 {dev.status}
                              </div>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'fiscal' && (
              <div className="space-y-12">
                 <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block">VAT Allocation (%)</label>
                    <div className="flex gap-4">
                      {[0, 5, 10, 15].map(rate => (
                        <button 
                          key={rate}
                          onClick={() => setTaxRate(rate / 100)}
                          className={`flex-1 py-6 rounded-3xl font-mono text-xl transition-all border ${taxRate === rate/100 ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-white/5 border-white/5 hover:border-primary/40 text-white/40'}`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block">Currency Rounding Protocol</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'none', label: 'Precise', desc: 'No Rounding' },
                        { id: '5fils', label: '5 Fils', desc: 'Nearest 0.005' },
                        { id: '10fils', label: '10 Fils', desc: 'Nearest 0.010' }
                      ].map(method => (
                        <button 
                          key={method.id}
                          onClick={() => setRoundingMethod(method.id as any)}
                          className={`p-6 rounded-3xl text-left transition-all border ${roundingMethod === method.id ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-white/5 border-white/5 hover:border-primary/40 text-white/40'}`}
                        >
                          <p className="text-xs font-black uppercase tracking-widest">{method.label}</p>
                          <p className={`text-[9px] mt-1 font-bold ${roundingMethod === method.id ? 'opacity-80' : 'opacity-40'}`}>{method.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-black/20 border border-white/5 rounded-[2.5rem] flex items-center gap-6">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                       <Percent size={24} />
                    </div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-relaxed">
                      All fiscal changes are applied instantly to the receipt generation engine. Ensure local laws are adhered to before committing.
                    </p>
                  </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
