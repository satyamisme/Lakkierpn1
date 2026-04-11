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
  Loader2
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";

export const AdminReports: React.FC = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reports/anomalies', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setAnomalies(await response.json());
      }
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Audit & Reports</h1>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">Compliance & financial oversight</p>
        </div>
        <div className="flex gap-2">
          <Gate id={190}>
            <button 
              onClick={downloadZReport}
              className="bg-primary text-primary-foreground px-6 py-3 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all"
            >
              <Download size={16} /> Download Z-Report
            </button>
          </Gate>
          <Gate id={194}>
            <button 
              onClick={downloadVatExport}
              className="bg-muted border border-border px-6 py-3 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-muted/80 transition-all"
            >
              <Download size={16} /> Export VAT CSV
            </button>
          </Gate>
          <Gate id={191}>
            <button className="bg-muted border border-border px-6 py-3 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-muted/80 transition-all">
              <Printer size={16} /> Print X-Report
            </button>
          </Gate>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Anomaly Feed (ID 244) */}
        <Gate id={244}>
          <div className="lg:col-span-1 bg-card border border-border p-6 shadow-xl space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-red-500">
              <AlertCircle size={18} />
              Suspicious Activity Feed
            </h2>
            <div className="space-y-4">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              ) : anomalies.length === 0 ? (
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">No anomalies detected</p>
              ) : (
                anomalies.map((a) => (
                  <div key={a._id} className="p-4 bg-red-500/5 border border-red-500/10 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Low Price Sale</span>
                      <span className="text-[9px] font-mono text-muted-foreground">{new Date(a.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-tighter">Total: {a.total.toFixed(3)} KD</p>
                    <p className="text-[9px] font-mono text-muted-foreground">Sale ID: {a._id.slice(-6).toUpperCase()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </Gate>

        {/* Audit Trail (ID 181) */}
        <Gate id={181}>
          <div className="lg:col-span-2 bg-card border border-border p-6 shadow-xl space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Real-Time Audit Trail
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest">User</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest">Action</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest">Entity</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest">IP Address</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-xs font-bold uppercase tracking-widest">Admin</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest">CREATE</span>
                      </td>
                      <td className="p-4 text-xs font-mono uppercase tracking-widest">SALE</td>
                      <td className="p-4 text-xs font-mono">192.168.1.10{i}</td>
                      <td className="p-4 text-xs font-mono">12:3{i}:45</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Gate>
      </div>
    </div>
  );
};
