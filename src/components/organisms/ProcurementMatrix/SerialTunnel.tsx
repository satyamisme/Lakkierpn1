import React, { useState, useEffect, useRef } from 'react';
import { X, Scan, CheckCircle2, AlertCircle, Trash2, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../../api/client';
import { toast } from 'sonner';

interface Props {
  product: any;
  onClose: () => void;
  onSave: (serials: string[]) => void;
}

export const SerialTunnel: React.FC<Props> = ({ product, onClose, onSave }) => {
  const [serials, setSerials] = useState<string[]>(product.serials || []);
  const [currentInput, setCurrentInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = currentInput.trim();
    if (!value) return;

    if (serials.includes(value)) {
      toast.error("Serial already scanned in this session");
      setCurrentInput('');
      return;
    }

    if (serials.length >= product.quantity) {
      toast.error(`Already scanned ${product.quantity} items`);
      setCurrentInput('');
      return;
    }

    // Global Registry Integrity Check
    try {
      setIsChecking(true);
      // Mocking check for now, but here would be an api call to check if IMEI exists
      // const res = await api.get(`/inventory/check-imei/${value}`);
      
      setSerials([...serials, value]);
      setCurrentInput('');
      toast.success(`Unit ${value} captured`, { duration: 1000 });
    } catch (err) {
      toast.error("Global Registry Conflict: Unit already in stock elsewhere");
    } finally {
      setIsChecking(false);
    }
  };

  const removeSerial = (idx: number) => {
    setSerials(serials.filter((_, i) => i !== idx));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[60%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-[60%] h-[60%] bg-purple-500/5 blur-[150px] rounded-full" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative w-full max-w-4xl bg-[#080808] border border-white/10 rounded-[4rem] shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-blue-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-12 right-12 p-4 hover:bg-white/5 rounded-full transition-all group"
        >
          <X size={24} className="text-white/20 group-hover:text-white" />
        </button>

        <div className="p-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="text-blue-500" size={20} />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Identifier Tunnel</span>
              </div>
              <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
                {product.name}
              </h2>
              <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mt-4">
                Scanning Strategy: {product.trackingMethod} Registry
              </p>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-6xl font-black text-white flex items-end gap-2 leading-none">
                {serials.length}
                <span className="text-2xl text-white/10">/ {product.quantity}</span>
              </div>
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-2">Units Captured</p>
            </div>
          </div>

          <form onSubmit={handleScan} className="relative mb-16">
            <Scan className="absolute left-8 top-1/2 -translate-y-1/2 text-blue-500" size={24} />
            <input 
              ref={inputRef}
              type="text"
              placeholder="Scan 15-Digit IMEI or Unique System ID..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value.toUpperCase())}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] py-8 pl-20 pr-8 text-xl font-black text-white placeholder:text-white/5 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
            {isChecking && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full"
                />
              </div>
            )}
          </form>

          <div className="h-64 overflow-y-auto no-scrollbar grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-black/40 rounded-[2.5rem] border border-white/5">
            <AnimatePresence>
              {serials.length === 0 ? (
                <div className="col-span-full h-full flex flex-col items-center justify-center text-white/10 italic text-xs font-bold uppercase tracking-widest">
                  Ready to Ingest Hardware Identifiers...
                </div>
              ) : (
                serials.map((s, i) => (
                  <motion.div 
                    key={s}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="group bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-blue-500/30 transition-all"
                  >
                    <span className="text-[10px] font-black text-white/60 font-mono">{s}</span>
                    <button 
                      onClick={() => removeSerial(i)}
                      className="p-1 text-white/10 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="mt-16 flex justify-end gap-6">
             <button 
              onClick={onClose}
              className="px-8 py-5 text-white/20 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Discard Changes
            </button>
            <button 
              onClick={() => onSave(serials)}
              disabled={serials.length !== product.quantity}
              className="px-12 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
            >
              Sync to Manifest
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
