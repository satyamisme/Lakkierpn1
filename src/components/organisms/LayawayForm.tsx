import React, { useState } from "react";
import { History, DollarSign, User, Loader2, Calendar } from "lucide-react";
import { layawayService } from "../../api/services/layaway";
import { toast } from "sonner";

interface LayawayFormProps {
  orderId: string;
  totalAmount: number;
  customerId: string;
  onSuccess?: () => void;
}

export const LayawayForm: React.FC<LayawayFormProps> = ({ orderId, totalAmount, customerId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    depositAmount: 0,
    installmentCount: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await layawayService.create({
        orderId,
        customerId,
        totalAmount,
        ...formData,
      });
      toast.success("Layaway plan created");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to create layaway plan");
    } finally {
      setLoading(false);
    }
  };

  const remaining = totalAmount - formData.depositAmount;
  const perInstallment = remaining / formData.installmentCount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <History className="text-primary w-6 h-6" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter italic">Setup Layaway</h2>
      </div>

      <div className="p-4 bg-muted/30 border border-border space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span>Order Total</span>
          <span className="font-mono">{totalAmount.toFixed(3)} KD</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deposit Amount (KD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="number"
              required
              min="0"
              max={totalAmount}
              step="0.001"
              value={formData.depositAmount}
              onChange={(e) => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) })}
              className="w-full bg-muted border-none pl-10 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Installments</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <select
              value={formData.installmentCount}
              onChange={(e) => setFormData({ ...formData, installmentCount: parseInt(e.target.value) })}
              className="w-full bg-muted border-none pl-10 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none appearance-none"
            >
              {[2, 3, 4, 5, 6, 12].map(n => (
                <option key={n} value={n}>{n} Months</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/10 space-y-2 rounded-xl">
        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-primary">
          <span>Remaining Balance</span>
          <span className="font-mono">{remaining.toFixed(3)} KD</span>
        </div>
        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-primary">
          <span>Per Installment</span>
          <span className="font-mono">{perInstallment.toFixed(3)} KD</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || formData.depositAmount === 0}
        className="w-full bg-primary text-primary-foreground py-4 font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Layaway Plan"}
      </button>
    </form>
  );
};
