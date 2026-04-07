import React, { useState } from "react";
import { ShieldCheck, FileText, Download, Calendar, Loader2 } from "lucide-react";
import { complianceService } from "../../api/services/compliance";
import { toast } from "sonner";

export const ComplianceReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await complianceService.exportTaxCompliance(dateRange.start, dateRange.end);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tax-compliance-${dateRange.start}-to-${dateRange.end}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Tax report exported successfully");
    } catch (error) {
      toast.error("Failed to export tax report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-2xl text-primary">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight italic">Tax Compliance Export</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Generate government-ready financial reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full bg-muted border-none pl-10 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full bg-muted border-none pl-10 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
        <FileText className="text-blue-600 shrink-0" size={24} />
        <div className="space-y-1">
          <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Report Format: CSV (Standard)</h4>
          <p className="text-xs text-blue-700 font-medium">Includes all taxable sales, returns, and VAT breakdowns for the selected period.</p>
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Download size={20} />}
        Export Compliance Data
      </button>
    </div>
  );
};
