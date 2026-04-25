import React, { useState } from "react";
import { Monitor, Printer, Smartphone, Scan, RefreshCw, Layers, ShieldCheck, Activity, Terminal, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export const HardwareMatrix: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([
    { id: 'dev-1', name: 'EPSON TM-T88VI', type: 'Thermal Printer', connection: 'USB', status: 'online', health: 98 },
    { id: 'dev-2', name: 'Honeywell Voyager', type: 'Barcode Scanner', connection: 'HID', status: 'online', health: 100 },
    { id: 'dev-4', name: 'FaceTime HD Camera', type: 'Camera', connection: 'Internal', status: 'online', health: 100 },
  ]);

  const scanDevices = () => {
    setIsScanning(true);
    setTimeout(() => {
      setDiscoveredDevices(prev => [
        ...prev,
        { id: 'dev-3', name: 'HP LaserJet Pro', type: 'A4 Printer', connection: 'Network', status: 'online', health: 85 },
      ]);
      setIsScanning(false);
      toast.success("Hardware Matrix Refreshed", {
        description: "Scanning cluster for passive HID and Network vectors."
      });
    }, 1500);
  };

  const testDevice = (name: string) => {
    toast.info(`Initializing diagnostic for ${name}`, {
      description: "Running diagnostic sequence through hardware controller."
    });
  };

  return (
    <div className="flex flex-col h-full space-y-8 p-4 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-4xl font-serif italic text-white leading-tight">Hardware Matrix</h2>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Peripheral Telemetry & Node Health</p>
            <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-black text-amber-500 uppercase tracking-widest">Simulation Mode</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
             <div className="flex flex-col items-end">
               <span className="text-[7px] font-black uppercase text-white/20 tracking-widest">Global Status</span>
               <span className="text-[10px] font-bold text-emerald-400">OPTIMAL</span>
             </div>
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
           </div>
           <button 
            onClick={scanDevices}
            disabled={isScanning}
            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isScanning ? <RefreshCw size={16} className="animate-spin" /> : <Scan size={16} />}
            {isScanning ? "RESCANNING..." : "SCAN CLUSTER"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        {[
          { label: 'Active Peripherals', value: discoveredDevices.length, icon: Layers, color: 'text-primary' },
          { label: 'Avg Latency', value: '0.8ms', icon: Activity, color: 'text-emerald-500' },
          { label: 'Driver Status', value: 'Verified', icon: ShieldCheck, color: 'text-sky-500' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center gap-5">
             <div className={`p-4 bg-white/5 rounded-2xl ${stat.color}`}>
                <stat.icon size={20} />
             </div>
             <div>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black text-white">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 overflow-y-auto custom-scrollbar">
         <div className="space-y-4">
            <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] px-2 mb-6">Device Inventory</h3>
            {discoveredDevices.map(dev => (
              <div key={dev.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/40 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                       {dev.type.includes('Printer') ? <Printer size={22} /> : dev.type.includes('Scanner') ? <Scan size={22} /> : <Monitor size={22} />}
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-white uppercase tracking-tight">{dev.name}</h4>
                       <div className="flex items-center gap-4 mt-1">
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{dev.type}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/5" />
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest">{dev.connection}</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-8">
                    <div className="hidden lg:flex flex-col items-end">
                       <span className="text-[7px] font-black uppercase text-white/20 mb-1">Health</span>
                       <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${dev.health}%` }} />
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                        onClick={() => testDevice(dev.name)}
                        className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                       >
                         Test Signal
                       </button>
                       <div className="px-3 py-1 bg-green-500/10 text-emerald-500 rounded-lg text-[9px] font-black border border-emerald-500/20 uppercase tracking-widest">
                          {dev.status}
                       </div>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      <div className="shrink-0 p-8 bg-black/20 border border-white/5 rounded-[2.5rem] flex items-center gap-6">
         <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <Terminal size={24} />
         </div>
         <div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1 leading-none">Console Log Matrix</p>
            <p className="text-[10px] font-medium text-white/40 leading-relaxed max-w-2xl">
              Hardware handshake verified at node level. Native HID drivers loaded and listening for input buffers from secondary scanners. All telemetry active.
            </p>
         </div>
         <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
               <CheckCircle2 size={14} className="text-emerald-500" />
               <span className="text-[8px] font-black text-emerald-500 uppercase">Input Active</span>
            </div>
         </div>
      </div>
    </div>
  );
};
