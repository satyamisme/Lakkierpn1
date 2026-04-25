import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History, Search, Printer, FileText, Download, Filter, MoreVertical, Loader2, RefreshCw } from 'lucide-react';
import api from '../../api/client';
import { toast } from 'sonner';
import { printThermalReceipt, printA4Invoice } from '../../utils/documentService';
import { ThermalReceipt } from '../print/ThermalReceipt';
import { A4Invoice } from '../print/A4Invoice';

/**
 * ID 21: Sales History & Thermal Receipts
 */
export const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [printingSale, setPrintingSale] = useState<any>(null);

  const handlePrint = (sale: any, type: 'thermal' | 'a4') => {
    setPrintingSale(sale);
    toast.info(`Initializing ${type} print job...`, {
      description: "Compiling binary assets for thermal sequence."
    });
    
    // Allow React to render the hidden component before calling triggerPrint
    setTimeout(() => {
      if (type === 'thermal') {
        printThermalReceipt(sale.saleNumber || sale._id, 'history-thermal-receipt');
      } else {
        printA4Invoice(sale.saleNumber || sale._id, 'history-a4-invoice');
      }
    }, 300);
  };

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/sales');
      setSales(data);
    } catch (error) {
      toast.error("Failed to fetch transaction records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = sales.filter(s => 
    s.saleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] italic flex items-center gap-2 text-white/40">
          <History size={14} className="text-primary-foreground" />
          Transaction Registry (ID 21)
        </h2>
        <div className="flex gap-2">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-foreground transition-colors" size={10} />
            <input 
              type="text" 
              placeholder="SEARCH MANIFEST / SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface-container-highest/20 border border-white/5 pl-8 pr-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest focus:outline-none focus:border-primary-foreground/30 transition-all text-white w-48 placeholder:text-white/10"
            />
          </div>
          <button onClick={fetchSales} className="bg-surface-container-highest/20 border border-white/5 p-2 rounded-lg hover:bg-white/5 transition-all text-white/40 group">
            <RefreshCw size={12} className={isLoading ? 'animate-spin text-primary-foreground' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low/40 border border-white/5 rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="overflow-x-auto no-scrollbar">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center opacity-[0.05]">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">Scanning Registry...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th className="p-4">Manifest ID</th>
                  <th className="p-4">Principal</th>
                  <th className="p-4 text-center">Nodes</th>
                  <th className="p-4">Total Value</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Matrix</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[10px]">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-white/10 font-black uppercase tracking-widest">No Manifests Found</td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-white/[0.03] transition-colors group border-b border-white/5 last:border-0 font-bold text-white/60">
                      <td className="p-4 text-primary-foreground font-black">{sale.saleNumber}</td>
                      <td className="p-4 uppercase text-white/40 tracking-tighter">{sale.customerId?.name || 'Walk-in Principal'}</td>
                      <td className="p-4 text-center font-black">{sale.items.length}</td>
                      <td className="p-4 text-primary-foreground font-black text-xs tracking-tighter">{sale.total.toFixed(3)} <span className="text-[8px] opacity-40">KD</span></td>
                      <td className="p-4 text-white/20 text-[9px]">{new Date(sale.createdAt).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                          sale.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          sale.status === 'voided' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handlePrint(sale, 'thermal')}
                            className="p-1.5 hover:bg-white/5 border border-white/10 rounded-lg transition-all text-primary-foreground" title="Thermal Receipt"
                          >
                            <Printer size={12} />
                          </button>
                          <button 
                             onClick={() => handlePrint(sale, 'a4')}
                             className="p-1.5 hover:bg-white/5 border border-white/10 rounded-lg transition-all text-white/40 hover:text-white" title="A4 Invoice"
                          >
                            <FileText size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Hidden Print Nodes (ID 21, 25) */}
        {printingSale && (
          <div className="hidden">
            <div id="history-thermal-receipt">
              <ThermalReceipt 
                id="thermal-receipt-inner"
                orderId={printingSale.saleNumber || printingSale._id} 
                date={new Date(printingSale.createdAt).toLocaleString()}
                items={printingSale.items} 
                total={printingSale.total} 
                payments={printingSale.payments} 
              />
            </div>
            <div id="history-a4-invoice">
              <A4Invoice 
                id="a4-invoice-inner"
                orderId={printingSale.saleNumber || printingSale._id} 
                date={new Date(printingSale.createdAt).toLocaleDateString()}
                items={printingSale.items} 
                total={printingSale.total} 
                payments={printingSale.payments} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

