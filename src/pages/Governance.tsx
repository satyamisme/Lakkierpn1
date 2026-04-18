import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  History, 
  Zap, 
  Lock, 
  Eye, 
  FileText,
  AlertCircle
} from 'lucide-react';

/**
 * ID 181: Governance & Security
 * Audit trails, PITR, and system integrity.
 */
export const Governance: React.FC = () => {
  const auditLogs = [
    { id: 'LOG-882', user: 'Ahmed (CSH)', action: 'Price Override', reason: 'Customer Loyalty', time: '10:05:12', status: 'verified' },
    { id: 'LOG-881', user: 'Sarah (MGR)', action: 'Void Transaction', reason: 'Error in Entry', time: '09:42:05', status: 'verified' },
    { id: 'LOG-880', user: 'System', action: 'Auto-Backup', reason: 'Scheduled', time: '03:00:00', status: 'verified' },
    { id: 'LOG-879', user: 'Unknown', action: 'Failed Login', reason: 'Invalid PIN', time: '02:15:33', status: 'flagged' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif italic tracking-tight text-white leading-none">Security Matrix</h1>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-2">Governance & Audit (ID 181)</p>
        </div>
        <div className="flex gap-3">
          <div className="p-3 bg-surface-container-highest/20 border border-white/5 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="text-primary-foreground" size={20} />
            <div>
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Master Status</p>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Encrypted-Verified</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-surface-container-low/40 backdrop-blur-xl border border-white/5 rounded-[1.5rem] overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-white/40 flex items-center gap-2">
                <History size={14} className="text-primary-foreground" />
                Master Audit Trail
              </h3>
              <div className="flex gap-1.5">
                <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/20 hover:text-white"><FileText size={12} /></button>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/20 hover:text-white"><Eye size={12} /></button>
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.01] border-b border-white/5">
                    <th className="px-6 py-3 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Event Manifest</th>
                    <th className="px-6 py-3 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Operator Node</th>
                    <th className="px-6 py-3 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Action Vector</th>
                    <th className="px-6 py-3 text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Temporal Point</th>
                    <th className="px-6 py-3 text-center text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group text-white/60">
                      <td className="px-6 py-3 font-mono text-[9px] font-black text-primary-foreground">{log.id}</td>
                      <td className="px-6 py-3 text-[10px] font-black uppercase tracking-tighter text-white/80">{log.user}</td>
                      <td className="px-6 py-3">
                        <div className="text-[10px] font-black uppercase tracking-tight leading-tight">{log.action}</div>
                        <div className="text-[8px] text-white/20 uppercase tracking-widest mt-0.5">{log.reason}</div>
                      </td>
                      <td className="px-6 py-3 font-mono text-[9px] text-white/20">{log.time}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${
                          log.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface-container-low/40 backdrop-blur-xl border border-white/5 p-6 rounded-[1.5rem] shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-white/40">PITR Recovery Matrix (ID 317)</h3>
               <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10">Active Protection</span>
            </div>
            <div className="space-y-6">
              <div className="relative h-8 flex items-center group cursor-pointer">
                <div className="absolute inset-0 h-1 bg-white/5 rounded-full" />
                <div className="absolute left-0 right-1/4 h-1 bg-gradient-to-r from-primary/30 to-primary-foreground rounded-full shadow-[0_0_15px_rgba(var(--primary-foreground-rgb),0.3)]" />
                <div className="absolute left-3/4 w-3 h-3 bg-white border-2 border-[#1a1f24] rounded-full shadow-2xl transform transition-transform group-hover:scale-125 group-active:scale-95" />
              </div>
              <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
                <span>-24H Manifest</span>
                <span>-12H Vector</span>
                <span className="text-primary-foreground font-black">Live Node State</span>
              </div>
              <div className="p-4 bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl flex items-center justify-between group hover:bg-primary-foreground/10 transition-all">
                <div>
                  <p className="text-[8px] font-black text-primary-foreground uppercase tracking-widest ml-0.5">Restore Target Anchor</p>
                  <p className="text-[11px] font-mono font-black text-white/80 mt-1">2026-04-09 03:00:00 (MASTER SNAPSHOT)</p>
                </div>
                <button className="px-5 py-2 bg-primary-foreground/20 text-primary-foreground rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary-foreground hover:text-white transition-all shadow-lg active:scale-95">Preview Restore</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-container-low/40 backdrop-blur-xl border border-white/5 p-5 rounded-[1.5rem] shadow-2xl relative">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-white/40 mb-4">Breaker Grid (ID 319)</h3>
            <div className="space-y-2">
              {[
                { label: 'WA Integration', status: 'closed', icon: <Zap className="w-3.5 h-3.5" /> },
                { label: 'KNET Gateway', status: 'closed', icon: <Zap className="w-3.5 h-3.5" /> },
                { label: 'IMEI Registry', status: 'open', icon: <AlertCircle className="w-3.5 h-3.5" /> },
                { label: 'Edge Sync', status: 'closed', icon: <Zap className="w-3.5 h-3.5" /> },
              ].map((breaker) => (
                <div key={breaker.label} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5 group hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${breaker.status === 'closed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-destructive bg-destructive/10'}`}>
                      {breaker.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-all">{breaker.label}</span>
                  </div>
                  <button className={`px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-widest border transition-all ${
                    breaker.status === 'closed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-destructive/20 text-destructive border-destructive/30'
                  }`}>
                    {breaker.status === 'closed' ? 'Reset' : 'Trip'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1f24] border border-white/5 px-6 py-8 rounded-[1.5rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <Lock size={20} />
              </div>
              <h3 className="text-xl font-serif italic text-white mb-1">Global Kill Switch</h3>
              <p className="text-[8px] font-black uppercase tracking-widest text-destructive/60 mb-8">EMERGENCY SYSTEM LOCKDOWN (ID 334)</p>
              <button className="w-full py-4 bg-gradient-to-br from-destructive to-destructive/80 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(var(--destructive-rgb),0.2)]">
                Execute Protocol
              </button>
            </div>
            <ShieldCheck className="absolute -bottom-6 -right-6 w-24 h-24 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};
