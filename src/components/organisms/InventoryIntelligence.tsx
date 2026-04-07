import React, { useEffect } from "react";
import { useInventoryIntelligenceStore } from "../../store/useInventoryIntelligenceStore";
import { BrainCircuit, TrendingUp, AlertTriangle, CheckCircle, Loader2, RefreshCw, ArrowRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const InventoryIntelligence: React.FC = () => {
  const { forecast, suggestions, risks, isLoading, fetchSuggestions, fetchRisks } = useInventoryIntelligenceStore();

  useEffect(() => {
    fetchSuggestions();
    fetchRisks();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <BrainCircuit className="text-primary w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">AI Inventory Intelligence</h2>
        </div>
        <button
          onClick={() => { fetchSuggestions(); fetchRisks(); }}
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stock Optimization Suggestions */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest px-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" /> Optimization Suggestions
          </h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : suggestions.map((s) => (
              <div key={s.productId} className="bg-card border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary transition-all">
                <div className="space-y-1">
                  <h4 className="font-black uppercase tracking-tight text-lg">{s.name}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.reason}</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current</div>
                    <div className="text-lg font-black">{s.currentStock}</div>
                  </div>
                  <ArrowRight className="text-muted-foreground" size={20} />
                  <div className="text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary">Suggested</div>
                    <div className="text-lg font-black text-primary">{s.suggestedStock}</div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    s.action === 'restock' ? 'bg-green-100 text-green-700' :
                    s.action === 'liquidate' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stockout Risks */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest px-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" /> Stockout Risks
          </h3>
          <div className="space-y-3">
            {risks.map((risk) => (
              <div key={risk.productId} className="bg-red-50 border border-red-100 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-black uppercase tracking-tight text-sm text-red-900">{risk.name}</h4>
                  <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                    risk.riskLevel === 'high' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {risk.riskLevel} risk
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-red-700">
                    <span>Est. Time to Stockout</span>
                    <span>{risk.daysUntilStockout} Days</span>
                  </div>
                  <div className="w-full h-1.5 bg-red-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600" 
                      style={{ width: `${Math.max(0, 100 - (risk.daysUntilStockout * 10))}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
            {risks.length === 0 && (
              <div className="bg-green-50 border border-green-100 p-8 rounded-2xl text-center">
                <CheckCircle className="text-green-600 mx-auto mb-2" size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest text-green-700">No immediate stockout risks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
