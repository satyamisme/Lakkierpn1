import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  DollarSign, 
  Truck, 
  ShieldCheck, 
  Calculator, 
  ArrowRight, 
  Search,
  Package,
  FileText,
  Percent,
  Plus
} from 'lucide-react';
import axios from "axios";
import { toast } from "sonner";

interface PO {
  _id: string;
  supplierId: { name: string };
  totalLanded: number;
  items: { quantity: number; unitCost: number; productId: any }[];
  status: string;
  createdAt: string;
}

export const LandedCost: React.FC = () => {
  const [pos, setPos] = useState<PO[]>([]);
  const [selectedPo, setSelectedPo] = useState<PO | null>(null);
  const [loading, setLoading] = useState(true);
  const [additionalCosts, setAdditionalCosts] = useState({
    shipping: 0,
    customs: 0,
    insurance: 0,
    fees: 0
  });

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      const res = await axios.get('/api/inventory/po');
      // Only show POs that aren't RECEIVED or CANCELLED for allocation, or allow all to see history
      setPos(res.data);
    } catch (error) {
      toast.error("Failed to load Purchase Orders");
    } finally {
      setLoading(false);
    }
  };

  const calculateAllocation = () => {
    if (!selectedPo) return [];
    const totalItemsValue = selectedPo.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const totalExtra = additionalCosts.shipping + additionalCosts.customs + additionalCosts.insurance + additionalCosts.fees;

    return selectedPo.items.map(item => {
      const itemValue = item.quantity * item.unitCost;
      const shareOfExtra = (itemValue / totalItemsValue) * totalExtra;
      const landedUnitCost = item.unitCost + (shareOfExtra / item.quantity);
      return {
          ...item,
          allocatedExtra: shareOfExtra,
          landedUnitCost
      };
    });
  };

  const handleApplyCosts = async () => {
    if (!selectedPo) return;
    try {
      await axios.put(`/api/inventory/po/${selectedPo._id}/landed-cost`, {
        landedCostBreakdown: additionalCosts
      });
      toast.success("Landed costs applied and WAC updated");
      fetchPOs();
      setSelectedPo(null);
    } catch (error) {
      toast.error("Failed to apply costs");
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Landed Cost Engine</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
            Global Logistics Cost Allocation & WAC Synchronization (ID 153)
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-serif italic text-white">Select Acquisition Manifest</h3>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search manifest..." 
                        className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 text-[10px] uppercase font-black tracking-widest outline-none focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto no-scrollbar">
              {pos.map(po => (
                <button
                  key={po._id}
                  onClick={() => setSelectedPo(po)}
                  className={`p-6 rounded-[2rem] border transition-all text-left flex items-center justify-between group ${
                    selectedPo?._id === po._id 
                    ? 'bg-primary text-black border-primary' 
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPo?._id === po._id ? 'bg-black/10' : 'bg-white/5'}`}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">PO-{po._id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm font-black uppercase">{po.supplierId?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-black">{po.totalLanded.toLocaleString()} KD</p>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40">{new Date(po.createdAt).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {selectedPo && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-[3rem] p-10"
            >
              <div className="flex items-center gap-4 mb-8">
                <Calculator className="text-primary" size={24} />
                <h4 className="text-xl font-serif italic">Cost Allocation Breakdown</h4>
              </div>

              <div className="space-y-4">
                {calculateAllocation().map((item: any, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-2xl">
                    <div>
                        <p className="text-xs font-black uppercase tracking-tight text-white/80">{item.name || 'Product ' + (idx + 1)}</p>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">
                            Base Cost: {item.unitCost.toFixed(3)} KD • Qty: {item.quantity}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-mono font-black text-primary">+{item.allocatedExtra.toFixed(3)} KD Total</p>
                        <p className="text-[10px] font-mono font-black text-white">Landed: {item.landedUnitCost.toFixed(3)} KD</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        <aside className="space-y-10">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 space-y-10">
            <h3 className="text-2xl font-serif italic">Expenses to Allocate</h3>
            
            <div className="space-y-6">
              {[
                { label: 'Shipping & Freight', icon: Truck, key: 'shipping' },
                { label: 'Customs & Duties', icon: ShieldCheck, key: 'customs' },
                { label: 'Carrier Insurance', icon: ShieldCheck, key: 'insurance' },
                { label: 'Handling Fees', icon: Percent, key: 'fees' }
              ].map((expense) => (
                <div key={expense.key} className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <expense.icon size={12} className="text-primary" />
                        {expense.label}
                    </label>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="number"
                      value={(additionalCosts as any)[expense.key]}
                      onChange={(e) => setAdditionalCosts({...additionalCosts, [expense.key]: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-mono font-black outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Base Total</span>
                <span className="text-sm font-mono font-black">{selectedPo ? selectedPo.items.reduce((s, i) => s + (i.quantity * i.unitCost), 0).toLocaleString() : '0.000'} KD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest text-primary">Extra Costs</span>
                <span className="text-sm font-mono font-black text-primary">
                    {Object.values(additionalCosts).reduce((a, b) => a + b, 0).toLocaleString()} KD
                </span>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Final Landed</span>
                <span className="text-xl font-mono font-black">
                    {( (selectedPo ? selectedPo.items.reduce((s, i) => s + (i.quantity * i.unitCost), 0) : 0) + Object.values(additionalCosts).reduce((a, b) => a + b, 0) ).toLocaleString()} KD
                </span>
              </div>
            </div>

            <button 
                disabled={!selectedPo}
                onClick={handleApplyCosts}
                className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none shadow-2xl shadow-white/5"
            >
              Commit Allocation <ArrowRight size={16} />
            </button>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-8 rounded-[3rem]">
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">WAC Methodology</h4>
            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold text-justify">
                Costs are weighted by individual item value relative to manifest total. Applying costs will instantly recalculate 
                Weighted Average Cost (WAC) for all affected stock nodes, ensuring true financial transparency.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LandedCost;
