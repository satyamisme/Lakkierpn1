import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  ChevronRight, 
  Smartphone, 
  User, 
  Package, 
  Wrench,
  CheckCircle2,
  X,
  Plus,
  Clock,
  Printer,
  History
} from 'lucide-react';
import api from '../../api/client';
import { toast } from 'sonner';
import { printJobCard } from '../../utils/documentService';

interface RepairListProps {
  repairs: any[];
  title: string;
  onRefresh: () => void;
}

export const RepairList: React.FC<RepairListProps> = ({ repairs, title, onRefresh }) => {
  const [selectedRepair, setSelectedRepair] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'repairing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'diagnosing': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'awaiting_parts': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="surface-container rounded-[3rem] border border-white/5 overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
         <h3 className="text-xl font-black uppercase tracking-tighter italic text-white">{title}</h3>
         <History size={18} className="text-white/20" />
      </div>

      <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto no-scrollbar">
        {repairs.length === 0 && (
          <div className="p-20 text-center">
             <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">No records found in active buffer</p>
          </div>
        )}
        {repairs.map(repair => (
          <div 
            key={repair._id}
            onClick={() => setSelectedRepair(repair)}
            className="flex items-center justify-between p-8 hover:bg-white/[0.02] transition-all cursor-pointer group"
          >
             <div className="flex items-center gap-8">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all shadow-inner">
                   <Smartphone size={24} />
                </div>
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-black text-white uppercase tracking-tight">{repair.deviceInfo.brand} {repair.deviceInfo.model}</p>
                      <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(repair.status)}`}>
                         {repair.status.replace('_', ' ')}
                      </span>
                      {repair.priority === 'urgent' && <span className="bg-orange-500 text-black text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Urgent</span>}
                      {repair.priority === 'vip' && <span className="bg-purple-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">VIP</span>}
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">#{repair.repairNumber}</span>
                      <span className="text-[10px] font-bold text-white/40 flex items-center gap-1">
                         <User size={10} /> {repair.customerId?.name || 'Guest'}
                      </span>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-12">
                <div className="text-right">
                   <p className="text-lg font-black text-white font-mono">{repair.quotedPrice.toFixed(3)} KD</p>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Quoted Matrix</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/10 group-hover:bg-blue-500 group-hover:text-white transition-all">
                   <ChevronRight size={16} />
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Repair Detail Modal */}
      <AnimatePresence>
        {selectedRepair && (
          <RepairDetailModal 
            repair={selectedRepair} 
            onClose={() => setSelectedRepair(null)} 
            onUpdate={onRefresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

import { RepairJobCard } from '../print/RepairJobCard';

const RepairDetailModal = ({ repair, onClose, onUpdate }: { repair: any, onClose: () => void, onUpdate: () => void }) => {
  const [status, setStatus] = useState(repair.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      await api.patch(`/repairs/${repair._id}`, { status: newStatus });
      setStatus(newStatus);
      toast.success(`Pipeline sequence updated to ${newStatus}`);
      onUpdate();
    } catch (err) {
      toast.error("Handshake Error: Failed to synchronize status update.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <RepairJobCard repair={repair} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      >
         {/* Header */}
         <div className="p-10 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
            <div>
               <h2 className="text-3xl font-serif italic tracking-tight text-white leading-none">
                  {repair.deviceInfo.brand} {repair.deviceInfo.model}
               </h2>
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-4 leading-none">SEQUENCE LOG: {repair.repairNumber}</p>
            </div>
            <div className="flex gap-4">
               <button 
                  onClick={() => printJobCard(repair.repairNumber)}
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl text-white hover:bg-white hover:text-black transition-all shadow-xl"
               >
                  <Printer size={20} />
               </button>
               <button onClick={onClose} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-white/20 hover:text-white transition-all">
                  <X size={20} />
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-12 no-scrollbar space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="col-span-2 space-y-8">
                  <div className="surface-container p-10 rounded-[2.5rem] border border-white/5 space-y-6">
                     <div className="flex items-center gap-3 mb-2">
                        <Wrench className="text-blue-500" size={18} />
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest underline underline-offset-8 decoration-white/10">Incident Matrix</h4>
                     </div>
                     <p className="text-sm font-bold text-white/80 leading-relaxed italic">"{repair.problemDescription}"</p>
                  </div>

                  <div className="surface-container p-10 rounded-[2.5rem] border border-white/5 space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Package className="text-purple-500" size={18} />
                           <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Inventory Consumption</h4>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase text-white/40 hover:text-white transition-all">
                           <Plus size={12} /> Link Part
                        </button>
                     </div>
                     <div className="p-6 bg-black/20 border border-dashed border-white/10 rounded-2xl text-center">
                        <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">No billable components detected</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="surface-container p-10 rounded-[2.5rem] border border-white/5 space-y-8">
                     <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest">Pipeline Control</h4>
                     
                     <div className="space-y-4">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-2">Assign Technician</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none"
                          value={repair.technicianId?._id || ''}
                          onChange={(e) => handleStatusChange(status)} // Reuse handleStatusChange logic but for tech
                        >
                           <option value="">Auto-Assign</option>
                           <option value="tech1">Eng. Ahmed</option>
                           <option value="tech2">Eng. Sarah</option>
                           <option value="tech3">Eng. Mustafa</option>
                        </select>
                     </div>

                     <div className="space-y-3 pt-4">
                        {['received', 'diagnosing', 'awaiting_parts', 'repairing', 'ready', 'collected'].map(s => (
                          <button 
                            key={s}
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(s)}
                            className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left flex items-center justify-between transition-all ${status === s ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'}`}
                          >
                            {s.replace('_', ' ')}
                            {status === s && <CheckCircle2 size={14} />}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="surface-container p-8 rounded-[2rem] border border-white/5 bg-green-500/5">
                     <p className="text-[9px] font-black text-green-500/40 uppercase tracking-widest mb-4">Financial Ledger</p>
                     <div className="space-y-3">
                        <div className="flex justify-between">
                           <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Price</span>
                           <span className="text-sm font-black text-white">{repair.quotedPrice.toFixed(3)} KD</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Deposit</span>
                           <span className="text-sm font-black text-blue-400">-{repair.deposit.toFixed(3)} KD</span>
                        </div>
                        <div className="pt-3 border-t border-white/5 flex justify-between">
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">Balance Due</span>
                           <span className="text-lg font-black text-green-500">{(repair.quotedPrice - repair.deposit).toFixed(3)} KD</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </motion.div>
    </div>
  );
}
