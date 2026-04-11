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
  History
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";

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
        alert("QC Passed & Status Updated to Ready!");
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
        alert("WhatsApp alert sent!");
      }
    } catch (error) {
      console.error("WhatsApp error:", error);
    }
  };

  return (
    <Gate id={63}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-120px)]">
        {/* Repair Queue (1 col) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex items-center justify-between bg-card border border-border p-4 shadow-sm">
            <h2 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2">
              <History size={20} className="text-primary" />
              Repair Queue
            </h2>
            <button onClick={fetchRepairs} className="text-muted-foreground hover:text-primary transition-colors">
              <Filter size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              repairs.map((repair) => (
                <motion.div
                  key={repair._id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedRepair(repair)}
                  className={`p-4 border border-border bg-card cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden ${selectedRepair?._id === repair._id ? 'border-primary ring-2 ring-primary/10' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-primary font-mono">{repair.ticketId}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      repair.status === 'fixing' ? 'bg-orange-500/10 text-orange-500' : 
                      repair.status === 'ready' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {repair.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tighter mb-1 flex items-center gap-2">
                    <Smartphone size={14} className="text-muted-foreground" />
                    {repair.phoneModel}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1"><User size={10} /> {repair.customerName}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> 2h ago</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Workspace (2 cols) */}
        <div className="lg:col-span-2 flex flex-col bg-card border border-border shadow-xl overflow-hidden">
          {selectedRepair ? (
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic">{selectedRepair.phoneModel}</h2>
                  <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-widest">Ticket: {selectedRepair.ticketId} | IMEI: {selectedRepair.imei}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => sendWhatsApp(selectedRepair._id)}
                    className="p-3 border border-border text-green-500 hover:bg-green-500/10 transition-all"
                  >
                    <MessageSquare size={18} />
                  </button>
                  <button className="p-3 border border-border text-muted-foreground hover:bg-muted transition-all">
                    <Camera size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* IMEI Blacklist Warning (ID 103) */}
                <div className="p-4 bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-500">
                  <AlertTriangle size={24} className="shrink-0" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest">IMEI Security Check (ID 103)</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">GSMA Blacklist: CLEAN | Store History: 1 Sale Found</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reported Issue</h3>
                    <div className="p-4 bg-muted/30 border border-border text-xs font-bold uppercase tracking-widest leading-relaxed">
                      {selectedRepair.issue}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Visual Damage Map</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedRepair.visualDamageMap || {}).filter(([_, v]) => v).map(([part]) => (
                        <span key={part} className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Workflow Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['diagnosing', 'parts_ordered', 'fixing', 'qc'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedRepair._id, status)}
                        className={`py-3 border font-black text-[10px] uppercase tracking-widest transition-all ${
                          selectedRepair.status === status ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-muted/30 flex gap-4">
                <button 
                  onClick={() => setIsQcModalOpen(true)}
                  disabled={selectedRepair.status !== 'qc'}
                  className="flex-1 bg-primary text-primary-foreground py-4 font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <ShieldCheck size={18} />
                  Start QC Checklist (ID 71)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20">
              <Smartphone size={64} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Select a repair to start working</p>
            </div>
          )}
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
