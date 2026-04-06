import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Smartphone, 
  User, 
  Clock, 
  CheckSquare, 
  ShieldCheck,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Gate } from '../PermissionGuard';

/**
 * ID 71: QC Terminal & Checklist
 */
export const QCTerminal: React.FC = () => {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [qcChecklist, setQcChecklist] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRepairs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/repairs?status=ready-for-qc');
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

  const handleToggleQC = (item: string) => {
    setQcChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handlePassQC = async () => {
    const checklistItems = [
      'Touch Screen Responsiveness',
      'Camera (Front & Back)',
      'Microphone & Speaker',
      'Charging Port Functionality',
      'FaceID / TouchID',
      'Network & WiFi Signal'
    ];
    
    const allPassed = checklistItems.every(item => qcChecklist[item]);
    if (!allPassed) {
      alert("Please complete all QC checks before passing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/repairs/${selectedRepair._id}/qc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qcResults: qcChecklist }),
      });
      if (response.ok) {
        setSelectedRepair(null);
        setQcChecklist({});
        fetchRepairs();
      }
    } catch (error) {
      console.error("Pass QC error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFailQC = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/repairs/${selectedRepair._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in-progress' }), // Move back to bench
      });
      if (response.ok) {
        setSelectedRepair(null);
        setQcChecklist({});
        fetchRepairs();
      }
    } catch (error) {
      console.error("Fail QC error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading QC Queue...</p>
      </div>
    );
  }

  const checklistItems = [
    'Touch Screen Responsiveness',
    'Camera (Front & Back)',
    'Microphone & Speaker',
    'Charging Port Functionality',
    'FaceID / TouchID',
    'Network & WiFi Signal'
  ];

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
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* QC Queue */}
              <div className="lg:col-span-1 space-y-6">
                <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
                  <ShieldCheck size={20} className="text-primary" />
                  QC Queue (ID 71)
                </h2>
                <div className="space-y-4">
                  {repairs.length === 0 ? (
                    <div className="p-12 border border-dashed border-border text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Queue Empty</p>
                    </div>
                  ) : (
                    repairs.map((item) => (
                      <motion.div
                        key={item._id}
                        whileHover={{ x: 4 }}
                        onClick={() => setSelectedRepair(item)}
                        className="p-4 border border-border bg-card cursor-pointer transition-colors hover:border-primary/50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-black text-primary font-mono">#{item._id.slice(-6).toUpperCase()}</span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {item.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-black mb-1 flex items-center gap-2">
                          <Smartphone size={14} className="text-muted-foreground" />
                          {item.phoneModel}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-mono mb-2">{item.customerName}</p>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User size={10} /> Technician
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> 15m
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Empty Workspace State */}
              <div className="lg:col-span-2 flex items-center justify-center bg-muted/30 border border-dashed border-border rounded-3xl min-h-[400px]">
                <div className="text-center space-y-4">
                  <CheckSquare size={48} className="mx-auto text-muted-foreground opacity-20" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Select a device to start QC</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedRepair(null)}
                  className="p-3 bg-card border border-border text-muted-foreground hover:text-primary transition-all active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic">QC Workspace: #{selectedRepair._id.slice(-6).toUpperCase()}</h2>
                  <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">{selectedRepair.phoneModel} | {selectedRepair.customerName}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button 
                    onClick={handleFailQC}
                    disabled={isSubmitting}
                    className="bg-red-500 text-white px-6 py-2 rounded-none font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <XCircle size={14} /> Fail QC
                  </button>
                  <button 
                    onClick={handlePassQC}
                    disabled={isSubmitting}
                    className="bg-green-500 text-white px-6 py-2 rounded-none font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} /> Pass QC
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <CheckSquare size={120} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {checklistItems.map((label) => (
                    <div key={label} className="flex items-center justify-between p-4 bg-muted/30 border border-border group hover:border-primary/50 transition-colors">
                      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setQcChecklist(prev => ({ ...prev, [label]: false }))}
                          className={`p-1.5 border transition-colors ${qcChecklist[label] === false ? 'bg-red-500 text-white border-red-500' : 'bg-card border-border hover:bg-red-500 hover:text-white'}`}
                        >
                          <XCircle size={14} />
                        </button>
                        <button 
                          onClick={() => setQcChecklist(prev => ({ ...prev, [label]: true }))}
                          className={`p-1.5 border transition-colors ${qcChecklist[label] === true ? 'bg-green-500 text-white border-green-500' : 'bg-card border-border hover:bg-green-500 hover:text-white'}`}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">QC Notes / Observations</label>
                  <textarea 
                    placeholder="Enter any observations during QC..." 
                    className="w-full bg-muted border border-border p-4 text-xs font-mono focus:border-primary outline-none min-h-[100px]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Gate>
  );
};
