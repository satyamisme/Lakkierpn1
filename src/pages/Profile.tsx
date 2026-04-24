import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Shield, 
  Key, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Loader2, 
  QrCode, 
  AlertCircle,
  Lock,
  History,
  MapPin,
  Globe
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    if (user) {
      fetchSecurityLogs();
      setFormData({
        name: user.name,
        email: user.email,
        password: ""
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put("/api/users/profile", formData);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      window.location.reload(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityLogs = async () => {
    try {
      const response = await axios.get("/api/auth/security-logs");
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch security logs", error);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/2fa/setup", { userId: user.id });
      setQrCodeUrl(response.data.qrCodeUrl);
      setIsSettingUp2FA(true);
    } catch (error) {
      toast.error("Failed to initialize 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    try {
      await axios.post("/api/auth/2fa/verify", { 
        userId: user.id, 
        token: twoFactorToken 
      });
      toast.success("2FA Enabled Successfully");
      setIsSettingUp2FA(false);
      setQrCodeUrl(null);
      setTwoFactorToken("");
      // Refresh user data in context
      window.location.reload(); 
    } catch (error) {
      toast.error("Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable 2FA? This will reduce your account security.")) return;
    setLoading(true);
    try {
      await axios.post("/api/auth/2fa/disable", { userId: user.id });
      toast.success("2FA Disabled");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Operator Profile</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">System Identity & Security Matrix</p>
        </div>
        <button 
          onClick={logout}
          className="px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          Terminate Session
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Identity Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-surface-container-lowest border border-border rounded-[3.5rem] p-12 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-10">
              <div className="w-24 h-24 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <User size={48} />
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="p-4 rounded-2xl bg-surface border border-border hover:border-primary transition-all text-muted-foreground hover:text-primary"
              >
                <Key size={20} />
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Full Name</label>
                  <input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-surface border border-border rounded-xl p-4 text-xs font-bold outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Email</label>
                  <input 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-surface border border-border rounded-xl p-4 text-xs font-bold outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">New Password (Optional)</label>
                  <input 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-surface border border-border rounded-xl p-4 text-xs font-bold outline-none focus:border-primary transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </button>
              </form>
            ) : (
              <>
                <h2 className="text-4xl font-serif italic mb-2">{user?.name}</h2>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-10 opacity-60">{user?.email}</p>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Role</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{user?.role}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Permissions</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{user?.permissions?.length || 0} Active</span>
                  </div>
                </div>
              </>
            )}

            <div className="mt-12 pt-10 border-t border-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Online</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground opacity-40">UID: {user?.id?.slice(-8).toUpperCase()}</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-[3rem] p-10 shadow-sm">
            <h3 className="text-xl font-serif italic mb-8 flex items-center gap-3">
              <History size={20} className="text-primary" />
              Security Logs
            </h3>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{log.action}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      {new Date(log.createdAt).toLocaleString()} • {log.ipAddress}
                    </p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">No recent activity</p>}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface-container-lowest border border-border rounded-[4rem] p-16 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-serif italic mb-2">Security Matrix</h2>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Multi-Factor Authentication & Access Control</p>
              </div>
              <Shield size={48} className="text-primary opacity-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="p-10 bg-muted/30 border border-border rounded-[3rem] space-y-8 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                    <Smartphone size={28} />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${user?.isTwoFactorEnabled ? 'text-green-500 border-green-500/20 bg-green-500/10' : 'text-red-500 border-red-500/20 bg-red-500/10'}`}>
                    {user?.isTwoFactorEnabled ? 'Active' : 'Disabled'}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-serif italic mb-2">2FA Protection</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Add an extra layer of security to your account by requiring a verification code from your mobile device.
                  </p>
                </div>
                {user?.isTwoFactorEnabled ? (
                  <button 
                    onClick={handleDisable2FA}
                    disabled={loading}
                    className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    Disable Protection
                  </button>
                ) : (
                  <button 
                    onClick={handleSetup2FA}
                    disabled={loading}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                  >
                    Initialize Setup
                  </button>
                )}
              </div>

              <div className="p-10 bg-muted/30 border border-border rounded-[3rem] space-y-8 relative overflow-hidden group">
                <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                  <Lock size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-serif italic mb-2">Access Key</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Your system password is encrypted with AES-256. We recommend updating it every 90 days for optimal security.
                  </p>
                </div>
                <button className="w-full py-4 bg-surface border border-border text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all">
                  Rotate Access Key
                </button>
              </div>
            </div>

            {/* 2FA Setup Modal Overlay */}
            <AnimatePresence>
              {isSettingUp2FA && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/95 backdrop-blur-xl flex items-center justify-center p-12 z-20"
                >
                  <div className="max-w-md w-full text-center space-y-10">
                    <div className="flex justify-between items-center">
                      <h3 className="text-3xl font-serif italic">2FA Configuration</h3>
                      <button onClick={() => setIsSettingUp2FA(false)} className="p-2 hover:bg-muted rounded-full transition-all"><X size={24} /></button>
                    </div>

                    {qrCodeUrl ? (
                      <div className="space-y-8">
                        <div className="bg-white p-6 rounded-[2.5rem] inline-block shadow-2xl">
                          <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
                          Scan this code with Google Authenticator or Authy, then enter the 6-digit verification code below.
                        </p>
                        <div className="space-y-4">
                          <input 
                            type="text"
                            maxLength={6}
                            value={twoFactorToken}
                            onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ""))}
                            className="w-full bg-muted border border-border rounded-2xl py-5 text-center text-3xl font-black tracking-[0.5em] outline-none focus:ring-4 ring-primary/10 transition-all"
                            placeholder="000000"
                          />
                          <button 
                            onClick={handleVerify2FA}
                            disabled={loading || twoFactorToken.length !== 6}
                            className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-105 transition-all disabled:opacity-50"
                          >
                            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                            Verify & Enable
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-[3rem] p-12 shadow-sm">
            <h3 className="text-2xl font-serif italic mb-8 flex items-center gap-4">
              <MapPin size={24} className="text-primary" />
              Node Authorization
            </h3>
            <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] flex items-center gap-8">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <Globe size={32} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest mb-1">Geofencing Active</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Your account is restricted to authorized store locations. Login attempts outside the designated geofence will be blocked and logged.
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">Current Status</p>
                <p className="text-sm font-black uppercase tracking-tighter text-blue-500">Authorized</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
