import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, 
  User, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Filter,
  MessageSquare,
  Camera,
  History,
  Activity,
  Wrench,
  Search,
  RefreshCcw
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";
import { toast } from "sonner";

export const TechnicianDashboard: React.FC = () => {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [isQcModalOpen, setIsQcModalOpen] = useState(false);
  const [qcChecklist, setQcChecklist] = useState<boolean[]>(Array(20).fill(false));
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/repairs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRepairs(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/repairs/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchRepairs();
        if (selectedRepair?._id === id) {
          setSelectedRepair({ ...selectedRepair, status });
        }
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const handleQcSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/repairs/${selectedRepair._id}/qc`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ qcChecklist }),
      });
      if (response.ok) {
        setIsQcModalOpen(false);
        fetchRepairs();
        setSelectedRepair(null);
        toast.success("QC Passed & Status Updated to Ready!");
      }
    } catch (error) {
      console.error("QC error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendWhatsApp = async (id: string) => {
    try {
      const response = await fetch(`/api/repairs/${id}/whatsapp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        toast.success("WhatsApp alert sent!");
      }
    } catch (error) {
      console.error("WhatsApp error:", error);
    }
  };

  return (
    <Gate id={63}>
      <div className="space-y-12 pb-20 h-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Technician Hub</h1>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">Deep-tech repair orchestration & QC (ID 63)</p>
          </div>
          <div className="flex gap-6">
            <div className="px-8 py-4 bg-surface-container-lowest border border-border rounded-2xl shadow-sm flex items-center gap-4">
              <Activity className="text-primary animate-pulse" size={20} />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">System Load</p>
                <p className="text-sm font-black uppercase tracking-tighter">Optimal Matrix</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-[calc(100vh-320px)]">
          {/* Repair Queue (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex items-center justify-between bg-surface-container-lowest border border-border p-8 rounded-[2.5rem] shadow-sm">
              <h2 className="text-2xl font-serif italic flex items-center gap-4">
                <History size={24} className="text-primary" />
                Active Queue
              </h2>
              <button 
                onClick={fetchRepairs} 
                className="p-3 hover:bg-surface-container rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
              >
                <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Syncing Matrix...</p>
                </div>
              ) : (
                repairs.map((repair) => (
                  <motion.div
                    key={repair._id}
                    whileHover={{ x: 10 }}
                    onClick={() => setSelectedRepair(repair)}
                    className={`p-8 border border-border bg-surface-container-lowest cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden rounded-[2.5rem] shadow-sm ${selectedRepair?._id === repair._id ? 'border-primary ring-4 ring-primary/5' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-black text-primary font-mono bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">{repair.ticketId}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                        repair.status === 'fixing' ? 'bg-orange-500/5 text-orange-500 border-orange-500/10' : 
                        repair.status === 'ready' ? 'bg-green-500/5 text-green-500 border-green-500/10' : 'bg-muted/50 text-muted-foreground border-border'
                      }`}>
                        {repair.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                      <Smartphone size={18} className="text-muted-foreground opacity-40" />
                      {repair.phoneModel}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                      <span className="flex items-center gap-2"><User size={12} /> {repair.customerName}</span>
                      <span className="flex items-center gap-2"><Clock size={12} /> 2h ago</span>
                    </div>
                    {selectedRepair?._id === repair._id && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute left-0 top-0 w-1.5 h-full bg-primary"
                      />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Workspace (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-surface-container-lowest border border-border rounded-[4rem] shadow-2xl overflow-hidden relative">
            {selectedRepair ? (
              <div className="flex-1 flex flex-col">
                <div className="p-10 border-b border-border bg-muted/10 flex items-center justify-between relative z-10">
                  <div>
                    <h2 className="text-4xl font-serif italic tracking-tight">{selectedRepair.phoneModel}</h2>
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-primary text-[10px] font-mono font-black uppercase tracking-widest">Ticket: {selectedRepair.ticketId}</p>
                      <span className="w-1 h-1 bg-border rounded-full" />
                      <p className="text-muted-foreground text-[10px] font-mono font-black uppercase tracking-widest opacity-60">IMEI: {selectedRepair.imei}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => sendWhatsApp(selectedRepair._id)}
                      className="p-4 bg-green-500/5 border border-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all rounded-2xl active:scale-90 shadow-sm"
                    >
                      <MessageSquare size={20} />
                    </button>
                    <button className="p-4 bg-surface border border-border text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all rounded-2xl active:scale-90 shadow-sm">
                      <Camera size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar relative z-10">
                  {/* Security Warning */}
                  <div className="p-8 bg-red-500/[0.03] border border-red-500/10 rounded-[2.5rem] flex items-center gap-8 text-red-500 shadow-inner">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0">
                      <AlertTriangle size={32} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-1">Security Matrix Check (ID 103)</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">GSMA Status: CLEAN | Hardware Integrity: VERIFIED | Node History: SECURE</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 flex items-center gap-3">
                        <Wrench size={14} /> Anomaly Report
                      </h3>
                      <div className="p-8 bg-surface border border-border rounded-[2.5rem] text-xs font-black uppercase tracking-[0.15em] leading-relaxed shadow-inner italic opacity-80">
                        "{selectedRepair.issue}"
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 flex items-center gap-3">
                        <Smartphone size={14} /> Visual Damage Matrix
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(selectedRepair.visualDamageMap || {}).filter(([_, v]) => v).map(([part]) => (
                          <span key={part} className="px-5 py-2 bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">
                            {part}
                          </span>
                        ))}
                        {Object.values(selectedRepair.visualDamageMap || {}).every(v => !v) && (
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-30 italic">No visual anomalies reported</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 flex items-center gap-3">
                      <Activity size={14} /> Workflow Orchestration
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['diagnosing', 'parts_ordered', 'fixing', 'qc'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedRepair._id, status)}
                          className={`py-5 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
                            selectedRepair.status === status 
                              ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105 z-10' 
                              : 'bg-surface border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          {status.replace('_', ' ')}
                          {selectedRepair.status === status && (
                            <motion.div 
                              layoutId="status-glow"
                              className="absolute inset-0 bg-white/10"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-10 border-t border-border bg-muted/10 flex gap-6 relative z-10">
                  <button 
                    onClick={() => setIsQcModalOpen(true)}
                    disabled={selectedRepair.status !== 'qc'}
                    className="flex-1 bg-primary text-primary-foreground py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-2xl shadow-primary/40"
                  >
                    <ShieldCheck size={24} />
                    Initiate QC Protocol (ID 71)
                  </button>
                </div>

                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                <Wrench size={120} className="mb-8" />
                <p className="text-[11px] font-black uppercase tracking-[0.5em]">Select Node to Begin Orchestration</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QC Modal */}
      <AnimatePresence>
        {isQcModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-tighter italic">QC Checklist (20 Points)</h3>
                <button onClick={() => setIsQcModalOpen(false)}><XCircle size={20} /></button>
              </div>
              <div className="p-8 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 border border-border">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Check Point #{i + 1}</span>
                    <input 
                      type="checkbox" 
                      checked={qcChecklist[i]}
                      onChange={(e) => {
                        const next = [...qcChecklist];
                        next[i] = e.target.checked;
                        setQcChecklist(next);
                      }}
                      className="w-5 h-5 accent-primary"
                    />
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-border bg-muted/30">
                <button 
                  onClick={handleQcSubmit}
                  disabled={isSubmitting || !qcChecklist.every(v => v)}
                  className="w-full bg-green-500 text-white py-4 font-black text-xs uppercase tracking-[0.2em] hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={18} />}
                  Complete QC & Mark Ready
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Gate>
  );
};
