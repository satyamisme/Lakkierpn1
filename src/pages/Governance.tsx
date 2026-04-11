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
    <div className="space-y-8">
      <header>
        <h1 className="text-5xl font-serif italic tracking-tight text-foreground">Governance & Security</h1>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">System Integrity & Audit Trails (ID 181)</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest border border-border rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="text-xl font-serif italic">Master Audit Trail</h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors"><FileText className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors"><History className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Event ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Operator</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Action</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Time</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-4 font-mono text-[10px] font-bold">{log.id}</td>
                      <td className="px-6 py-4 text-xs font-black uppercase tracking-tighter">{log.user}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold">{log.action}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{log.reason}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px]">{log.time}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          log.status === 'verified' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
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

          <div className="bg-surface-container-lowest border border-border p-8 rounded-[2rem] shadow-sm">
            <h3 className="text-xl font-serif italic mb-6">PITR Recovery Slider (ID 317)</h3>
            <div className="space-y-8">
              <div className="relative h-12 flex items-center">
                <div className="absolute inset-0 h-1 bg-muted rounded-full" />
                <div className="absolute left-0 right-1/4 h-1 bg-primary rounded-full" />
                <div className="absolute left-3/4 w-4 h-4 bg-primary border-4 border-background rounded-full shadow-lg cursor-pointer" />
              </div>
              <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>24h Ago</span>
                <span>12h Ago</span>
                <span className="text-primary">Current State</span>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Selected Point</p>
                  <p className="text-sm font-mono font-bold">2026-04-09 03:00:00 (Daily Snapshot)</p>
                </div>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Preview Restore</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-border p-6 rounded-[2rem] shadow-sm">
            <h3 className="text-xl font-serif italic mb-6">Circuit Breakers (ID 319)</h3>
            <div className="space-y-4">
              {[
                { label: 'WhatsApp API', status: 'closed', icon: <Zap className="w-4 h-4" /> },
                { label: 'KNET Gateway', status: 'closed', icon: <Zap className="w-4 h-4" /> },
                { label: 'GSMA IMEI Check', status: 'open', icon: <AlertCircle className="w-4 h-4" /> },
                { label: 'Cloud Sync', status: 'closed', icon: <Zap className="w-4 h-4" /> },
              ].map((breaker) => (
                <div key={breaker.label} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${breaker.status === 'closed' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                      {breaker.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{breaker.label}</span>
                  </div>
                  <button className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                    breaker.status === 'closed' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                  }`}>
                    {breaker.status === 'closed' ? 'Reset' : 'Trip'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-foreground text-background p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <Lock className="w-12 h-12 mb-6 opacity-20" />
              <h3 className="text-2xl font-serif italic mb-2">Global API Kill Switch</h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-8">Emergency System Lockdown (ID 334)</p>
              <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-900/20">
                Execute Lockdown
              </button>
            </div>
            <ShieldCheck className="absolute -bottom-4 -right-4 w-32 h-32 opacity-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
