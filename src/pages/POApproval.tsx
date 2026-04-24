import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  UserCheck,
  ShieldCheck,
  Layers,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface PurchaseOrder {
  _id: string;
  supplierId: {
    _id: string;
    name: string;
  };
  totalLanded: number;
  status: 'draft' | 'pending_approval' | 'sent' | 'received' | 'rejected' | 'cancelled';
  createdAt: string;
  items: any[];
}

const APPROVAL_THRESHOLD = 5000; // KD

export const POApproval: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/inventory/po');
      setPos(res.data);
    } catch (error) {
      toast.error("Failed to fetch purchase orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const po = pos.find(p => p._id === id);
      if (!po) return;

      // In this simplified logic, we just move to 'sent'
      await axios.patch(`/api/inventory/po/${id}/status`, { status: 'sent' });
      toast.success("PO Approved and sent to supplier.");
      fetchPOs();
    } catch (error) {
      toast.error("Failed to approve PO");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.patch(`/api/inventory/po/${id}/status`, { status: 'rejected' });
      toast.error("Purchase Order Rejected.");
      fetchPOs();
    } catch (error) {
      toast.error("Failed to reject PO");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-6xl font-serif italic tracking-tighter leading-none">PO Approval Matrix</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Multi-Step Authorization Workflow (ID 127)</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-3">
            <ShieldCheck size={16} /> Threshold: {APPROVAL_THRESHOLD} KD
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest border border-border rounded-[3rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-border bg-surface-container-lowest/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ClipboardCheck className="text-primary" size={24} />
                <h2 className="text-xl font-black uppercase tracking-tighter">Pending Authorizations</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={14} />
                  <input 
                    placeholder="Filter POs..."
                    className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-border">
              {isLoading ? (
                <div className="p-20 flex flex-col items-center justify-center opacity-20">
                  <Loader2 size={48} className="animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing PO Ledger...</p>
                </div>
              ) : pos.filter(po => po.status === 'pending_approval').length === 0 ? (
                <div className="p-20 text-center opacity-20">
                  <ClipboardCheck size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No pending authorizations</p>
                </div>
              ) : pos.filter(po => po.status === 'pending_approval').map((po) => (
                <motion.div 
                  layout
                  key={po._id} 
                  className="p-8 hover:bg-surface transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                        po.totalLanded > APPROVAL_THRESHOLD ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        <FileText size={24} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-black uppercase tracking-tighter">{po._id.slice(-8).toUpperCase()}</h3>
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                            po.totalLanded > APPROVAL_THRESHOLD ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {po.totalLanded > APPROVAL_THRESHOLD ? 'Manager Approval Required' : 'Staff Review'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-muted-foreground">{po.supplierId?.name || 'Unknown Supplier'}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={12} /> {new Date(po.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1">
                            <Layers size={12} /> {po.items.length} Items
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-4">
                      <div className="text-2xl font-black font-mono text-primary">{po.totalLanded.toFixed(2)} KD</div>
                      <div className="flex items-center gap-2 justify-end">
                        <button 
                          onClick={() => handleReject(po._id)}
                          className="p-3 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-xl transition-all"
                        >
                          <XCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleApprove(po._id)}
                          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                          {po.totalLanded > APPROVAL_THRESHOLD ? <UserCheck size={16} /> : <CheckCircle2 size={16} />}
                          {po.totalLanded > APPROVAL_THRESHOLD ? 'Authorize' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-lowest border border-border rounded-[3rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6 opacity-40">Approval Logic</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">1</div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest">Staff Review</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">Initial verification of items and quantities.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">2</div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest">Manager Override</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">Required for orders exceeding {APPROVAL_THRESHOLD} KD.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">3</div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest">Supplier Dispatch</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1">PO is finalized and transmitted via EDI/WhatsApp.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-[3rem] p-8">
            <div className="flex items-center gap-4 mb-4">
              <AlertTriangle className="text-primary" size={20} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">System Alert</h4>
            </div>
            <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
              2 Purchase Orders are currently flagged for high-value authorization. Delay in approval may impact lead times for Node-01.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
