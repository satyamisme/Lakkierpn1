import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Key, 
  Shield, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Save, 
  AlertTriangle,
  Lock,
  Hash,
  Type
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";
import axios from "axios";
import { toast } from "sonner";

export const PasswordPolicy: React.FC = () => {
  const [policy, setPolicy] = useState({
    minLength: 8,
    requireNumbers: true,
    requireSymbols: false,
    expiryDays: 90
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const response = await axios.get("/api/stores/profile"); // Assuming this endpoint returns global profile
      if (response.data && response.data.passwordPolicy) {
        setPolicy(response.data.passwordPolicy);
      }
    } catch (error) {
      console.error("Failed to fetch policy");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("/api/stores/profile", { passwordPolicy: policy });
      toast.success("Password policy updated");
    } catch (error) {
      toast.error("Failed to update policy");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">Synchronizing Security Protocols...</p>
      </div>
    );
  }

  return (
    <Gate id={189}>
      <div className="max-w-4xl mx-auto space-y-16 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Access Policy</h1>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">
              Credential Complexity & Expiry (ID 189)
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-10 py-5 bg-primary text-primary-foreground rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Apply Policy
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Complexity Rules */}
          <div className="bg-surface-container-lowest border border-border rounded-[4rem] p-16 shadow-sm space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-serif italic">Complexity</h3>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Entropy Requirements</p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Minimum Length</label>
                  <span className="text-sm font-black font-mono text-primary">{policy.minLength} Chars</span>
                </div>
                <input 
                  type="range"
                  min="6"
                  max="32"
                  value={policy.minLength}
                  onChange={(e) => setPolicy({...policy, minLength: parseInt(e.target.value)})}
                  className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setPolicy({...policy, requireNumbers: !policy.requireNumbers})}
                  className={`w-full p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${policy.requireNumbers ? 'bg-primary/5 border-primary/30 text-foreground' : 'bg-surface border-border text-muted-foreground'}`}
                >
                  <div className="flex items-center gap-4">
                    <Hash size={20} className={policy.requireNumbers ? 'text-primary' : 'text-muted-foreground'} />
                    <span className="text-xs font-black uppercase tracking-widest">Require Numbers</span>
                  </div>
                  {policy.requireNumbers && <CheckCircle2 size={20} className="text-primary" />}
                </button>

                <button 
                  onClick={() => setPolicy({...policy, requireSymbols: !policy.requireSymbols})}
                  className={`w-full p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${policy.requireSymbols ? 'bg-primary/5 border-primary/30 text-foreground' : 'bg-surface border-border text-muted-foreground'}`}
                >
                  <div className="flex items-center gap-4">
                    <Type size={20} className={policy.requireSymbols ? 'text-primary' : 'text-muted-foreground'} />
                    <span className="text-xs font-black uppercase tracking-widest">Require Symbols</span>
                  </div>
                  {policy.requireSymbols && <CheckCircle2 size={20} className="text-primary" />}
                </button>
              </div>
            </div>
          </div>

          {/* Lifecycle Rules */}
          <div className="bg-surface-container-lowest border border-border rounded-[4rem] p-16 shadow-sm space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                <Clock size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-serif italic">Lifecycle</h3>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Credential Rotation</p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rotation Period</label>
                  <span className="text-sm font-black font-mono text-blue-500">{policy.expiryDays} Days</span>
                </div>
                <input 
                  type="range"
                  min="30"
                  max="365"
                  step="30"
                  value={policy.expiryDays}
                  onChange={(e) => setPolicy({...policy, expiryDays: parseInt(e.target.value)})}
                  className="w-full accent-blue-500 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-blue-500">
                  <AlertTriangle size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Security Advisory</span>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Rotating passwords every 90 days is a standard compliance requirement for PCI-DSS and SOC2. Shorter periods increase security but may impact user productivity.
                </p>
              </div>

              <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-2xl border border-border">
                <Lock size={20} className="text-muted-foreground opacity-40" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Bcrypt Rounds: 10</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Hardware-accelerated hashing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Gate>
  );
};
