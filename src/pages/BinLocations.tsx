import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  QrCode, 
  Box, 
  Layers,
  ChevronRight,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface BinLocation {
  _id: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  capacity: number;
  currentItems: number;
  status: 'active' | 'full' | 'restricted';
}

export const BinLocations: React.FC = () => {
  const [bins, setBins] = useState<BinLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BinLocation>>({});

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/inventory/bins');
      setBins(res.data);
    } catch (error) {
      toast.error("Failed to fetch bin locations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (bin: BinLocation) => {
    setEditingId(bin._id);
    setEditForm(bin);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await axios.patch(`/api/inventory/bins/${editingId}`, editForm);
        toast.success("Bin location updated successfully.");
      } else {
        await axios.post('/api/inventory/bins', editForm);
        toast.success("New bin location created.");
      }
      setEditingId(null);
      fetchBins();
    } catch (error) {
      toast.error("Failed to save bin location");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-6xl font-serif italic tracking-tighter leading-none">Warehouse Matrix</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Bin Location & Picking Optimization (ID 156)</p>
        </div>
        <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
          <Plus size={18} /> Define New Bin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surface-container-lowest border border-border rounded-[3rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-border bg-surface-container-lowest/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MapPin className="text-primary" size={24} />
                <h2 className="text-xl font-black uppercase tracking-tighter">Storage Topology</h2>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={14} />
                <input 
                  placeholder="Search Zone/Rack..."
                  className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-border">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Location ID</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Zone / Rack / Shelf</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 text-center">Utilization</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center opacity-20">
                        <Loader2 size={48} className="animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Mapping Warehouse Topology...</p>
                      </td>
                    </tr>
                  ) : bins.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center opacity-20">
                        <MapPin size={48} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No bin locations defined</p>
                      </td>
                    </tr>
                  ) : bins.map((bin) => (
                    <tr key={bin._id} className="hover:bg-surface transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            <Box size={18} />
                          </div>
                          <span className="text-sm font-black uppercase tracking-tighter">{bin._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {editingId === bin._id ? (
                          <div className="flex gap-2">
                            <input 
                              value={editForm.zone} 
                              onChange={e => setEditForm({...editForm, zone: e.target.value})}
                              className="w-20 bg-surface border border-border rounded-lg p-2 text-[10px] font-bold text-white outline-none"
                            />
                            <input 
                              value={editForm.rack} 
                              onChange={e => setEditForm({...editForm, rack: e.target.value})}
                              className="w-16 bg-surface border border-border rounded-lg p-2 text-[10px] font-bold text-white outline-none"
                            />
                            <input 
                              value={editForm.shelf} 
                              onChange={e => setEditForm({...editForm, shelf: e.target.value})}
                              className="w-16 bg-surface border border-border rounded-lg p-2 text-[10px] font-bold text-white outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <span className="text-foreground">{bin.zone}</span>
                            <ChevronRight size={10} className="opacity-20" />
                            <span className="text-foreground">{bin.rack}</span>
                            <ChevronRight size={10} className="opacity-20" />
                            <span className="text-foreground">{bin.shelf}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                (bin.currentItems / bin.capacity) > 0.9 ? 'bg-red-500' : 
                                (bin.currentItems / bin.capacity) > 0.7 ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(bin.currentItems / bin.capacity) * 100}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono font-bold opacity-40">{bin.currentItems} / {bin.capacity} UNITS</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          bin.status === 'full' ? 'bg-red-500/10 text-red-500' : 
                          bin.status === 'restricted' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {bin.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingId === bin._id ? (
                            <>
                              <button onClick={() => setEditingId(null)} className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all">
                                <X size={16} />
                              </button>
                              <button onClick={handleSave} className="p-2 bg-primary text-primary-foreground rounded-lg transition-all shadow-lg shadow-primary/20">
                                <Save size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all">
                                <QrCode size={16} />
                              </button>
                              <button onClick={() => handleEdit(bin)} className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all">
                                <Edit3 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-lowest border border-border rounded-[3rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6 opacity-40">Picking Efficiency</h3>
            <div className="space-y-6">
              <div className="p-6 bg-surface border border-border rounded-3xl">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-2">Avg. Pick Time</p>
                <p className="text-3xl font-black font-mono text-primary">42s</p>
                <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-green-500">
                  <span className="px-1.5 py-0.5 bg-green-500/10 rounded">-12% vs last week</span>
                </div>
              </div>
              <div className="p-6 bg-surface border border-border rounded-3xl">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total Capacity</p>
                <p className="text-3xl font-black font-mono text-foreground">12.4k</p>
                <p className="text-[9px] font-bold text-muted-foreground mt-2 opacity-40">Across 420 active bins</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-[3rem] p-8">
            <div className="flex items-center gap-4 mb-4">
              <Layers className="text-primary" size={20} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Zone Optimization</h4>
            </div>
            <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
              Zone A is currently at 85% capacity. System recommends rebalancing fast-moving inventory to Zone B for peak repair intake hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
