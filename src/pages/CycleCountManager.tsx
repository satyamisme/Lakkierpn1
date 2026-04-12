import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export const CycleCountManager: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get('/api/inventory/cycle-count/pending'); // Need to add this route
      setSessions(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewDiscrepancy = async (sessionId: string) => {
    try {
      const res = await axios.get(`/api/inventory/cycle-count/discrepancy/${sessionId}`);
      setSelectedSession(res.data);
    } catch (error) {
      toast.error("Failed to fetch discrepancies");
    }
  };

  const resolveSession = async (resolutions: any[]) => {
    if (!selectedSession) return;
    setIsResolving(true);
    try {
      await axios.post('/api/inventory/cycle-count/resolve', {
        sessionId: selectedSession.sessionId,
        resolutions
      });
      toast.success("Inventory adjusted successfully");
      setSelectedSession(null);
      fetchSessions();
    } catch (error) {
      toast.error("Resolution failed");
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Inventory Reconciliation</h1>
        <button onClick={fetchSessions} className="p-2 hover:bg-muted rounded-full transition-colors">
          <RefreshCw size={20} />
        </button>
      </div>

      {!selectedSession ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => (
            <motion.div 
              key={session._id}
              whileHover={{ y: -5 }}
              className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest rounded-full">Pending Review</span>
                <p className="text-[10px] font-mono opacity-50">{session.sessionId}</p>
              </div>
              <div>
                <p className="text-sm font-bold">Staff: {session.createdBy?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{new Date(session.submittedAt).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => viewDiscrepancy(session.sessionId)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-[10px]"
              >
                Review Discrepancies
              </button>
            </motion.div>
          ))}
          {sessions.length === 0 && (
            <div className="col-span-full p-20 text-center border-2 border-dashed border-border rounded-[3rem]">
              <p className="text-muted-foreground">No pending cycle counts to review.</p>
            </div>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between bg-card p-6 border border-border rounded-3xl">
            <div>
              <button onClick={() => setSelectedSession(null)} className="text-xs font-bold text-primary hover:underline mb-2 block">← Back to list</button>
              <h2 className="text-xl font-black uppercase tracking-tight">Reviewing: {selectedSession.sessionId}</h2>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => resolveSession(selectedSession.discrepancies.map((d: any) => ({ productId: d.productId, action: 'accept' })))}
                disabled={isResolving}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2"
              >
                {isResolving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                Accept All Changes
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {selectedSession.discrepancies.map((disc: any) => (
              <div key={disc.productId} className="p-6 bg-card border border-border rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className="font-bold">{disc.sku}</p>
                    <p className="text-[10px] text-muted-foreground">Product ID: {disc.productId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Expected</p>
                    <p className="text-xl font-bold">{disc.expectedQty}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Actual</p>
                    <p className="text-xl font-bold text-red-500">{disc.actualQty}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Diff</p>
                    <p className="text-xl font-bold">{disc.actualQty - disc.expectedQty}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
