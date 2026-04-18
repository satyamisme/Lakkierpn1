import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

interface ImeiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (imei: string) => void;
  productName: string;
  variantId?: string;
  productId?: string;
}

export const ImeiModal: React.FC<ImeiModalProps> = ({ isOpen, onClose, onConfirm, productName, variantId, productId }) => {
  const [imei, setImei] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [availableImeis, setAvailableImeis] = useState<string[]>([]);
  const [isLoadingImeis, setIsLoadingImeis] = useState(false);

  React.useEffect(() => {
    if (isOpen && (variantId || productId)) {
      fetchAvailableImeis();
    }
  }, [isOpen, variantId, productId]);

  const fetchAvailableImeis = async () => {
    try {
      setIsLoadingImeis(true);
      const res = await axios.get(`/api/inventory/available-imeis`, {
        params: { variantId, productId }
      });
      setAvailableImeis(res.data);
    } catch (err) {
      console.error("Failed to fetch IMEIs", err);
    } finally {
      setIsLoadingImeis(false);
    }
  };

  const validateImei = async () => {
    // Audit Wiring: Relaxed 5-digit check to support Alphanumeric Serials and IMEIs
    if (imei.length < 5) {
      setError("Identifier is too short to be valid");
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      const response = await axios.get(`/api/imei/check/${imei}`);
      const data = response.data;

      if (data.exists && data.available) {
        onConfirm(imei);
        setImei("");
        onClose();
      } else {
        setError(data.error || "Registry validation failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Network error. Node unreachable.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm bg-surface-container-low/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-foreground/10 rounded-xl">
                  <Smartphone className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-white/40">Identifier Registry</h3>
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-widest leading-none mt-1">{productName}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="text-white/20 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] block ml-1">Scan or Enter Identifier</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && validateImei()}
                    placeholder="SCAN SERIAL / IMEI..."
                    className="w-full bg-white/[0.02] border border-white/5 p-4 text-xs font-mono tracking-[0.4em] text-center focus:border-primary-foreground focus:bg-white/[0.04] outline-none transition-all rounded-2xl text-white placeholder:text-white/10 shadow-inner group-hover:border-white/10"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <Smartphone size={14} className="text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Stock Manifest</label>
                  <span className="text-[7px] font-bold text-white/10 uppercase tracking-widest">{availableImeis.length} Unit(s)</span>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {isLoadingImeis ? (
                    <div className="py-8 flex justify-center opacity-20">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    </div>
                  ) : availableImeis.length > 0 ? (
                    availableImeis.map((id) => (
                      <button 
                        key={id}
                        onClick={() => {
                          setImei(id);
                          onConfirm(id);
                          onClose();
                        }}
                        className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-[9px] font-mono font-black text-white/40 hover:text-white hover:bg-primary-foreground/20 hover:border-primary-foreground/40 transition-all text-left flex items-center justify-between group shadow-sm"
                      >
                        <span className="tracking-widest">{id}</span>
                        <div className="w-1 h-1 bg-white/10 rounded-full group-hover:bg-primary-foreground transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                      <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">No available identifiers</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <p className="text-[9px] font-black uppercase tracking-widest leading-tight">{error}</p>
                </motion.div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={validateImei}
                  disabled={isValidating || imei.length < 5}
                  className="flex-1 bg-primary-foreground/20 text-primary-foreground py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary-foreground hover:text-white transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-primary-foreground/5"
                >
                  {isValidating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  VALIDATE NODE
                </button>
              </div>
            </div>

            <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center">
              <p className="text-[7px] text-white/10 font-black uppercase tracking-[0.4em]">
                ENFORCED SECURITY LAYER // ID_5_CAPTURE
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
