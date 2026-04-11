import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Database, 
  RefreshCw, 
  ShieldAlert, 
  ArrowRight,
  Play,
  CheckCircle2
} from 'lucide-react';

/**
 * ID 123: Bulk Operations
 * Mass updates, price changes, and inventory adjustments.
 */
export const BulkOperations: React.FC = () => {
  const tasks = [
    { id: 'BULK-001', label: 'Price Update: iPhone 15 Series', impact: '12 SKUs', status: 'Draft' },
    { id: 'BULK-002', label: 'Inventory Adjustment: Salmiya', impact: '450 Items', status: 'Running' },
    { id: 'BULK-003', label: 'Category Re-assignment', impact: '1,200 Items', status: 'Completed' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-5xl font-serif italic tracking-tight text-foreground">Bulk Operations</h1>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Mass Data Processing & Sync (ID 123)</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest border border-border rounded-[3rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-serif italic">Active Job Queue</h3>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[9px] font-black uppercase tracking-widest">New Bulk Job</button>
            </div>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-6 bg-muted/30 border border-border rounded-3xl group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl border border-border ${
                      task.status === 'Running' ? 'bg-primary/10 text-primary animate-pulse' : 'bg-card text-muted-foreground'
                    }`}>
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">{task.label}</p>
                      <p className="text-[10px] text-muted-foreground font-bold">{task.impact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      task.status === 'Completed' ? 'bg-green-500 text-white' : 
                      task.status === 'Running' ? 'bg-indigo-500 text-white' : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {task.status}
                    </span>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      {task.status === 'Draft' ? <Play size={16} /> : <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest border border-border p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl"><Database size={24} /></div>
                <h4 className="text-lg font-serif italic">Data Importer</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                Upload CSV/Excel files to bulk import inventory, customers, or repair history.
              </p>
              <button className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary transition-all">
                Drop Files Here
              </button>
            </div>
            <div className="bg-surface-container-lowest border border-border p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><RefreshCw size={24} /></div>
                <h4 className="text-lg font-serif italic">Price Sync</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                Synchronize prices across all store nodes and omnichannel platforms instantly.
              </p>
              <button className="w-full py-4 bg-muted border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all">
                Run Global Sync
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-[3rem] shadow-sm">
            <div className="flex items-center gap-3 text-red-600 mb-6">
              <ShieldAlert size={24} />
              <h3 className="text-xl font-serif italic">Safety Controls</h3>
            </div>
            <p className="text-xs text-red-600/80 leading-relaxed mb-8">
              Bulk operations can have significant impact. All jobs require dual-authorization for impact {'>'} 1,000 items.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-red-500/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-red-600">Dry Run Mode</span>
                <div className="w-10 h-5 bg-red-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-900/20">
                Emergency Stop All Jobs
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm">
            <h3 className="text-xl font-serif italic mb-6">System Health</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Queue Latency</span>
                <span className="font-mono font-black text-green-500">0.2ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Worker Nodes</span>
                <span className="font-mono font-black">4 Active</span>
              </div>
              <div className="pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                  <CheckCircle2 size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">All Systems Nominal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
