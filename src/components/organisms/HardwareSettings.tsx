import React, { useEffect } from "react";
import { useHardwareStore } from "../../store/useHardwareStore";
import { 
  Printer, 
  Scan, 
  DollarSign, 
  RefreshCw, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Camera, 
  Smartphone, 
  Settings,
  ChevronRight,
  Monitor,
  Cpu
} from "lucide-react";
import { motion } from "motion/react";

export const HardwareSettings: React.FC = () => {
  const { status, settings, isLoading, fetchStatus, updateSettings, testPrinter, testScanner, openCashDrawer } = useHardwareStore();

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTest = async (type: "printer" | "scanner" | "drawer") => {
    try {
      if (type === "printer") await testPrinter("default", settings.defaultPrinterType);
      if (type === "scanner") await testScanner("default");
      if (type === "drawer") await openCashDrawer("default");
    } catch (error) {
      // Errors are handled in the store
    }
  };

  const StatusIndicator = ({ state }: { state: "online" | "offline" | undefined }) => (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
      state === "online" ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
    }`}>
      {state === "online" ? <CheckCircle size={10} /> : <XCircle size={10} />}
      {state || "unknown"}
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Header Area */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white flex items-center gap-2">
              Peripheral Matrix <span className="text-[10px] not-italic font-mono text-white/20 ml-2">v2.6.4</span>
            </h2>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mt-1">Real-time hardware synchronization state</p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={isLoading}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white/40 hover:text-white"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Print Configuration Col */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                  <Printer size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Printer Selection Matrix</span>
              </div>
              <StatusIndicator state={status?.printer} />
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3 block">Default Mode</label>
                  <div className="flex gap-2">
                    {['thermal', 'a4'].map((type) => (
                      <button
                        key={type}
                        onClick={() => updateSettings({ defaultPrinterType: type as 'thermal' | 'a4' })}
                        className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          settings.defaultPrinterType === type 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-white/5 border-white/10 text-white/20 hover:border-white/20'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Preferred Thermal Vector</label>
                    <select 
                      value={settings.preferredThermalPrinter}
                      onChange={(e) => updateSettings({ preferredThermalPrinter: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black tracking-widest text-white/60 focus:border-blue-500 outline-none transition-all appearance-none"
                    >
                      <option value="USB-THERMAL-80mm">USB Thermal (Xprinter 80mm)</option>
                      <option value="NET-THERMAL-01">Network Thermal (Epson TM-T88)</option>
                      <option value="BT-THERMAL-MOBILE">Bluetooth Mobile (Bixolon)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Preferred A4 Repository</label>
                    <select 
                      value={settings.preferredA4Printer}
                      onChange={(e) => updateSettings({ preferredA4Printer: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black tracking-widest text-white/60 focus:border-blue-500 outline-none transition-all appearance-none"
                    >
                      <option value="NETWORK-LASER-OFFICE">Office Laser (HP LaserJet Pro)</option>
                      <option value="PDF-EXPORT">Digital PDF Archive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center text-blue-500">
                      <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Auto-Print on Commit</span>
                  </div>
                  <button 
                    onClick={() => updateSettings({ autoPrintReceipts: !settings.autoPrintReceipts })}
                    className={`w-10 h-5 rounded-full transition-all relative ${settings.autoPrintReceipts ? 'bg-blue-600' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.autoPrintReceipts ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-white/20">
                  <Printer size={32} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Diagnostic Sequence</p>
                  <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em]">Verify thermal/logic gate alignment</p>
                </div>
                <button
                  onClick={() => handleTest("printer")}
                  className="w-full py-4 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Trigger Test Node
                </button>
              </div>
            </div>
          </div>

          {/* Scanner Matrix */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] overflow-hidden">
             <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                  <Scan size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Input Acquisition Matrix</span>
              </div>
              <StatusIndicator state={status?.scanner} />
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3 block">Scanner Protocol</label>
                    <div className="flex gap-2">
                      {['hid', 'serial'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => updateSettings({ scannerMode: mode as 'hid' | 'serial' })}
                          className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            settings.scannerMode === mode 
                              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                              : 'bg-white/5 border-white/10 text-white/20 hover:border-white/20'
                          }`}
                        >
                          {mode === 'hid' ? 'HID (KLB)' : 'Serial (COM)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[8px] font-bold text-white/20 uppercase leading-relaxed">
                    Most modern 2D scanners should use HID mode for instant character injection. Serial mode requires dedicated driver synchronization.
                  </p>
               </div>

               <div className="space-y-4">
                  <button
                    onClick={() => handleTest("scanner")}
                    className="w-full flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group"
                  >
                     <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-blue-500 transition-colors">
                           <Scan size={20} />
                        </div>
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-white">Verify Optical Link</span>
                           <p className="text-[8px] font-bold text-white/20 uppercase mt-0.5 tracking-widest">Awaiting sensor data...</p>
                        </div>
                     </div>
                     <ChevronRight size={16} className="text-white/10 group-hover:text-white" />
                  </button>

                  <button
                    onClick={() => handleTest("drawer")}
                    className="w-full flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group"
                  >
                     <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-amber-500 transition-colors">
                           <DollarSign size={20} />
                        </div>
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-white">Manual Kick (RJ11)</span>
                           <p className="text-[8px] font-bold text-white/20 uppercase mt-0.5 tracking-widest">Pulse sequence bypass</p>
                        </div>
                     </div>
                     <ChevronRight size={16} className="text-white/10 group-hover:text-white" />
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Intelligence & Camera Col */}
        <div className="space-y-8">
           <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] overflow-hidden">
             <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                    <Camera size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Vision Module</span>
                </div>
             </div>
             
             <div className="p-8 space-y-8">
                <div className="aspect-video bg-black rounded-3xl border border-white/5 overflow-hidden relative flex flex-center group cursor-pointer">
                   {settings.cameraEnabled ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse absolute top-4 right-4 border-4 border-black" />
                         <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">Live Vision Disabled</span>
                      </div>
                   ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                         <Camera size={48} className="text-white/5" />
                      </div>
                   )}
                   <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Configure Lens Matrix</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Camera size={16} className="text-white/20" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Logic-Gate Vision</span>
                    </div>
                    <button 
                      onClick={() => updateSettings({ cameraEnabled: !settings.cameraEnabled })}
                      className={`w-10 h-5 rounded-full transition-all relative ${settings.cameraEnabled ? 'bg-blue-600' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.cameraEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-4">
                     <div className="flex items-center gap-3 text-blue-500">
                        <Smartphone size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Mobile Integration</span>
                     </div>
                     <p className="text-[9px] font-bold text-white/40 uppercase leading-relaxed tracking-widest">
                        Sync with "Lakki-Node" mobile app to use smartphone lenses as wireless scanners.
                     </p>
                     <button className="w-full py-3 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                        Generate Pair Code
                     </button>
                  </div>
                </div>
             </div>
           </div>

           <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                   <Settings size={16} />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Security Protocol</h4>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Auto-Kick Drawer on Cash', active: true },
                   { label: 'Enforce Dual-Scanner Pass', active: false },
                   { label: 'Vision Audit Log (14 Days)', active: true },
                 ].map((policy, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{policy.label}</span>
                      <div className={`w-2 h-2 rounded-full ${policy.active ? 'bg-green-500' : 'bg-white/5'}`} />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

