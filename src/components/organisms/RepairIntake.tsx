import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Smartphone, 
  User, 
  Clipboard, 
  DollarSign, 
  Calendar,
  Search,
  Plus,
  CheckCircle2,
  Printer,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../api/client';
import { toast } from 'sonner';
import { CustomerSelector } from './CustomerSelector';
import { SmartSelector } from '../atoms/SmartSelector';
import { printJobCard } from '../../utils/documentService';
import { RepairJobCard } from '../print/RepairJobCard';

interface RepairIntakeProps {
  onComplete: () => void;
}

export const RepairIntake: React.FC<RepairIntakeProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const [formData, setFormData] = useState({
    deviceInfo: {
      brand: '',
      model: '',
      serialNumber: '',
      imei: '',
      color: '',
    },
    priority: 'normal',
    problemDescription: '',
    estimatedCost: 0,
    quotedPrice: 0,
    deposit: 0,
    expectedReadyDate: '',
    notes: ''
  });

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.error("Process Logic Error: Identity Vector Missing.");
      return;
    }

    try {
      const payload = {
        ...formData,
        customerId: selectedCustomer._id,
        status: 'received'
      };

      const res = await api.post('/repairs', payload);
      if (res.status === 201) {
        toast.success("Cyber Intake Complete: Asset registered in repair pipeline.");
        setSuccessData(res.data);
      }
    } catch (err) {
      console.error("Intake failure:", err);
      toast.error("Execution Conflict: Failed to register repair.");
    }
  };

  return (
    <div className="surface-container rounded-[3rem] border border-white/5 overflow-hidden bg-black/40 backdrop-blur-3xl shadow-2xl">
      {/* Stepper Header */}
      <div className="p-10 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-6">
          {[
            { id: 1, label: 'Identity', icon: User },
            { id: 2, label: 'Device Matrix', icon: Smartphone },
            { id: 3, label: 'Diagnosis', icon: Wrench },
            { id: 4, label: 'Financials', icon: DollarSign }
          ].map(s => (
            <div key={s.id} className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${step >= s.id ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-white/5 text-white/20'}`}>
                  <s.icon size={18} />
               </div>
               {step === s.id && (
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white animate-in fade-in slide-in-from-left-2">{s.label}</span>
               )}
            </div>
          ))}
        </div>
        <div className="text-[10px] font-mono font-black text-white/20 uppercase tracking-widest">
           Step {step} / 4
        </div>
      </div>

      <div className="p-12">
        <AnimatePresence mode="wait">
          {successData ? (
             <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="py-12 flex flex-col items-center text-center space-y-10"
             >
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 size={48} />
                </div>
                
                <div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none">Intake Synchronized</h3>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mt-6 leading-none">
                    TICKET SEQUENCE: {successData.repairNumber}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                   <button 
                     onClick={() => printJobCard(successData.repairNumber)}
                     className="flex flex-col items-center gap-4 p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                   >
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-white transition-all">
                        <Printer size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Print Job Card</span>
                   </button>
                   <button 
                     onClick={onComplete}
                     className="flex flex-col items-center gap-4 p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                   >
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-white transition-all">
                        <ChevronRight size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Return to Pipeline</span>
                   </button>
                </div>

                {/* Hidden Job Card for Printing */}
                <div className="hidden">
                  <RepairJobCard repair={successData} />
                </div>
             </motion.div>
          ) : (
            <>
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">Identity Synapse</h3>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-2">Couple the asset with a verified owner profile</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 min-h-[400px]">
                <CustomerSelector 
                  selectedCustomer={selectedCustomer} 
                  onSelect={(c) => {
                    setSelectedCustomer(c);
                    setStep(2);
                  }} 
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
               <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white flex items-center gap-4">
                  <Smartphone className="text-blue-500" /> Device Specifics
               </h3>
               
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <SmartSelector 
                      label="Brand"
                      field="brand"
                      value={formData.deviceInfo.brand}
                      onChange={(val) => setFormData({...formData, deviceInfo: {...formData.deviceInfo, brand: val}})}
                    />
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Specific Model</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500"
                        placeholder="e.g. iPhone 15 Pro Max"
                        value={formData.deviceInfo.model}
                        onChange={(e) => setFormData({...formData, deviceInfo: {...formData.deviceInfo, model: e.target.value}})}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">IMEI / Identification Vector</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500"
                        placeholder="15-digit IMEI sequence"
                        value={formData.deviceInfo.imei}
                        onChange={(e) => setFormData({...formData, deviceInfo: {...formData.deviceInfo, imei: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Serial Number</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500"
                        placeholder="Manufacturer Serial"
                        value={formData.deviceInfo.serialNumber}
                        onChange={(e) => setFormData({...formData, deviceInfo: {...formData.deviceInfo, serialNumber: e.target.value}})}
                      />
                    </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-10">
                  <button onClick={() => setStep(1)} className="px-8 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-white/10">Next Sequence</button>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
               <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white flex items-center gap-4">
                  <Wrench className="text-purple-500" /> Diagnosis & Problem
               </h3>

               <div className="space-y-6">
                 <div className="space-y-4">
                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Intake Priority</label>
                    <div className="flex gap-4">
                       {[
                         { id: 'normal', label: 'Standard', color: 'bg-white/5 text-white/40' },
                         { id: 'urgent', label: 'High Priority', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                         { id: 'vip', label: 'Bespoke / VIP', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
                       ].map(p => (
                         <button
                           key={p.id}
                           onClick={() => setFormData({...formData, priority: p.id})}
                           className={`flex-1 py-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.priority === p.id ? 'bg-white text-black shadow-xl shadow-white/10' : p.color + ' border-white/5'}`}
                         >
                           {p.label}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Problem Description (Client Declaration)</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-bold text-white outline-none focus:border-purple-500 min-h-[150px]"
                      placeholder="Describe the anomalies in detail..."
                      value={formData.problemDescription}
                      onChange={(e) => setFormData({...formData, problemDescription: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Estimated Ready Date</label>
                       <input 
                         type="date"
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-purple-500 appearance-none"
                         value={formData.expectedReadyDate}
                         onChange={(e) => setFormData({...formData, expectedReadyDate: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Internal Tech Notes</label>
                       <input 
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-purple-500"
                         placeholder="Diagnostic clues..."
                         value={formData.notes}
                         onChange={(e) => setFormData({...formData, notes: e.target.value})}
                       />
                    </div>
                 </div>
               </div>

               <div className="flex gap-4 pt-10">
                  <button onClick={() => setStep(2)} className="px-8 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Back</button>
                  <button onClick={() => setStep(4)} className="flex-1 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-white/10">Next Sequence</button>
               </div>
            </motion.div>
          )}

          {step === 4 && (
             <motion.div 
               key="step4"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
             >
                <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white flex items-center gap-4">
                  <DollarSign className="text-green-500" /> Financial Settlement
               </h3>

               <div className="grid grid-cols-3 gap-6">
                  <div className="p-8 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                     <label className="text-[9px] font-black text-white/20 uppercase tracking-widest block text-center">Estimated Cost</label>
                     <div className="relative">
                        <input 
                          type="number"
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-2xl font-black text-center text-white outline-none"
                          value={formData.estimatedCost}
                          onChange={(e) => setFormData({...formData, estimatedCost: parseFloat(e.target.value) || 0})}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase tracking-widest">KD</span>
                     </div>
                  </div>
                  <div className="p-8 bg-green-500/5 border border-green-500/10 rounded-3xl space-y-4">
                     <label className="text-[9px] font-black text-green-500/40 uppercase tracking-widest block text-center underline">Quoted Price</label>
                     <div className="relative">
                        <input 
                          type="number"
                          className="w-full bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-2xl font-black text-center text-green-400 outline-none"
                          value={formData.quotedPrice}
                          onChange={(e) => setFormData({...formData, quotedPrice: parseFloat(e.target.value) || 0})}
                        />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-green-500/40 uppercase tracking-widest">KD</span>
                     </div>
                  </div>
                  <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-4">
                     <label className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest block text-center">Deposit Received</label>
                     <div className="relative">
                        <input 
                          type="number"
                          className="w-full bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-2xl font-black text-center text-blue-400 outline-none"
                          value={formData.deposit}
                          onChange={(e) => setFormData({...formData, deposit: parseFloat(e.target.value) || 0})}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500/40 uppercase tracking-widest">KD</span>
                     </div>
                  </div>
               </div>

               <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Executive Summary</h4>
                    <span className="px-3 py-1 bg-green-500 text-black text-[9px] font-black rounded-full uppercase tracking-widest">Ready for Intake</span>
                  </div>
                  <div className="grid grid-cols-2 gap-12">
                     <div className="space-y-4">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                           <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Customer</span>
                           <span className="text-[11px] font-bold text-white">{selectedCustomer?.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                           <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Asset</span>
                           <span className="text-[11px] font-bold text-white">{formData.deviceInfo.brand} {formData.deviceInfo.model}</span>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                           <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Balance Due</span>
                           <span className="text-[11px] font-black text-green-500">{(formData.quotedPrice - formData.deposit).toFixed(3)} KD</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                           <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Collection</span>
                           <span className="text-[11px] font-bold text-white">{formData.expectedReadyDate || 'TBD'}</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-10">
                  <button onClick={() => setStep(3)} className="px-8 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Back</button>
                  <button onClick={handleSubmit} className="flex-1 py-5 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                     <CheckCircle2 size={22} /> Execute Asset Intake
                  </button>
               </div>
             </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
      </div>
    </div>
  );
};
