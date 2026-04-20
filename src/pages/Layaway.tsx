import React from "react";
import { Package, Loader2 } from "lucide-react";
import axios from "axios";

export const Layaway: React.FC = () => {
  const [plans, setPlans] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get('/api/layaway');
        setPlans(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Layaway Matrix</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">Installment lifecycle & deposit registry (ID 135)</p>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-surface-container border border-border p-20 rounded-[3rem] text-center">
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40 italic">No active installment plans found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-surface-container-lowest border border-border p-8 rounded-[2.5rem] shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-muted rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  plan.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'
                }`}>
                  {plan.status}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">{plan.customerName || 'Anonymous Client'}</h3>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Plan: {plan.planId}</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-muted-foreground opacity-60">Remaining</span>
                  <span className="font-mono text-primary">{(plan.totalAmount - plan.paidAmount).toFixed(3)} KD</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(plan.paidAmount / plan.totalAmount) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
