import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  User, 
  Search,
  Loader2,
  ChevronRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export const QualityControlHistory: React.FC = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/quality-control');
      setInspections(response.data);
    } catch (error) {
      toast.error("Failed to fetch QC history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = inspections.filter(i => 
    i.referenceId.toLowerCase().includes(query.toLowerCase()) ||
    i.inspectorId?.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search by Reference ID or Inspector..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface border border-border pl-12 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center opacity-40">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing QC History...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center opacity-40">
            <ShieldCheck size={64} className="mx-auto mb-6" />
            <p className="text-sm font-black uppercase tracking-widest">No inspection records found</p>
          </div>
        ) : filtered.map((inspection) => (
          <motion.div 
            key={inspection._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-container-lowest border border-border p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm"
          >
            <div className="flex items-center gap-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                inspection.status === 'passed' ? 'bg-green-500/5 text-green-500 border-green-500/10' : 'bg-red-500/5 text-red-500 border-red-500/10'
              }`}>
                {inspection.status === 'passed' ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-sm font-black uppercase tracking-tighter">{inspection.referenceId}</h4>
                  <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{inspection.type}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                    <User size={12} className="text-primary" />
                    {inspection.inspectorId?.name || 'Unknown'}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                    <Clock size={12} className="text-primary" />
                    {new Date(inspection.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-1">Checks Passed</p>
                <p className="text-lg font-mono font-black">
                  {inspection.checks.filter((c: any) => c.passed).length} / {inspection.checks.length}
                </p>
              </div>
              <button className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90 shadow-sm">
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
