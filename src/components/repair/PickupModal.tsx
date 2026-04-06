import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, Smartphone, User, Hash, History, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Repair {
  _id: string;
  customerName: string;
  phoneModel: string;
  imei: string;
  estimatedQuote: number;
}

interface PickupModalProps {
  repair: Repair | null;
  onClose: () => void;
  onConfirm: (id: string, paymentMethod: string) => Promise<void>;
}

/**
 * ID 141: Pickup & Billing Modal Organism
 * Appears when a 'Ready' job is selected for pickup.
 */
export const PickupModal: React.FC<PickupModalProps> = ({ repair, onClose, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!repair) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(repair._id, paymentMethod);
      onClose();
    } catch (error) {
      console.error("Pickup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          <div className="p-8 bg-indigo-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Repair Pickup</h2>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">ID 141: Billing & Delivery</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">{repair.phoneModel}</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3" /> {repair.customerName}
                    <span className="opacity-20">|</span>
                    <Hash className="w-3 h-3" /> {repair.imei}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Due (ID 65)</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{repair.estimatedQuote.toFixed(3)} KD</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Matrix (ID 12)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {['cash', 'knet', 'visa', 'link'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === method 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-indigo-500'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{method}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200 dark:shadow-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Confirm Delivery & Billing
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest">
              <History className="w-3 h-3" /> This will mark job as 'Delivered' and deduct parts from stock
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
