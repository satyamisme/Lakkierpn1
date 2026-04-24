import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRightLeft, 
  Banknote, 
  StickyNote, 
  Camera, 
  History, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { Gate } from '../components/PermissionGuard';

interface User {
  _id: string;
  name: string;
  role: string;
}

export const ShiftHandover: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [toUserId, setToUserId] = useState("");
  const [cashInDrawer, setCashInDrawer] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setUsers(await response.json());
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId || !cashInDrawer) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/shift/handover', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          toUserId,
          cashInDrawer: parseFloat(cashInDrawer),
          notes
        }),
      });

      if (response.ok) {
        setStatus("Handover logged successfully!");
        setToUserId("");
        setCashInDrawer("");
        setNotes("");
      } else {
        setStatus("Failed to log handover.");
      }
    } catch (error) {
      setStatus("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Gate id={226}>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Shift Handover</h1>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">End of Shift Reconciliation (ID 226)</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <UserPlus size={12} /> Incoming Manager
              </label>
              <select 
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                className="w-full bg-muted border-none p-4 text-xs font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
                required
              >
                <option value="">Select Staff...</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Banknote size={12} /> Cash in Drawer (KD)
              </label>
              <input 
                type="number" 
                step="0.001"
                value={cashInDrawer}
                onChange={(e) => setCashInDrawer(e.target.value)}
                className="w-full bg-muted border-none p-4 text-xs font-bold font-mono focus:ring-2 ring-primary/20 outline-none"
                placeholder="0.000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <StickyNote size={12} /> Handover Notes
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-muted border-none p-4 text-xs font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none min-h-[120px]"
              placeholder="e.g. Pending repairs, cash discrepancies, stock alerts..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Camera size={12} /> Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-border p-8 text-center rounded-xl hover:border-primary/50 transition-colors cursor-pointer">
              <Camera className="mx-auto mb-2 text-muted-foreground" size={24} />
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Click to upload drawer photo</p>
            </div>
          </div>

          {status && (
            <div className={`p-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${status.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {status.includes('success') ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {status}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-4 font-black text-sm uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <ArrowRightLeft size={18} />
                Complete Handover
              </>
            )}
          </button>
        </form>

        <div className="bg-card border border-border p-8 shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-tighter italic mb-6 flex items-center gap-2">
            <History size={20} className="text-primary" />
            Recent Handovers
          </h3>
          <div className="space-y-4">
            {users.length === 0 ? (
               <p className="text-[10px] font-black uppercase tracking-widest text-center py-8 opacity-50">No history available</p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                {/* We'll use a local state for history too */}
                <HandoverList />
              </div>
            )}
          </div>
        </div>
      </div>
    </Gate>
  );
};

const HandoverList = () => {
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/shift/history', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json()).then(setHistory).catch(console.error);
  }, []);

  return (
    <div className="space-y-3">
      {history.map((h: any) => (
        <div key={h._id} className="p-4 bg-muted/40 rounded-xl border border-border/50">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
               <ArrowRightLeft size={12} className="text-primary" />
               <p className="text-[10px] font-black uppercase tracking-tighter">
                 {h.fromUserId?.name} → {h.toUserId?.name}
               </p>
            </div>
            <span className="text-[9px] font-mono opacity-40">{new Date(h.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center px-2 py-1 bg-background/50 rounded-lg">
             <span className="text-[9px] font-black uppercase text-muted-foreground">Drawer</span>
             <span className="text-[10px] font-black font-mono">{(h.cashInDrawer || 0).toFixed(3)} KD</span>
          </div>
          {h.notes && <p className="text-[9px] mt-2 italic opacity-60">"{h.notes}"</p>}
        </div>
      ))}
    </div>
  );
}
