import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X, Pause, ArrowRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface HeldCartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetrieve: (sessionId: string) => void;
}

export const HeldCartsModal: React.FC<HeldCartsModalProps> = ({ isOpen, onClose, onRetrieve }) => {
  const [heldSales, setHeldSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHeldSales();
    }
  }, [isOpen]);

  const fetchHeldSales = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/sales/held');
      setHeldSales(response.data);
    } catch (error) {
      console.error("Fetch held sales error:", error);
      toast.error("Failed to fetch held carts.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.patch(`/api/sales/${id}/void`);
      toast.success("Held cart discarded.");
      fetchHeldSales();
    } catch (error) {
      toast.error("Failed to discard cart.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-3xl"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative bg-surface-container-lowest border border-border rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-12 border-b border-border flex items-start justify-between">
              <div>
                <h2 className="text-5xl font-serif italic tracking-tight leading-none">Held Carts</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Resume Suspended Sessions (ID 16)</p>
              </div>
              <button onClick={onClose} className="p-4 hover:bg-surface-container rounded-full text-muted-foreground transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-6 no-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Syncing Vault...</p>
                </div>
              ) : heldSales.length === 0 ? (
                <div className="py-20 border border-dashed border-border rounded-[3rem] text-center opacity-30">
                  <Pause size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No held sessions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {heldSales.map((sale) => (
                    <div key={sale._id} className="p-8 bg-surface border border-border rounded-[2.5rem] flex items-center justify-between group hover:border-primary/50 transition-all shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black uppercase tracking-widest text-primary">ID: {sale.sessionId}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{new Date(sale.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm font-black uppercase tracking-tighter">{sale.items.length} Items • {sale.total.toFixed(3)} KD</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleDelete(sale._id)}
                          className="p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                        <button 
                          onClick={() => onRetrieve(sale.sessionId)}
                          className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                        >
                          Resume <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
