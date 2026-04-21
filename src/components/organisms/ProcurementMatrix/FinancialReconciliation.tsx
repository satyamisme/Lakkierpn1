import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface Props {
  items: any[];
  onUpdate: (index: number, updates: any) => void;
  active: boolean;
  onNext: () => void;
}

export const FinancialReconciliation: React.FC<Props> = ({ 
  items, onUpdate, active, onNext 
}) => {
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  const totalRetailValue = items.reduce((sum, item) => sum + (item.quantity * item.retailPrice), 0);
  const estimatedProfit = totalRetailValue - totalValue;

  return (
    <div className={`p-10 rounded-[3.5rem] border transition-all duration-500 ${active ? 'bg-white/[0.03] border-blue-500/30 ring-4 ring-blue-500/5' : 'bg-white/[0.01] border-white/5 opacity-50'}`}>
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-4">
          <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <DollarSign className="text-white w-6 h-6" />
          </div>
          Stage 4: Financial Reconciliation
        </h2>
        
        {active && (
          <button 
            onClick={onNext}
            className="px-10 py-4 bg-white text-black rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5"
          >
            Finalize Intake
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem]">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Total Landed Cost</p>
          <h3 className="text-3xl font-black text-white">{totalValue.toFixed(3)} <span className="text-xs text-white/40">KD</span></h3>
        </div>
        <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem]">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Expected Revenue</p>
          <h3 className="text-3xl font-black text-white font-mono">{totalRetailValue.toFixed(3)} <span className="text-xs text-white/40">KD</span></h3>
        </div>
        <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem]">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Est. Gross Profit</p>
          <h3 className="text-3xl font-black text-green-500 font-mono">+{estimatedProfit.toFixed(3)} <span className="text-xs text-green-500/40">KD</span></h3>
        </div>
      </div>

      <div className="space-y-6">
        <div className="px-6 py-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4">
          <TrendingUp className="text-blue-500" size={18} />
          <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest">
            Audit Insight: Updating cost prices will refresh the global inventory valuation models.
          </p>
        </div>

        <div className="overflow-hidden border border-white/5 rounded-[2.5rem]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Product Details</th>
                <th className="px-8 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Purchase Cost</th>
                <th className="px-8 py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Target Retail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item, idx) => (
                <tr key={item.productId} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <h4 className="text-xs font-black text-white uppercase">{item.name}</h4>
                    <p className="text-[9px] text-white/20 font-bold uppercase mt-1">{item.sku}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <input 
                        disabled={!active}
                        type="number"
                        step="0.001"
                        value={item.costPrice}
                        onChange={(e) => onUpdate(idx, { costPrice: parseFloat(e.target.value) || 0 })}
                        className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs font-black text-white w-28 focus:border-blue-500 outline-none"
                      />
                      <span className="text-[10px] font-black text-white/20">KD</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <input 
                        disabled={!active}
                        type="number"
                        step="0.001"
                        value={item.retailPrice}
                        onChange={(e) => onUpdate(idx, { retailPrice: parseFloat(e.target.value) || 0 })}
                        className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs font-black text-white w-28 focus:border-blue-500 outline-none"
                      />
                      <span className="text-[10px] font-black text-white/20">KD</span>
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
