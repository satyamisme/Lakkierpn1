import React, { useState } from 'react';
import { LogIn, MapPin, ShieldAlert, Loader2, Smartphone, Lock, Globe, Zap } from 'lucide-react';
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
        toast.info("2FA required. Please verify.");
        navigate(`/2fa-verify?userId=${data.userId}`);
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
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full bg-white/5 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-white/10">
            <Zap className="w-10 h-10 text-black fill-black" />
          </div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-3 leading-none">
            LAKKI<br />
            <span className="text-blue-500">TERMINAL</span>
          </h1>
          <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[9px]">
            Enterprise OS v2.6 • Obsidian Shell
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Operator Identity</label>
            <div className="relative group">
              <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                required
                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-sm text-white placeholder:text-white/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@lakkiphone.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="password"
                required
                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-sm text-white placeholder:text-white/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest">
                <MapPin className="w-3 h-3" />
                Node Verification
              </div>
              <div className="px-2 py-0.5 bg-blue-500/20 text-blue-500 text-[8px] font-black rounded-full uppercase tracking-widest">
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
                  className="flex items-center gap-3 text-xs font-bold text-white/40"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  Pinging GPS Satellites...
                </motion.div>
              ) : geoError ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 text-xs font-bold text-red-500"
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
                  className="text-xs font-bold text-green-500 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  Node Locked: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-2xl flex items-center gap-4"
            >
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || geoLoading}
            className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-2xl shadow-white/10"
          >
            {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Authorize & Enter
                <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-between text-[8px] font-black text-white/20 uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Forgot Key?</span>
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Support</span>
          </div>
          <span className="text-green-500/40">System Status: Optimal</span>
        </div>
      </motion.div>
    </div>
  );
};
