import React, { useState, useRef, useEffect } from "react";
import { Barcode, X, Save, Trash2, List, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { bulkService } from "../../api/services/bulk";

interface BulkBarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (barcodes: string[]) => void;
}

export const BulkBarcodeScanner: React.FC<BulkBarcodeScannerProps> = ({ isOpen, onClose, onComplete }) => {
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [currentScan, setCurrentScan] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentScan) return;
    
    if (scannedItems.includes(currentScan)) {
      toast.error("Item already scanned");
    } else {
      setScannedItems(prev => [currentScan, ...prev]);
      toast.success(`Scanned: ${currentScan}`);
    }
    setCurrentScan("");
  };

  const handleProcess = async () => {
    setLoading(true);
    try {
      await bulkService.bulkScanner(scannedItems);
      toast.success("Bulk scan processed");
      onComplete?.(scannedItems);
      onClose();
    } catch (error) {
      toast.error("Failed to process bulk scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Barcode className="text-primary w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Bulk Scanner</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
            </div>

            <div className="p-8 space-y-6">
              <form onSubmit={handleScan}>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Awaiting Scan...</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentScan}
                  onChange={(e) => setCurrentScan(e.target.value)}
                  placeholder="Scan barcode or IMEI..."
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-black text-xl tracking-widest"
                />
              </form>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <List size={14} /> Scanned Items ({scannedItems.length})
                  </h3>
                  <button onClick={() => setScannedItems([])} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline">Clear All</button>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  {scannedItems.map((item, i) => (
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }} 
                      animate={{ x: 0, opacity: 1 }}
                      key={i} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent hover:border-indigo-100 transition-all"
                    >
                      <span className="font-mono font-bold text-sm tracking-widest">{item}</span>
                      <button onClick={() => setScannedItems(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                  {scannedItems.length === 0 && (
                    <div className="text-center py-12 opacity-20">
                      <Barcode size={48} className="mx-auto mb-2" />
                      <p className="font-black uppercase tracking-widest text-xs">No items scanned</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleProcess} 
                disabled={loading || scannedItems.length === 0}
                className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Process {scannedItems.length} Scans
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
