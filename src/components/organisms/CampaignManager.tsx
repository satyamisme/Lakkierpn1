import React, { useState, useEffect } from "react";
import { Megaphone, Plus, Send, Clock, BarChart3, Loader2 } from "lucide-react";
import { marketingService, Campaign } from "../../api/services/marketing";
import { toast } from "sonner";

export const CampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: "",
    type: "email",
    targetGroup: "all",
    content: "",
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await marketingService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await marketingService.createCampaign(newCampaign);
      toast.success("Campaign created");
      setIsCreating(false);
      fetchCampaigns();
    } catch (error) {
      toast.error("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <Megaphone className="text-primary w-6 h-6" />
          Marketing Campaigns
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
        >
          <Plus size={14} /> New Campaign
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-card border border-border p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Campaign Name"
              className="bg-muted border-none px-4 py-2 rounded outline-none font-bold uppercase tracking-widest text-xs"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              required
            />
            <select
              className="bg-muted border-none px-4 py-2 rounded outline-none font-bold uppercase tracking-widest text-xs"
              value={newCampaign.type}
              onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as any })}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <textarea
            placeholder="Campaign Content..."
            className="w-full bg-muted border-none px-4 py-2 rounded outline-none font-medium text-sm min-h-[100px]"
            value={newCampaign.content}
            onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2 rounded font-black uppercase tracking-widest text-[10px]"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : campaigns.map((c) => (
          <div key={c._id} className="bg-card border border-border p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="bg-muted p-3 rounded-xl">
                {c.type === "email" ? <Plus className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight">{c.name}</h3>
                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  <span className="flex items-center gap-1"><Clock size={10} /> {c.status}</span>
                  <span className="flex items-center gap-1"><BarChart3 size={10} /> {c.stats.delivered} Sent</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest">Open Rate</div>
                <div className="text-sm font-black">{((c.stats.opened / (c.stats.delivered || 1)) * 100).toFixed(1)}%</div>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <Send size={16} className="text-primary" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
