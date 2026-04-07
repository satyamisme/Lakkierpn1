import React, { useState, useEffect } from "react";
import { CustomerGroupForm } from "../components/organisms/CustomerGroupForm";
import { customerGroupsService, CustomerGroup } from "../api/services/customerGroups";
import { Users, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CustomerGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | undefined>();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await customerGroupsService.getAll();
      setGroups(data);
    } catch (error) {
      toast.error("Failed to load customer groups");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    try {
      await customerGroupsService.delete(id);
      toast.success("Group deleted");
      fetchGroups();
    } catch (error) {
      toast.error("Failed to delete group");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
            <Users className="text-primary w-8 h-8" />
            Customer Segments
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage tiered pricing and loyalty groups</p>
        </div>
        <button
          onClick={() => { setEditingGroup(undefined); setIsFormOpen(true); }}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2"
        >
          <Plus size={16} /> New Group
        </button>
      </div>

      {isFormOpen && (
        <div className="animate-in fade-in slide-in-from-top-4">
          <CustomerGroupForm 
            initialData={editingGroup} 
            onSuccess={() => { setIsFormOpen(false); fetchGroups(); }} 
          />
          <button 
            onClick={() => setIsFormOpen(false)}
            className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : groups.map((group) => (
          <div key={group._id} className="bg-card border border-border p-6 space-y-4 group hover:border-primary transition-all">
            <div className="flex justify-between items-start">
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                group.tier === 'platinum' ? 'bg-indigo-100 text-indigo-700' :
                group.tier === 'gold' ? 'bg-amber-100 text-amber-700' :
                group.tier === 'silver' ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {group.tier}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingGroup(group); setIsFormOpen(true); }}
                  className="p-2 hover:bg-muted rounded-lg text-primary"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(group._id)}
                  className="p-2 hover:bg-muted rounded-lg text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">{group.name}</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-2">{group.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Discount</div>
                <div className="text-lg font-black text-primary">{group.discountPercentage}%</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min Spend</div>
                <div className="text-lg font-black">{group.minSpend.toFixed(3)} KD</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerGroupsPage;
