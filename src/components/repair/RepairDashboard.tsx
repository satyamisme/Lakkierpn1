import React, { useState, useMemo } from 'react';
import { Wrench, ClipboardCheck, Receipt, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Gate } from '../PermissionGuard';
import { JobCardForm } from './JobCardForm';
import { FaultMatrix } from './FaultMatrix';
import { calculateEstimatedQuote } from '../../utils/repairLogic';
import { printThermalReceipt, printJobCard } from '../../utils/documentService';
import { JobCard } from './JobCard';

/**
 * ID 61: Repair Dashboard Organism
 * Main intake dashboard for repair job cards.
 */
export const RepairDashboard: React.FC = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    phoneModel: '',
    imei: '',
  });
  const [selectedFaults, setSelectedFaults] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const estimatedQuote = useMemo(() => calculateEstimatedQuote(selectedFaults), [selectedFaults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleFault = (fault: string) => {
    setSelectedFaults(prev => 
      prev.includes(fault) ? prev.filter(f => f !== fault) : [...prev, fault]
    );
  };

  const handleSubmit = async () => {
    if (!formData.customerName || !formData.phoneModel || !formData.imei) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          faults: selectedFaults,
          estimatedQuote,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessData(data);
        // Reset form
        setFormData({ customerName: '', customerPhone: '', phoneModel: '', imei: '' });
        setSelectedFaults([]);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create job card");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Gate id={61}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                <Wrench className="w-8 h-8" />
              </div>
              Repair Hub <span className="text-indigo-600 dark:text-indigo-400">Intake</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-2 ml-1">
              ID 61: Job Card Creation & Fault Matrix (ID 62)
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estimated Quote (ID 65)</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{estimatedQuote.toFixed(3)} KD</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Device & Customer Info</h2>
              <JobCardForm formData={formData} onChange={handleInputChange} />
            </section>

            <section>
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Fault Matrix (ID 62)</h2>
              <FaultMatrix selectedFaults={selectedFaults} onToggleFault={toggleFault} />
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 dark:shadow-none sticky top-28">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                <ClipboardCheck className="w-6 h-6" /> Summary
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Model</span>
                  <span className="font-bold">{formData.phoneModel || '---'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Faults</span>
                  <span className="font-bold">{selectedFaults.length} Selected</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Quote</span>
                  <span className="text-xl font-black">{estimatedQuote.toFixed(3)} KD</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.customerName || !formData.phoneModel}
                className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
              >
                {isSubmitting ? 'Creating Job Card...' : 'Generate Job Card'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {successData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
            >
              <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/50 rounded-[2rem] flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Job Card Created!</h2>
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">
                  Job ID: {successData._id}
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => setSuccessData(null)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all"
                  >
                    Done
                  </button>
                  <button 
                    onClick={() => printThermalReceipt(successData._id)}
                    className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    Print Receipt (ID 21)
                  </button>
                  <button 
                    onClick={() => printJobCard(successData._id)}
                    className="w-full py-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-100 transition-all"
                  >
                    Print Job Card (ID 61)
                  </button>
                </div>

                {/* Hidden Print Templates */}
                <div className="hidden">
                  <div id={`job-card-${successData._id}`}>
                    <JobCard 
                      id={`job-card-component-${successData._id}`}
                      data={successData}
                    />
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
