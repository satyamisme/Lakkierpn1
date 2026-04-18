import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, X, CreditCard, CheckCircle2, Loader2, Sparkles, Wand2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface GiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (card: any) => void;
  customerId?: string;
}

export const GiftCardModal: React.FC<GiftCardModalProps> = ({ isOpen, onClose, onSuccess, customerId }) => {
  const [mode, setMode] = useState<'sell' | 'check'>('sell');
  const [amount, setAmount] = useState("");
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkedCard, setCheckedCard] = useState<any>(null);

  const generateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCode(randomCode);
  };

  const handleCreate = async () => {
    if (!amount || !code) return;
    try {
      setIsProcessing(true);
      const res = await axios.post('/api/gift-cards', {
        code,
        balance: parseFloat(amount),
        customerId
      });
      toast.success("Gift Matrix Synthesized");
      onSuccess?.(res.data);
      onClose();
    } catch (error) {
      toast.error("Process Aborted: Synthesis Failure");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheck = async () => {
    if (!code) return;
    try {
      setIsProcessing(true);
      const res = await axios.get(`/api/gift-cards/${code}`);
      setCheckedCard(res.data);
    } catch (error) {
      toast.error("Invalid Vector Code");
      setCheckedCard(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-8 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
              <div>
                <h2 className="text-3xl font-serif italic tracking-tight text-white leading-none">Value Engine</h2>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-3 leading-none">Gift & Credits Matrix (ID 20)</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-10">
              <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 gap-1.5 shadow-inner">
                <button 
                  onClick={() => setMode('sell')}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'sell' ? 'bg-primary-foreground text-white shadow-xl shadow-primary-foreground/20' : 'text-white/20 hover:text-white/40 hover:bg-white/5'}`}
                >
                  Issue Matrix
                </button>
                <button 
                  onClick={() => setMode('check')}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'check' ? 'bg-primary-foreground text-white shadow-xl shadow-primary-foreground/20' : 'text-white/20 hover:text-white/40 hover:bg-white/5'}`}
                >
                  Query Node
                </button>
              </div>

              {mode === 'sell' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="space-y-4">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/10 ml-1">Asset Value (KD)</p>
                    <div className="relative group">
                       <input 
                         type="number"
                         value={amount}
                         onChange={(e) => setAmount(e.target.value)}
                         placeholder="0.000"
                         className="w-full bg-white/[0.02] border border-white/5 px-8 py-8 rounded-[1.75rem] text-4xl font-serif italic text-center outline-none focus:border-primary-foreground/40 transition-all shadow-inner text-white placeholder:text-white/5 group-hover:border-white/10"
                       />
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 font-black text-[10px]">KD</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/10 ml-1">Unique Identifier</p>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="IDENTIFIER CODE..."
                        className="flex-1 bg-white/[0.02] border border-white/5 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:border-primary-foreground/40 transition-all text-white placeholder:text-white/5"
                      />
                      <button 
                        onClick={generateCode}
                        className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-primary-foreground hover:bg-primary-foreground hover:text-white transition-all shadow-sm group active:scale-95"
                      >
                        <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleCreate}
                    disabled={isProcessing || !amount || !code}
                    className="w-full py-5 bg-primary-foreground/20 text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-primary-foreground/5 hover:bg-primary-foreground hover:text-white transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Issue Value Matrix
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="space-y-4">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/10 ml-1">Scan or Enter Identifier</p>
                    <div className="flex gap-2 group">
                      <input 
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="NODE CODE..."
                        className="flex-1 bg-white/[0.02] border border-white/5 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:border-primary-foreground/40 transition-all text-white placeholder:text-white/5"
                        onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                      />
                      <button 
                        onClick={handleCheck}
                        disabled={isProcessing}
                        className="px-8 bg-primary-foreground/20 text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary-foreground hover:text-white active:scale-95 disabled:opacity-20"
                      >
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : "Identify"}
                      </button>
                    </div>
                  </div>

                  {checkedCard && (
                    <motion.div 
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden"
                    >
                      <div className="relative z-10 text-center">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-3 font-mono leading-none">{checkedCard.code}</p>
                        <h3 className="text-5xl font-serif italic text-primary-foreground tracking-tighter">{checkedCard.currentBalance.toFixed(3)} KD</h3>
                        <p className="text-[8px] font-black uppercase tracking-[0.5em] mt-4 text-white/10 leading-none">Verified Balance Matrix</p>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full blur-3xl" />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
