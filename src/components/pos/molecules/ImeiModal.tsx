import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

interface ImeiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (imei: string) => void;
  productName: string;
}

export const ImeiModal: React.FC<ImeiModalProps> = ({ isOpen, onClose, onConfirm, productName }) => {
  const [imei, setImei] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const validateImei = async () => {
    if (imei.length !== 15) {
      setError("IMEI must be exactly 15 digits");
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
        setError(data.error || "IMEI validation failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Network error. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-card border border-border shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tighter italic">IMEI Validation</h3>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{productName}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Enter 15-Digit IMEI</label>
                <input
                  type="text"
                  maxLength={15}
                  value={imei}
                  onChange={(e) => setImei(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000000000000"
                  className="w-full bg-muted border border-border p-4 text-xl font-mono tracking-[0.2em] text-center focus:border-primary outline-none transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
                </motion.div>
              )}

              <button
                onClick={validateImei}
                disabled={isValidating || imei.length !== 15}
                className="w-full bg-primary text-primary-foreground py-4 font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm IMEI
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border text-center">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                ID 5: Forced IMEI/Serial Validation Required
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
