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
      toast.error("Registry Access Denied");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.patch(`/api/sales/${id}/void`);
      toast.success("Vector Purged");
      fetchHeldSales();
    } catch (error) {
      toast.error("Operation Failed");
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
            className="relative bg-surface-container-low/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-8 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
              <div>
                <h2 className="text-3xl font-serif italic tracking-tight text-white leading-none">Suspended Sessions</h2>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-3 leading-none">Vault Retrieval Matrix (ID 16)</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-10">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary-foreground" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing Matrix Vault...</p>
                </div>
              ) : heldSales.length === 0 ? (
                <div className="py-20 border border-dashed border-white/5 rounded-[2rem] text-center opacity-10">
                  <Pause size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-none">No Suspended Vectors Found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {heldSales.map((sale) => (
                    <div key={sale._id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[1.75rem] flex items-center justify-between group hover:border-primary-foreground/40 transition-all shadow-inner">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-foreground">DOMAIN ID: {sale.sessionId}</span>
                          <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{new Date(sale.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[14px] font-black uppercase tracking-tighter text-white/80">{sale.items.length} Units • {sale.total.toFixed(3)} KD</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleDelete(sale._id)}
                          className="p-3 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => onRetrieve(sale.sessionId)}
                          className="px-6 py-3 bg-primary-foreground text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[9px] flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary-foreground/10"
                        >
                          Restore Node <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/10 text-center leading-none">Session data persists in temporal vault for 24 hours</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
