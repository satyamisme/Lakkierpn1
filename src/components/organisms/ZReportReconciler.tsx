import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  DollarSign, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Calendar,
  Printer
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export const ZReportReconciler: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/compliance/zreport');
      setReport(response.data.data);
      toast.success("Z-Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate Z-Report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="bg-surface-container-lowest border border-border rounded-[3rem] p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
          <div>
            <h3 className="text-4xl font-serif italic">Z-Report Reconciler</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Daily Financial Closure & Reconciliation</p>
          </div>
          <button 
            onClick={generateReport}
            disabled={loading}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck size={18} />}
            Generate Z-Report
          </button>
        </div>

        {!report ? (
          <div className="py-20 text-center opacity-40">
            <ShieldCheck size={64} className="mx-auto mb-6" />
            <p className="text-sm font-black uppercase tracking-widest">No active report. Click generate to begin reconciliation.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
          >
            <div className="p-8 bg-surface border border-border rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gross Sales</p>
                <DollarSign size={16} className="text-primary" />
              </div>
              <h4 className="text-3xl font-mono font-black">{report.totalSales.toFixed(3)} KD</h4>
            </div>
            
            <div className="p-8 bg-surface border border-border rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Refunds</p>
                <RotateCcw size={16} className="text-red-500" />
              </div>
              <h4 className="text-3xl font-mono font-black text-red-500">({report.totalRefunds.toFixed(3)} KD)</h4>
            </div>

            <div className="p-8 bg-foreground text-background rounded-3xl space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Net Cash Position</p>
                <CheckCircle2 size={16} className="text-primary" />
              </div>
              <h4 className="text-3xl font-mono font-black text-primary">{report.netSales.toFixed(3)} KD</h4>
            </div>

            <div className="lg:col-span-3 p-8 bg-muted/20 border border-border rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center text-primary">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Report Period</p>
                  <p className="text-xs font-bold">{new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center gap-2">
                  <Printer size={14} /> Print X-Tape
                </button>
                <button className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                  Finalize Z-Report
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-surface-container-lowest border border-border rounded-[3rem] p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <h4 className="text-xl font-serif italic">Discrepancy Watch</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The system automatically flags any variance between recorded digital payments and physical cash-in-drawer declarations. Ensure all manual entries are verified by a manager.
          </p>
        </div>
        
        <div className="bg-primary/5 border border-primary/10 rounded-[3rem] p-10 flex items-center justify-between">
          <div>
            <h4 className="text-xl font-serif italic text-primary">Compliance Status</h4>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mt-1">Government Ready</p>
          </div>
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <ShieldCheck size={32} />
          </div>
        </div>
      </div>
    </div>
  );
};
