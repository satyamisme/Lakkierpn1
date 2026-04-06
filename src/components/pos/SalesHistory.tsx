import React from 'react';
import { motion } from 'motion/react';
import { History, Search, Printer, FileText, Download, Filter, MoreVertical } from 'lucide-react';

/**
 * ID 21: Sales History & Thermal Receipts
 */
export const SalesHistory: React.FC = () => {
  const sales = [
    { id: 'POS-1234', customer: 'Walk-in Customer', items: 2, total: '£120.00', date: '2026-04-05 14:20', status: 'Paid' },
    { id: 'POS-1235', customer: 'John Doe', items: 1, total: '£45.00', date: '2026-04-05 15:10', status: 'Paid' },
    { id: 'POS-1236', customer: 'Jane Smith', items: 3, total: '£850.00', date: '2026-04-04 11:30', status: 'Paid' },
    { id: 'POS-1237', customer: 'Walk-in Customer', items: 1, total: '£15.00', date: '2026-04-04 09:45', status: 'Refunded' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <History size={20} className="text-primary" />
          Sales History
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
            <input 
              type="text" 
              placeholder="Search Orders..." 
              className="bg-muted border border-border pl-8 pr-4 py-1.5 rounded-none font-black text-[10px] uppercase tracking-widest focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="bg-muted border border-border p-2 hover:bg-muted/80 transition-colors">
            <Filter size={14} />
          </button>
          <button className="bg-muted border border-border p-2 hover:bg-muted/80 transition-colors">
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="p-4 border-b border-border">Order ID</th>
                <th className="p-4 border-b border-border">Customer</th>
                <th className="p-4 border-b border-border">Items</th>
                <th className="p-4 border-b border-border">Total</th>
                <th className="p-4 border-b border-border">Date</th>
                <th className="p-4 border-b border-border">Status</th>
                <th className="p-4 border-b border-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="p-4 border-b border-border font-bold text-primary">{sale.id}</td>
                  <td className="p-4 border-b border-border font-bold">{sale.customer}</td>
                  <td className="p-4 border-b border-border">{sale.items}</td>
                  <td className="p-4 border-b border-border font-bold">{sale.total}</td>
                  <td className="p-4 border-b border-border text-muted-foreground">{sale.date}</td>
                  <td className="p-4 border-b border-border">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      sale.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-4 border-b border-border text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-muted border border-border rounded transition-colors" title="Thermal Receipt">
                        <Printer size={12} />
                      </button>
                      <button className="p-1.5 hover:bg-muted border border-border rounded transition-colors" title="A4 Invoice">
                        <FileText size={12} />
                      </button>
                      <button className="p-1.5 hover:bg-muted border border-border rounded transition-colors">
                        <MoreVertical size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
