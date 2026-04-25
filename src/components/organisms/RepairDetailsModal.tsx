import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Wrench, 
  User, 
  Smartphone, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Save,
  Printer,
  History,
  MessageSquare
} from 'lucide-react';
import api from '../../api/client';
import { toast } from 'sonner';

import { printJobCard } from '../../utils/documentService';

interface RepairDetailsModalProps {
  repair: any;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const RepairDetailsModal: React.FC<RepairDetailsModalProps> = ({ 
  repair, 
  isOpen, 
  onClose, 
  onRefresh 
}) => {
  const [status, setStatus] = useState(repair.status);
  const [technicianNote, setTechnicianNote] = useState(repair.technicianNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await api.patch(`/repairs/${repair._id}`, {
        status,
        technicianNotes: technicianNote
      });
      toast.success("Repair status synchronized across cluster.");
      onRefresh();
      onClose();
    } catch (err) {
      toast.error("Handshake Error: Could not update repair node.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative bg-[#0A0A0A] border border-white/10 rounded-[3.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <Wrench size={32} />
             </div>
             <div>
                <h2 className="text-3xl font-serif italic text-white flex items-center gap-4">
                   {repair.deviceInfo.brand} {repair.deviceInfo.model}
                </h2>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">
                   RECORD ID: {repair.repairNumber} // PINNED TO CLOUD NODE
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full text-white/20 transition-all">
             <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
           <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8 space-y-8">
                 <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-3">
                       <Smartphone size={16} /> Device Intelligence
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">IMEI / Serial</p>
                          <p className="text-xs font-mono text-white/80">{repair.deviceInfo.imei || 'N/A'}</p>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Passcode</p>
                          <p className="text-xs font-mono text-white/80">{repair.deviceInfo.passcode || 'N/A'}</p>
                       </div>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                       <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Diagnosis Matrix</p>
                       <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                          <p className="text-sm text-white/60 font-medium italic leading-relaxed">
                             "{repair.problemDescription}"
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-3">
                       <MessageSquare size={16} /> Technician Notes
                    </h3>
                    <textarea 
                       value={technicianNote}
                       onChange={(e) => setTechnicianNote(e.target.value)}
                       placeholder="Log repair progress, internal parts usage, or hardware discoveries..."
                       className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white/80 outline-none focus:border-blue-500/50 transition-all min-h-[150px] resize-none"
                    />
                 </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-8">
                 <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-3">
                       <User size={16} /> Identity Hub
                    </h3>
                    <div>
                       <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Customer</p>
                       <p className="text-sm font-bold text-white">{repair.customerId?.name || 'Guest User'}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Contact Handshake</p>
                       <p className="text-sm font-mono text-white/60">{repair.customerId?.phone || 'N/A'}</p>
                    </div>
                 </div>

                 <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] space-y-6 shadow-2xl shadow-blue-500/20">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60">Financial Quote</h3>
                    <div className="flex items-baseline gap-2">
                       <h4 className="text-5xl font-black font-mono tracking-tighter">{(repair.quotedPrice || 0).toFixed(3)}</h4>
                       <span className="text-sm font-black opacity-40 uppercase">KD</span>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-relaxed font-bold">
                          Approved by client on {new Date(repair.createdAt).toLocaleDateString()}
                       </p>
                    </div>
                 </div>

                 <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[3rem] space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Status Vector</h3>
                    <div className="space-y-3">
                       {['received', 'diagnosing', 'repairing', 'ready', 'collected'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                               status === s 
                               ? 'bg-blue-500 text-white border-blue-400 shadow-xl shadow-blue-500/20 scale-105' 
                               : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'
                            }`}
                          >
                             <div className={`w-2 h-2 rounded-full ${status === s ? 'bg-white' : 'bg-white/20'}`} />
                             <span className="text-[10px] font-black uppercase tracking-[0.1em]">{s}</span>
                             {status === s && <CheckCircle2 size={16} className="ml-auto" />}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-10 border-t border-white/5 flex gap-6 bg-white/[0.02]">
           <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 py-5 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 disabled:opacity-50"
           >
              {isUpdating ? <Clock className="animate-spin" /> : <Save size={20} />}
              Sync Status Updates
           </button>
           <button 
              onClick={() => printJobCard(repair._id)}
              className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
           >
              <Printer size={20} /> Print Job Label
           </button>
        </div>

        {/* Hidden Printing Vector (ID 61) */}
        <div className="hidden">
           <div id={`job-card-${repair._id}`} className="p-8 bg-white text-black font-sans uppercase">
              <div className="border-4 border-black p-6 space-y-4">
                 <div className="flex justify-between border-b-2 border-black pb-4">
                    <h1 className="text-4xl font-black">JOB CARD</h1>
                    <div className="text-right">
                       <p className="text-3xl font-mono font-black">#{repair.repairNumber}</p>
                       <p className="text-[10px] font-bold">{new Date().toLocaleString()}</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold">DEVICE</p>
                       <p className="text-xl font-black">{repair.deviceInfo.brand} {repair.deviceInfo.model}</p>
                       <p className="text-sm font-mono">{repair.deviceInfo.imei}</p>
                    </div>
                    <div className="text-right space-y-1">
                       <p className="text-[10px] font-bold">CLIENT</p>
                       <p className="text-lg font-black">{repair.customerId?.name || 'Guest'}</p>
                       <p className="text-sm font-mono">{repair.customerId?.phone}</p>
                    </div>
                 </div>

                 <div className="bg-black text-white p-4">
                    <p className="text-[10px] font-bold mb-1">FAULT REPORT</p>
                    <p className="text-sm font-bold italic">"{repair.problemDescription}"</p>
                 </div>

                 <div className="pt-4 border-t border-black grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[10px] font-bold">ESTIMATED QUOTE</p>
                       <p className="text-2xl font-black">{repair.quotedPrice?.toFixed(3)} KD</p>
                    </div>
                    <div className="border-l border-black pl-4">
                       <p className="text-[10px] font-bold">STATUS</p>
                       <p className="text-xl font-black uppercase">{repair.status}</p>
                    </div>
                 </div>

                 <div className="pt-20 border-t-2 border-dashed border-black">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <div className="w-48 h-px bg-black" />
                          <p className="text-[8px] font-bold">CUSTOMER SIGNATURE</p>
                       </div>
                       <p className="text-[10px] font-bold text-center">LAKKI PHONE TERMINAL v2.6</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};
