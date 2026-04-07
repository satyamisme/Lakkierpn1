import React, { useState } from "react";
import { Gift, Calendar, DollarSign, User, Loader2 } from "lucide-react";
import { giftCardsService } from "../../api/services/giftCards";
import { toast } from "sonner";

interface GiftCardFormProps {
  onSuccess?: () => void;
}

export const GiftCardForm: React.FC<GiftCardFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    initialAmount: 0,
    expiryDate: "",
    customerId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await giftCardsService.create(formData);
      toast.success("Gift card created successfully");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to create gift card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Gift className="text-primary w-6 h-6" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter italic">Issue Gift Card</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Card Code</label>
          <div className="relative">
            <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full bg-muted border-none pl-10 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
              placeholder="GIFT-XXXX-XXXX"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initial Amount (KD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="number"
              required
              min="0"
              step="0.001"
              value={formData.initialAmount}
              onChange={(e) => setFormData({ ...formData, initialAmount: parseFloat(e.target.value) })}
              className="w-full bg-muted border-none pl-10 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
              placeholder="0.000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expiry Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full bg-muted border-none pl-10 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer ID (Optional)</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full bg-muted border-none pl-10 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
              placeholder="CUST-XXXX"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-4 font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Gift Card"}
      </button>
    </form>
  );
};
