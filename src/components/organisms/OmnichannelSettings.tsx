import React, { useState, useEffect } from "react";
import { Globe, Save, Loader2, RefreshCw, ShoppingBag } from "lucide-react";
import { omnichannelService, SyncSettings } from "../../api/services/omnichannel";
import { toast } from "sonner";

export const OmnichannelSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SyncSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await omnichannelService.getSyncSettings();
      setSettings(data);
    } catch (error) {
      toast.error("Failed to load sync settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await omnichannelService.updateSyncSettings(settings);
      toast.success("Sync settings updated");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 bg-card p-8 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Globe className="text-primary w-6 h-6" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter italic">Omnichannel Sync</h2>
        </div>
        <button
          type="button"
          onClick={fetchSettings}
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Shopify Config */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="text-primary" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest">Shopify Integration</h3>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
            <span className="text-xs font-bold uppercase tracking-widest">Enable Shopify Sync</span>
            <button
              type="button"
              onClick={() => setSettings(s => s ? { ...s, shopifyEnabled: !s.shopifyEnabled } : null)}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings?.shopifyEnabled ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.shopifyEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Store URL</label>
            <input
              type="text"
              className="w-full bg-muted border-none px-4 py-3 text-xs font-bold outline-none rounded-lg"
              value={settings?.shopifyStoreUrl || ""}
              onChange={(e) => setSettings(s => s ? { ...s, shopifyStoreUrl: e.target.value } : null)}
              placeholder="your-store.myshopify.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Token</label>
            <input
              type="password"
              className="w-full bg-muted border-none px-4 py-3 text-xs font-bold outline-none rounded-lg"
              value={settings?.shopifyAccessToken || ""}
              onChange={(e) => setSettings(s => s ? { ...s, shopifyAccessToken: e.target.value } : null)}
              placeholder="shpat_xxxxxxxxxxxxxxxx"
            />
          </div>
        </div>

        {/* Global Rules */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="text-primary" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest">Sync Rules</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Sync Inventory Levels", key: "syncInventory" },
              { label: "Import Online Orders", key: "syncOrders" },
            ].map((rule) => (
              <div key={rule.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                <span className="text-xs font-bold uppercase tracking-widest">{rule.label}</span>
                <button
                  type="button"
                  onClick={() => setSettings(s => s ? { ...s, [rule.key]: !s[rule.key as keyof SyncSettings] } : null)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings?.[rule.key as keyof SyncSettings] ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.[rule.key as keyof SyncSettings] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
        Save Integration Config
      </button>
    </form>
  );
};
