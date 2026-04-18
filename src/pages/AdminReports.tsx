import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  FileText, 
  Download, 
  AlertCircle, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  Printer,
  Loader2,
  ShieldCheck,
  ArrowUpRight
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";
import { complianceService, AuditLog } from "../api/services/compliance";

export const AdminReports: React.FC = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [anomaliesData, logsData] = await Promise.all([
        fetch('/api/reports/anomalies', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.ok ? res.json() : []),
        complianceService.getAuditLogs()
      ]);
      setAnomalies(anomaliesData);
      setAuditLogs(logsData.logs || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadZReport = async () => {
    try {
      const response = await fetch('/api/reports/z-report', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Z-Report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const downloadVatExport = async () => {
    try {
      const response = await fetch('/api/reports/tax/vat-export', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VAT-Export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (error) {
      console.error("VAT Export error:", error);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif italic tracking-tighter text-white leading-none">Audit & Compliance</h1>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Financial Oversight Matrix (ID 190-194)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Gate id={190}>
            <button 
              onClick={downloadZReport}
              className="bg-primary-foreground/20 text-primary-foreground px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-primary-foreground hover:text-white transition-all shadow-xl shadow-primary/10 active:scale-95"
            >
              <Download size={14} /> Z-Report
            </button>
          </Gate>
          <Gate id={194}>
            <button 
              onClick={downloadVatExport}
              className="bg-surface-container-highest/20 border border-white/5 text-white/60 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-white/5 transition-all shadow-sm active:scale-95"
            >
              <Download size={14} /> VAT CSV
            </button>
          </Gate>
          <Gate id={191}>
            <button className="bg-surface-container-highest/20 border border-white/5 text-white/60 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-white/5 transition-all shadow-sm active:scale-95">
              <Printer size={14} /> Print X
            </button>
          </Gate>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Anomaly Feed (ID 244) */}
        <Gate id={244}>
          <div className="lg:col-span-4 bg-surface-container-low/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <h2 className="text-lg font-serif italic flex items-center gap-3 text-destructive">
                <AlertCircle size={20} />
                Matrix Anomalies
              </h2>
              <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-[7px] font-black uppercase tracking-widest rounded-md border border-destructive/20 animate-pulse">Live Engine</span>
            </div>
            
            <div className="space-y-3 relative z-10 custom-scrollbar max-h-[60vh] overflow-y-auto pr-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-10">
                  <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Scanning Nodes...</p>
                </div>
              ) : anomalies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-[0.03]">
                  <ShieldCheck size={40} className="mb-4 text-white" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">Registry Secure</p>
                </div>
              ) : (
                anomalies.map((a) => (
                  <motion.div 
                    key={a._id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-destructive/[0.03] border border-destructive/10 rounded-2xl space-y-2 group hover:bg-destructive/[0.06] transition-all border-l-4 border-l-destructive/40"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black text-destructive uppercase tracking-widest">Level 2 Alert</span>
                      <span className="text-[8px] font-mono text-white/20">{new Date(a.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-tight text-white/80">Threshold Breach: {a.total.toFixed(3)} KD</p>
                    <div className="flex items-center justify-between pt-2 border-t border-destructive/5">
                      <p className="text-[8px] font-mono text-white/10 uppercase tracking-widest">NODE_{a._id.slice(-6).toUpperCase()}</p>
                      <ArrowUpRight size={12} className="text-destructive group-hover:scale-125 transition-transform" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            <div className="absolute top-0 right-0 w-48 h-48 bg-destructive/5 rounded-full -mr-24 -mt-24 blur-[80px] pointer-events-none" />
          </div>
        </Gate>

        {/* Audit Trail (ID 181) */}
        <Gate id={181}>
          <div className="lg:col-span-8 bg-surface-container-low/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <h2 className="text-xl font-serif italic flex items-center gap-3 text-white">
                <FileText size={20} className="text-primary-foreground" />
                Registry Vector Trail
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Synced Grid</span>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar relative z-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Operator</th>
                    <th className="py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Action Node</th>
                    <th className="py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Entity Vector</th>
                    <th className="py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-white/10">
                        Registry empty
                      </td>
                    </tr>
                  ) : auditLogs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-surface-container-highest/40 border border-white/5 rounded-full flex items-center justify-center text-[8px] font-black uppercase text-white/40 group-hover:bg-primary-foreground group-hover:text-white transition-all shadow-inner">
                            {log.userId?.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-tight text-white/60">{log.userId?.name || 'Unknown Operator'}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border rounded-lg ${
                          log.action === 'delete' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          log.action === 'update' ? 'bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground">{log.entity}</span>
                            <span className="text-[8px] font-mono text-white/10 truncate max-w-[120px]">{log.entityId}</span>
                         </div>
                      </td>
                      <td className="py-4 text-right text-[9px] font-mono font-black text-white/20 group-hover:text-white/40 transition-colors">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary-foreground/5 to-transparent pointer-events-none" />
          </div>
        </Gate>
      </div>
    </div>
  );
};
