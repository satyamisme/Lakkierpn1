import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X, Upload, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { bulkService } from '../api/services/bulk';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
        toast.error("Please upload a valid CSV file.");
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        return headers.reduce((obj: any, header, i) => {
          obj[header.trim()] = values[i]?.trim();
          return obj;
        }, {});
      });
      setPreview(data.filter(d => d.name));
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      // In a real app, we'd use FormData and a multipart/form-data endpoint
      // For this demo, we'll simulate the bulk processing
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvData = e.target?.result as string;
        await bulkService.importProducts(csvData);
        toast.success("Bulk import completed successfully.");
        onSuccess();
        onClose();
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error("Bulk import failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = "name,sku,category,price,cost,stock,isImeiRequired\n";
    const sample = "iPhone 15 Pro,IP15P-128,Phones,345.000,300.000,10,true\n";
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    a.click();
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
            className="relative bg-surface-container-lowest border border-border rounded-[4rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col"
          >
            <div className="p-12 border-b border-border flex items-start justify-between">
              <div>
                <h2 className="text-5xl font-serif italic tracking-tight leading-none">Bulk Ingestion</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Mass Asset Import Matrix (ID 137)</p>
              </div>
              <button onClick={onClose} className="p-4 hover:bg-surface-container rounded-full text-muted-foreground transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-12 space-y-10">
              <div className="flex gap-6">
                <div 
                  className="flex-1 border-2 border-dashed border-border rounded-[3rem] p-12 text-center space-y-4 hover:border-primary/50 transition-all cursor-pointer relative group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedFile = e.dataTransfer.files[0];
                    if (droppedFile) {
                      setFile(droppedFile);
                      parseCSV(droppedFile);
                    }
                  }}
                >
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-all duration-500">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest">{file ? file.name : "Drop CSV Matrix Here"}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-2">or click to browse local storage</p>
                  </div>
                </div>

                <button 
                  onClick={downloadTemplate}
                  className="w-48 bg-surface border border-border rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:bg-muted transition-all group"
                >
                  <Download size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Template</span>
                </button>
              </div>

              {preview.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Data Preview (First 5 Rows)</h3>
                  <div className="bg-surface border border-border rounded-3xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          {Object.keys(preview[0]).map(h => (
                            <th key={h} className="px-6 py-4 text-[8px] font-black uppercase tracking-widest opacity-40">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-b border-border/50 last:border-0">
                            {Object.values(row).map((v: any, j) => (
                              <td key={j} className="px-6 py-4 text-[10px] font-mono font-black truncate max-w-[120px]">{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex gap-6 pt-6">
                <button 
                  onClick={onClose}
                  className="flex-1 py-6 border border-border rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-surface-container transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="flex-1 py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      <CheckCircle2 size={20} /> Execute Ingestion
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
