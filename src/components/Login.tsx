import React, { useState } from 'react';
import { LogIn, MapPin, ShieldAlert, Loader2, Smartphone, Lock, Globe } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, latitude, longitude })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Authentication failed');
      }

      const data = await response.json();
      
      if (data.requires2FA) {
        // Handle 2FA if needed, but for now let's assume simple login works
        toast.info("2FA required. Please verify.");
        return;
      }

      login(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,var(--color-primary)_1px,transparent_0)] bg-[size:40px_40px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface-container-lowest p-10 rounded-[2.5rem] shadow-2xl border border-border relative z-10"
      >
        <div className="text-center mb-10">
          <div className="bg-primary/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter mb-2">
            Lakki <span className="text-primary">Terminal</span>
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px]">
            Enterprise OS v4.0 • Secure Access
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Operator ID / Email</label>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-surface-container border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@lakkiphone.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-surface-container border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="bg-surface-container p-5 rounded-2xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                <MapPin className="w-3 h-3" />
                Node Verification
              </div>
              <div className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded-full uppercase tracking-widest">
                Required
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {geoLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs font-bold text-muted-foreground"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Pinging GPS Satellites...
                </motion.div>
              ) : geoError ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs font-bold text-destructive"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Location Gated: {geoError}
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-bold text-secondary flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  Node Locked: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-2xl flex items-center gap-3"
            >
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || geoLoading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-[0.98]"
          >
            {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Authorize & Enter Terminal
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-border flex items-center justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="hover:text-primary cursor-pointer transition-colors">Forgot Key?</span>
            <span className="opacity-30">|</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Support</span>
          </div>
          <span>System Status: Optimal</span>
        </div>
      </motion.div>
    </div>
  );
};
