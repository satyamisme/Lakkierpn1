import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  ChevronRight, 
  DollarSign, 
  ArrowRight, 
  Printer, 
  Save, 
  Send,
  Lock,
  Unlock,
  ShieldCheck,
  RefreshCcw,
  Zap,
  AlertCircle
} from 'lucide-react';

import axios from "axios";
import { useEffect } from "react";

export const ZReports = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [zReportData, setZReportData] = useState<any>(null);

  useEffect(() => {
    const fetchZReport = async () => {
      try {
        const res = await axios.get('/api/reports/z-report/summary');
        setZReportData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchZReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!zReportData) return <div>Failed to load Z-Report</div>;

  return (
    <div className="p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight leading-none">End of Day Matrix</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Financial Balancing & Z-Reports (ID 198)</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-4 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all flex items-center gap-2">
            <Printer size={16} /> Print X-Read
          </button>
          {!isLocked ? (
            <button 
              onClick={() => setIsLocked(true)}
              className="px-10 py-5 bg-red-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-500/20 flex items-center gap-3"
            >
              <Lock size={20} /> Generate Z-Report & Close Shift
            </button>
          ) : (
            <div className="px-10 py-5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-[2.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck size={20} /> Shift Sealed
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Terminal Balancing */}
        <div className="col-span-8 space-y-8">
          <div className="surface-container p-10 rounded-[3rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
             <div className="flex items-center justify-between mb-12">
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter">Terminal Balancing</h3>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2">Comparison of Expected vs Actual Physical Tender</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-relaxed">Report Handle: <span className="text-primary font-mono">{zReportData.id}</span></p>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Shift Start: 09:00 AM</p>
                </div>
             </div>

             <div className="space-y-4">
                {[
                  { label: 'Cash Tender', expected: zReportData.sales.cash || 0, key: 'cash' },
                  { label: 'KNET Processing', expected: zReportData.sales.knet || 0, key: 'knet' },
                  { label: 'Credit Card', expected: zReportData.sales.card || 0, key: 'card' },
                  { label: 'Vouchers/Points', expected: zReportData.sales.store_credit || 0, key: 'store_credit' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-12 gap-6 items-center p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] group hover:border-white/10 transition-all">
                     <div className="col-span-4">
                        <span className="text-xs font-black uppercase tracking-tight text-white/80">{row.label}</span>
                     </div>
                     <div className="col-span-3 text-center">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">System Expected</p>
                        <p className="text-lg font-black font-mono">{row.expected.toFixed(3)}</p>
                     </div>
                     <div className="col-span-1 text-center opacity-20">
                        <ArrowRight size={18} />
                     </div>
                     <div className="col-span-4">
                        <div className="relative">
                           <input 
                              disabled={isLocked}
                              placeholder="0.000"
                              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-black font-mono text-primary text-center outline-none focus:border-primary transition-all disabled:opacity-40"
                           />
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 text-[10px] font-black uppercase">KD</div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>

             <div className="mt-12 flex justify-between items-end border-t border-white/5 pt-12">
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20">
                         <Calculator size={18} />
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Opening Float</p>
                         <p className="text-lg font-black font-mono">{zReportData.openingFloat.toFixed(3)}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                         <DollarSign size={18} />
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-red-500/40 uppercase tracking-widest">Shift Expenses</p>
                         <p className="text-lg font-black font-mono text-red-500">-{zReportData.expenses.toFixed(3)}</p>
                      </div>
                   </div>
                </div>

                <div className="text-right p-10 bg-primary/5 border border-primary/20 rounded-[2.5rem] min-w-[300px] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                      <Zap size={64} className="text-primary" />
                   </div>
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Net Variance Target</p>
                   <div className="flex items-baseline justify-end gap-3">
                      <h4 className="text-6xl font-black font-mono tracking-tighter">{(zReportData.expectedTotal - zReportData.openingFloat).toLocaleString('en-KW', { minimumFractionDigits: 3 })}</h4>
                      <span className="text-xl font-black text-white/20">KD</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Audit Metadata */}
        <div className="col-span-4 space-y-8">
           <div className="surface-container p-10 rounded-[3rem] border border-white/5 space-y-8">
              <h3 className="text-lg font-black uppercase tracking-widest">Shift Metadata</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Terminal Velocity</span>
                    <span className="text-xs font-black uppercase italic tracking-tighter">High (4.4 txn/hr)</span>
                 </div>
                 <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Cashback Issued</span>
                    <span className="text-xs font-black font-mono">12.000 KD</span>
                 </div>
                 <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Inventory Reductions</span>
                    <span className="text-xs font-black font-mono">114 Units</span>
                 </div>
                 <div className="flex items-center justify-between py-4">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Tax Provision</span>
                    <span className="text-xs font-black font-mono">24.500 KD</span>
                 </div>
              </div>

              <div className="pt-6">
                 <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <RefreshCcw size={14} /> Recalculate Totals
                 </button>
              </div>
           </div>

           <div className="surface-container p-10 rounded-[3rem] border border-white/5 bg-amber-500/5">
              <h3 className="text-lg font-black uppercase tracking-widest text-amber-500 flex items-center gap-3">
                 <AlertCircle size={20} /> Integrity Notice
              </h3>
              <p className="mt-4 text-[10px] font-black text-amber-500/60 uppercase leading-relaxed tracking-widest">
                 Closing the shift will seal the ledger for {zReportData.terminal}. Any variances exceeding 5.000 KD will trigger an automated high-priority management audit.
              </p>
           </div>

           <div className="flex items-center justify-between px-10">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Audit Ref: {zReportData.id}</span>
              <button className="p-3 hover:bg-white/5 rounded-xl transition-all">
                <ChevronRight className="text-white/20" size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ZReports;
