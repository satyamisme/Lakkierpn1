import React from "react";
import { CommissionReport as ReportType } from "../../api/services/commission";
import { Wallet, Calendar, TrendingUp, Zap, FileText, Download } from "lucide-react";

interface CommissionReportProps {
  report: ReportType;
}

export const CommissionReport: React.FC<CommissionReportProps> = ({ report }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">{report.name}</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Calendar size={10} /> Period: {report.period}
            </p>
          </div>
        </div>
        <button className="bg-muted hover:bg-muted/80 p-3 rounded-xl transition-all text-primary">
          <Download size={20} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Base Salary", value: report.baseSalary, icon: FileText, color: "text-muted-foreground" },
          { label: "Sales Comm.", value: report.salesCommission, icon: TrendingUp, color: "text-green-500" },
          { label: "Repair Comm.", value: report.repairCommission, icon: Zap, color: "text-amber-500" },
          { label: "Total Payable", value: report.totalPayable, icon: Wallet, color: "text-primary", highlight: true },
        ].map((card, i) => (
          <div key={i} className={`bg-card border p-5 space-y-2 ${card.highlight ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{card.label}</span>
              <card.icon className={card.color} size={16} />
            </div>
            <div className={`text-xl font-black font-mono ${card.highlight ? 'text-primary' : ''}`}>
              {card.value.toFixed(3)} KD
            </div>
          </div>
        ))}
      </div>

      {/* Details Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest px-2">Transaction Details</h3>
        <div className="bg-card border border-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 font-black uppercase tracking-widest text-[9px]">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="font-bold">
              {report.details.map((item, idx) => (
                <tr key={idx} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-muted-foreground">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[9px] uppercase ${
                      item.type === 'sale' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{item.amount.toFixed(3)} KD</td>
                  <td className="p-4 text-right text-primary font-mono">{item.commission.toFixed(3)} KD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
