import React, { useState, useEffect } from 'react';
import { Wrench, ClipboardCheck, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Gate } from '../PermissionGuard';
import { BenchQueue } from './BenchQueue';
import { QCChecklist } from './QCChecklist';
import { STATUS_LABELS } from '../../utils/statusTransitions';

/**
 * ID 71: Technician Workspace Organism
 * Main dashboard for technicians to manage the bench queue and perform QC.
 */
export const TechnicianWorkspace: React.FC = () => {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [qcChecklist, setQcChecklist] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRepairs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/repairs');
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

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleStartRepair = async (id: string) => {
    try {
      const response = await fetch(`/api/repairs/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in-progress' }),
      });
      if (response.ok) {
        fetchRepairs();
      }
    } catch (error) {
      console.error("Start repair error:", error);
    }
  };

  const handleToggleQC = (item: string) => {
    setQcChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleCompleteRepair = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/repairs/${selectedRepair._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready-for-qc' }),
      });
      if (response.ok) {
        setSelectedRepair(null);
        fetchRepairs();
      }
    } catch (error) {
      console.error("Complete repair error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Bench Queue...</p>
      </div>
    );
  }

  return (
    <Gate id={71}>
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {!selectedRepair ? (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                    <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                      <Wrench className="w-8 h-8" />
                    </div>
                    Bench <span className="text-indigo-600 dark:text-indigo-400">Queue</span>
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-2 ml-1">
                    ID 63: Real-time Repair Management
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Updates Active</span>
                </div>
              </div>

              <BenchQueue 
                repairs={repairs} 
                onStartRepair={handleStartRepair} 
                onSelectRepair={setSelectedRepair} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedRepair(null)}
                  className="p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    Job Card <span className="text-indigo-600 dark:text-indigo-400">#{selectedRepair._id.slice(-6).toUpperCase()}</span>
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                    {selectedRepair.phoneModel} — {selectedRepair.customerName}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {STATUS_LABELS[selectedRepair.status as any]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <section className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4" /> QC Checklist (ID 71)
                    </h2>
                    <QCChecklist checklist={qcChecklist} onToggle={handleToggleQC} />
                  </section>

                  <section className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/30">
                    <h2 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Technician Notes
                    </h2>
                    <textarea 
                      placeholder="Enter repair notes, parts used, or issues found..."
                      className="w-full h-32 bg-white/50 dark:bg-gray-800/50 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm font-medium"
                    />
                  </section>
                </div>

                <div className="space-y-6">
                  <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 dark:shadow-none sticky top-28">
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">Repair Summary</h3>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Faults</span>
                        <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                          {selectedRepair.faults.map((f: string) => (
                            <span key={f} className="text-[8px] bg-white/10 px-2 py-0.5 rounded-md">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">QC Progress</span>
                        <span className="font-bold">{Object.values(qcChecklist).filter(v => v).length}/10</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCompleteRepair}
                      disabled={isSubmitting || Object.values(qcChecklist).filter(v => v).length < 10}
                      className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
                    >
                      {isSubmitting ? 'Finalizing...' : 'Complete Repair (ID 72)'}
                      <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    
                    <p className="text-[8px] font-bold text-center mt-4 opacity-60 uppercase tracking-widest">
                      Completing will move job to 'Ready for Pickup'
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Gate>
  );
};
