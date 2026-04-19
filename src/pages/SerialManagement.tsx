import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Loader2,
  Trash2,
  Edit2,
  Smartphone,
  Layers,
  Calendar,
  AlertTriangle,
  History,
  CheckCircle2,
  X,
  Filter,
  Save,
  Tag
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";
import { toast } from "sonner";
import axios from 'axios';
import { format } from 'date-fns';

export const SerialManagement: React.FC = () => {
  const [serials, setSerials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSerial, setEditingSerial] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSerials();
  }, []);

  const fetchSerials = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (filterType !== 'all') params.type = filterType;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      
      const res = await axios.get('/api/imei', { params });
      setSerials(res.data);
    } catch (error) {
      toast.error("Failed to load identification registry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to decommission this identifier vector? This action is cryptographically permanent (soft-delete).")) return;
    
    try {
      await axios.delete(`/api/imei/${id}`);
      toast.success("Identifier decommissioned.");
      fetchSerials();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Decommissioning failed.");
    }
  };

  const handleEdit = (serial: any) => {
    setEditingSerial({ ...serial });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingSerial) return;
    setIsSaving(true);
    try {
      await axios.put(`/api/imei/${editingSerial._id}`, editingSerial);
      toast.success("Telemetry updated.");
      setIsEditModalOpen(false);
      fetchSerials();
    } catch (error) {
      toast.error("Update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'sold': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'defective': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'under_repair': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  return (
    <div className="space-y-16 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Serial Matrix</h1>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">Global tracking & authenticity registry (ID 192)</p>
        </div>
        
        <div className="flex gap-4">
           <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={14} />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-6 py-3 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="imei">IMEI Only</option>
                <option value="serial">Serial Only</option>
              </select>
           </div>
           <div className="relative group">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-6 py-3 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="sold">Sold</option>
                <option value="defective">Defective</option>
                <option value="under_repair">Repair</option>
              </select>
           </div>
           <button 
            onClick={fetchSerials}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
           >
             Sync Database
           </button>
        </div>
      </header>

      <div className="bg-surface-container-lowest border border-border rounded-[4rem] shadow-sm overflow-hidden min-h-[60vh]">
        <div className="p-10 border-b border-border bg-surface-container-lowest/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="relative w-full md:w-[600px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={20} />
            <input 
              type="text" 
              placeholder="Search by Identifier, Variant SKU, or Model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSerials()}
              className="w-full bg-surface border border-border pl-16 pr-8 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner placeholder:opacity-30"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Matrix Count</p>
              <p className="text-xl font-black font-mono">{serials.length}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-border">
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Identifier Vector</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Product / Variant</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Status</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Warranty Expiry</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-40 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-20" />
                  </td>
                </tr>
              ) : serials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-40 text-center text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-30 italic">
                    Registry is empty for current filter mask
                  </td>
                </tr>
              ) : (
                serials.map((s) => (
                  <tr key={s._id} className="hover:bg-surface transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-border shadow-inner ${s.type === 'imei' ? 'bg-primary/5 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {s.type === 'imei' ? <Smartphone size={18} /> : <Layers size={18} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-black tracking-tight group-hover:text-primary transition-colors">{s.identifier}</span>
                          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{s.type.toUpperCase()} VECTOR</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-tighter truncate max-w-[200px]">{s.productId?.name || 'Unknown Product'}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag size={10} className="text-primary opacity-40" />
                          <span className="text-[9px] font-mono font-bold text-muted-foreground">{s.variantId?.sku || 'GENERIC'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(s.status)}`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                         <Calendar size={14} className="text-muted-foreground opacity-30" />
                         <span className="text-[10px] font-bold text-muted-foreground">
                           {s.warrantyExpiry ? format(new Date(s.warrantyExpiry), 'MMM dd, yyyy') : 'N/A'}
                         </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => handleEdit(s)}
                           className="p-3 bg-surface border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary transition-all active:scale-90"
                         >
                           <Edit2 size={16} />
                         </button>
                         <Gate id={122}>
                            <button 
                              onClick={() => handleDelete(s._id)}
                              disabled={s.status !== 'in_stock'}
                              className="p-3 bg-surface border border-border rounded-xl text-muted-foreground hover:text-red-500 hover:border-red-500 transition-all active:scale-90 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none"
                            >
                              <Trash2 size={16} />
                            </button>
                         </Gate>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-lg overflow-hidden"
            >
              <div className="p-12 relative z-10 space-y-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                      <History className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter text-white uppercase leading-none">Modify Vector</h2>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Adjust identity & state telemetry</p>
                    </div>
                  </div>
                  <button onClick={() => !isSaving && setIsEditModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40"><X size={24} /></button>
                </div>

                <div className="space-y-6">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Identifier String</label>
                      <input 
                        value={editingSerial?.identifier || ""}
                        onChange={(e) => setEditingSerial({ ...editingSerial, identifier: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all font-mono"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Vector Type</label>
                        <select 
                          value={editingSerial?.type || "serial"}
                          onChange={(e) => setEditingSerial({ ...editingSerial, type: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all appearance-none"
                        >
                          <option value="imei" className="bg-[#0A0A0A]">IMEI (15-DIGIT)</option>
                          <option value="serial" className="bg-[#0A0A0A]">SERIAL NUMBER</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">State Assignment</label>
                        <select 
                          value={editingSerial?.status || "in_stock"}
                          onChange={(e) => setEditingSerial({ ...editingSerial, status: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all appearance-none"
                        >
                          <option value="in_stock" className="bg-[#0A0A0A]">IN STOCK</option>
                          <option value="sold" className="bg-[#0A0A0A]">SOLD</option>
                          <option value="defective" className="bg-[#0A0A0A]">DEFECTIVE</option>
                          <option value="under_repair" className="bg-[#0A0A0A]">UNDER REPAIR</option>
                          <option value="warranty_claimed" className="bg-[#0A0A0A]">WARRANTY CLAIMED</option>
                        </select>
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Warranty Expiration</label>
                      <input 
                        type="date"
                        value={editingSerial?.warrantyExpiry ? new Date(editingSerial.warrantyExpiry).toISOString().split('T')[0] : ""}
                        onChange={(e) => setEditingSerial({ ...editingSerial, warrantyExpiry: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                      />
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Administrative Notes</label>
                      <textarea 
                        value={editingSerial?.batchNotes || ""}
                        onChange={(e) => setEditingSerial({ ...editingSerial, batchNotes: e.target.value })}
                        placeholder="Log any discrepancies or status changes..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all min-h-[100px]"
                      />
                   </div>
                </div>

                <div className="flex gap-4">
                   <button 
                     onClick={() => !isSaving && setIsEditModalOpen(false)}
                     className="flex-1 py-4 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleUpdate}
                     disabled={isSaving}
                     className="flex-[2] py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-white/10 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                   >
                     {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save size={16} /> Commit Changes</>}
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
