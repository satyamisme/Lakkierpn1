import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X, Check, RefreshCw, Trash2, ArrowRight } from 'lucide-react';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflict: any;
  onResolve: (action: 'accept_remote' | 'overwrite' | 'discard' | 'manual') => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  conflict,
  onResolve
}) => {
  if (!conflict) return null;

  const { sale, error } = conflict;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-card border border-border rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-border flex items-center justify-between bg-red-500/5">
              <div className="flex items-center gap-3 text-red-500">
                <AlertCircle size={24} />
                <h2 className="text-xl font-bold uppercase tracking-tight">Sync Conflict Detected</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                <p className="text-sm font-bold mb-2">Error Message:</p>
                <p className="text-xs text-red-500 font-mono">{error.error || error.message || 'Unknown conflict'}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Offline Version</h3>
                  <div className="p-4 bg-muted rounded-xl border border-border text-xs space-y-2">
                    <p>Total: {sale.total.toFixed(3)}</p>
                    <p>Items: {sale.items.length}</p>
                    <p className="text-[8px] opacity-60">Created: {new Date(sale.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Status</h3>
                  <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 text-xs flex items-center justify-center h-full">
                    <p className="text-center text-red-500 font-bold">Stock/IMEI no longer available</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => onResolve('accept_remote')}
                  className="flex items-center justify-center gap-2 py-4 bg-muted hover:bg-muted/80 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <RefreshCw size={14} /> Accept Remote
                </button>
                <button 
                  onClick={() => onResolve('overwrite')}
                  className="flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground hover:scale-[1.02] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Check size={14} /> Force Overwrite
                </button>
                <button 
                  onClick={() => onResolve('discard')}
                  className="flex items-center justify-center gap-2 py-4 border border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Trash2 size={14} /> Discard Sale
                </button>
                <button 
                  onClick={() => onResolve('manual')}
                  className="flex items-center justify-center gap-2 py-4 bg-surface border border-border hover:bg-muted rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <ArrowRight size={14} /> Manual Merge
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
