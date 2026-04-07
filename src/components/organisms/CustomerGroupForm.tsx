import React, { useState } from "react";
import { Users, Percent, Award, Save, Loader2 } from "lucide-react";
import { customerGroupsService, CustomerGroup } from "../../api/services/customerGroups";
import { toast } from "sonner";

interface CustomerGroupFormProps {
  initialData?: CustomerGroup;
  onSuccess?: () => void;
}

export const CustomerGroupForm: React.FC<CustomerGroupFormProps> = ({ initialData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CustomerGroup>>(initialData || {
    name: "",
    description: "",
    discountPercentage: 0,
    tier: "bronze",
    minSpend: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await customerGroupsService.update(initialData._id, formData);
        toast.success("Group updated");
      } else {
        await customerGroupsService.create(formData);
        toast.success("Group created");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Users className="text-primary w-6 h-6" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter italic">
          {initialData ? "Edit Group" : "New Customer Group"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Group Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-muted border-none px-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
            placeholder="e.g. VIP Retail"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tier Level</label>
          <select
            value={formData.tier}
            onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
            className="w-full bg-muted border-none px-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none appearance-none"
          >
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Discount Percentage (%)</label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="number"
              required
              min="0"
              max="100"
              value={formData.discountPercentage}
              onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) })}
              className="w-full bg-muted border-none pl-10 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min. Lifetime Spend (KD)</label>
          <div className="relative">
            <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="number"
              min="0"
              step="0.001"
              value={formData.minSpend}
              onChange={(e) => setFormData({ ...formData, minSpend: parseFloat(e.target.value) })}
              className="w-full bg-muted border-none pl-10 pr-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-muted border-none px-4 py-3 text-sm font-medium min-h-[80px] outline-none"
          placeholder="Group benefits and criteria..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-4 font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Save Group</>}
      </button>
    </form>
  );
};
