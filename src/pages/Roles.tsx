import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Shield, Check, Search, Filter, Loader2, Save, Info } from "lucide-react";
import { Gate } from "../components/PermissionGuard";
import axios from "axios";
import { toast } from "sonner";
import { FEATURES } from "../constants/features";

const PERMISSION_GROUPS = [
  { name: "POS & Sales", range: [1, 60] },
  { name: "Repairs", range: [61, 120] },
  { name: "Inventory", range: [121, 180] },
  { name: "Governance", range: [181, 240] },
  { name: "Omnichannel", range: [241, 300] },
  { name: "Enterprise", range: [316, 350] },
];

export const Roles: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setPermissions(user.permissions || []);
  };

  const togglePermission = (id: number) => {
    setPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await axios.put(`/api/users/${selectedUser._id}`, { permissions });
      toast.success(`Permissions updated for ${selectedUser.name}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Gate id={195}>
      <div className="p-8 h-[calc(100vh-120px)] flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3">
              <Shield className="text-indigo-500 w-8 h-8" />
              Access Control Matrix
            </h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
              Granular Permission Management (ID 195)
            </p>
          </div>
          {selectedUser && (
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Save Matrix Changes
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
          {/* User List */}
          <div className="lg:col-span-1 bg-card border border-border rounded-3xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input 
                  type="text"
                  placeholder="Filter staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl py-2 pl-10 pr-4 text-xs font-bold uppercase tracking-widest focus:ring-2 ring-indigo-500/20 outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>
              ) : (
                filteredUsers.map(u => (
                  <button
                    key={u._id}
                    onClick={() => handleUserSelect(u)}
                    className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 ${selectedUser?._id === u._id ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-muted/30 border-border hover:border-indigo-500/50'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedUser?._id === u._id ? 'bg-white/20' : 'bg-indigo-500/10 text-indigo-500'}`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tighter">{u.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedUser?._id === u._id ? 'text-white/70' : 'text-muted-foreground'}`}>{u.role}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="lg:col-span-3 bg-card border border-border rounded-3xl flex flex-col overflow-hidden">
            {selectedUser ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tighter italic">Permissions for {selectedUser.name}</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      Role: {selectedUser.role} | Active Permissions: {permissions.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-4 py-2 rounded-full uppercase tracking-widest">
                    <Info size={14} />
                    ID 0 = Super Admin Override
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {PERMISSION_GROUPS.map(group => (
                      <div key={group.name} className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 flex items-center gap-2">
                          <Filter size={14} />
                          {group.name}
                        </h3>
                        <div className="space-y-2">
                          {FEATURES.filter(f => f.id >= group.range[0] && f.id <= group.range[1]).map(feature => (
                            <button
                              key={feature.id}
                              onClick={() => togglePermission(feature.id)}
                              className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left ${permissions.includes(feature.id) ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-muted/30 border-border text-muted-foreground hover:border-indigo-500/20'}`}
                            >
                              <div className="flex-1 min-w-0 pr-4">
                                <p className="text-[10px] font-black uppercase tracking-tighter truncate">{feature.name}</p>
                                <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest truncate">ID {feature.id} • {feature.description}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${permissions.includes(feature.id) ? 'bg-indigo-500 text-white' : 'bg-muted border border-border'}`}>
                                {permissions.includes(feature.id) && <Check size={12} />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-20">
                <Shield size={80} className="mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Select a Staff Member</h2>
                <p className="text-xs font-bold uppercase tracking-widest mt-2">To begin editing the access control matrix</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Gate>
  );
};
