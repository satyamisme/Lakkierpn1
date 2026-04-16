import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  RotateCcw, 
  Package, 
  Search, 
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  ShieldCheck,
  Loader2,
  XCircle
} from 'lucide-react';
import { returnsService, ReturnRequest } from "../api/services/returns";
import { toast } from "sonner";
import { ProcessReturnModal } from "../components/ProcessReturnModal";

/**
 * ID 143: Returns Matrix (Returns.tsx)
 * RMA lifecycle, customer returns, and vendor reconciliation.
 */
export const Returns: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const data = await returnsService.getAll();
      setReturns(data);
    } catch (error) {
      toast.error("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: ReturnRequest["status"]) => {
    try {
      await returnsService.updateStatus(id, status);
      toast.success(`Return ${status}`);
      fetchReturns();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredReturns = returns.filter(r => 
    r.orderId.toLowerCase().includes(query.toLowerCase()) ||
    r.customerId.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-16 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">RMA Matrix</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">
            Reverse Logistics & Warranty Claim Orchestration (ID 143)
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsProcessModalOpen(true)}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <RotateCcw size={18} /> Process Return
          </button>
          <div className="flex items-center gap-6 px-8 py-4 bg-surface-container-lowest border border-border rounded-2xl shadow-sm">
            <div className="text-right">
              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Active Claims</div>
              <div className="text-sm font-black uppercase tracking-tighter">{returns.filter(r => r.status === 'pending').length} Units</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <RotateCcw className="text-primary" size={20} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-border rounded-[4rem] p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
            <div>
              <h3 className="text-4xl font-serif italic">Return Streams</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Live RMA Lifecycle Tracking</p>
            </div>
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search RMA Matrix..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-surface border border-border pl-14 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all w-full md:w-64"
              />
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing RMA Matrix...</p>
              </div>
            ) : filteredReturns.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <RotateCcw size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest">No active return streams</p>
              </div>
            ) : filteredReturns.map((rma) => (
              <motion.div 
                key={rma._id} 
                whileHover={{ x: 10 }}
                className="flex items-center justify-between p-8 bg-surface border border-border rounded-[2.5rem] group hover:border-primary/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-muted border border-border rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:rotate-12 transition-all duration-500 shadow-inner">
                    <Package size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-black uppercase tracking-tighter">RMA-{rma._id.slice(-6).toUpperCase()}</p>
                      <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                        Order #{rma.orderId}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-[10px] text-foreground font-black uppercase tracking-widest">{rma.reason}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                        <Activity size={12} className="text-primary" />
                        {new Date(rma.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                    rma.status === 'approved' ? 'bg-green-500/5 text-green-500 border-green-500/10' : 
                    rma.status === 'pending' ? 'bg-primary/5 text-primary border-primary/10' : 
                    rma.status === 'rejected' ? 'bg-red-500/5 text-red-500 border-red-500/10' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {rma.status}
                  </span>
                  
                  {rma.status === 'pending' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(rma._id, 'rejected')}
                        className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90"
                      >
                        <XCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(rma._id, 'approved')}
                        className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all active:scale-90"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    </div>
                  )}
                  
                  <button className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90 shadow-sm">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-foreground text-background rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-3xl font-serif italic mb-8">Warranty Matrix</h3>
            <div className="space-y-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Approved Claims</p>
                  <p className="text-5xl font-mono font-black">{returns.filter(r => r.status === 'approved').length}</p>
                </div>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="text-primary" size={32} />
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '45%' }}
                  className="h-full bg-primary"
                />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">45% conversion from pending</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-[4rem] p-12 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-lg font-serif italic">Critical Anomalies</h4>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Rejected Claims: {returns.filter(r => r.status === 'rejected').length}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest">Fraud Detection</span>
                <span className="text-[10px] font-black text-green-500">Active</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest">SLA Breach</span>
                <span className="text-[10px] font-black text-red-500">0 Units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ProcessReturnModal 
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        onSuccess={fetchReturns}
      />
    </div>
  );
};

export default Returns;
