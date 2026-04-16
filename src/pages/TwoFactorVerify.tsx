import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

export const TwoFactorVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/2fa/verify", {
        userId,
        token
      });

      login(response.data.user, response.data.token);
      toast.success("Identity Verified");
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid 2FA code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-6">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Two-Factor Auth</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Identity Verification Required</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 text-[10px] font-black uppercase tracking-widest"
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Verification Code</label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-center text-4xl font-black tracking-[0.5em] text-white placeholder:text-gray-800 focus:ring-4 ring-indigo-500/20 outline-none transition-all"
                placeholder="000000"
              />
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest text-center">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || token.length !== 6}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-4"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Verify Identity"
              )}
            </button>
          </form>

          <button 
            onClick={() => navigate("/login")}
            className="mt-10 w-full flex items-center justify-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};
