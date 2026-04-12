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
      setAuditLogs(logsData);
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
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Audit & Reports</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">Compliance & financial oversight matrix (ID 190-194)</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Gate id={190}>
            <button 
              onClick={downloadZReport}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/40"
            >
              <Download size={18} /> Download Z-Report
            </button>
          </Gate>
          <Gate id={194}>
            <button 
              onClick={downloadVatExport}
              className="bg-surface-container-lowest border border-border px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-muted transition-all shadow-sm"
            >
              <Download size={18} /> Export VAT CSV
            </button>
          </Gate>
          <Gate id={191}>
            <button className="bg-surface-container-lowest border border-border px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-muted transition-all shadow-sm">
              <Printer size={18} /> Print X-Report
            </button>
          </Gate>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Anomaly Feed (ID 244) */}
        <Gate id={244}>
          <div className="lg:col-span-4 bg-surface-container-lowest border border-border p-10 rounded-[3.5rem] shadow-sm space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <h2 className="text-2xl font-serif italic flex items-center gap-4 text-red-500">
                <AlertCircle size={24} />
                Suspicious Activity
              </h2>
              <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">Live Watch</span>
            </div>
            
            <div className="space-y-6 relative z-10">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Scanning Nodes...</p>
                </div>
              ) : anomalies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <ShieldCheck size={48} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Matrix Secure</p>
                </div>
              ) : (
                anomalies.map((a) => (
                  <motion.div 
                    key={a._id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 bg-red-500/[0.03] border border-red-500/10 rounded-[2rem] space-y-3 group hover:bg-red-500/[0.06] transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Low Price Anomaly</span>
                      <span className="text-[9px] font-mono text-muted-foreground opacity-60">{new Date(a.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-black uppercase tracking-tighter">Transaction: {a.total.toFixed(3)} KD</p>
                    <div className="flex items-center justify-between pt-2 border-t border-red-500/5">
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Node ID: {a._id.slice(-8).toUpperCase()}</p>
                      <ArrowUpRight size={14} className="text-red-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
          </div>
        </Gate>

        {/* Audit Trail (ID 181) */}
        <Gate id={181}>
          <div className="lg:col-span-8 bg-surface-container-lowest border border-border p-10 rounded-[4rem] shadow-sm space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <h2 className="text-3xl font-serif italic flex items-center gap-4">
                <FileText size={28} className="text-primary" />
                Real-Time Audit Trail
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Synchronized</span>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar relative z-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-6 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Operator</th>
                    <th className="py-6 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Action</th>
                    <th className="py-6 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Entity Node</th>
                    <th className="py-6 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">IP Address</th>
                    <th className="py-6 text-right text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-[10px] font-black uppercase tracking-widest opacity-20">
                        No audit logs found
                      </td>
                    </tr>
                  ) : auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface transition-all group">
                      <td className="py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-[10px] font-black uppercase group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            {log.userName?.charAt(0) || 'U'}
                          </div>
                          <span className="text-xs font-black uppercase tracking-tighter">{log.userName}</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className="px-4 py-1.5 bg-green-500/5 text-green-500 text-[9px] font-black uppercase tracking-widest border border-green-500/10 rounded-full">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-6 text-xs font-mono font-black uppercase tracking-widest opacity-60 truncate max-w-[150px]">
                        {log.details}
                      </td>
                      <td className="py-6 text-xs font-mono text-muted-foreground">{log.ipAddress}</td>
                      <td className="py-6 text-right text-xs font-mono font-black opacity-40">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Background Accent */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
          </div>
        </Gate>
      </div>
    </div>
  );
};
