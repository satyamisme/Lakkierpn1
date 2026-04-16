import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Shield, 
  User, 
  Trash2, 
  Edit2, 
  Loader2, 
  X, 
  CheckCircle2, 
  Key, 
  AlertTriangle,
  Store,
  Activity,
  UserX,
  ShieldAlert,
  RefreshCw
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";
import axios from "axios";
import { toast } from "sonner";

export const Staff: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
    status: "active",
    storeId: "",
    permissions: [] as number[]
  });

  useEffect(() => {
    fetchUsers();
    fetchStores();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch staff members");
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await axios.get("/api/stores");
      setStores(response.data);
    } catch (error) {
      console.error("Failed to fetch stores");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, formData);
        toast.success("Staff member updated");
      } else {
        await axios.post("/api/users", formData);
        toast.success("Staff member created");
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", role: "cashier", status: "active", storeId: "", permissions: [] });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success("User deleted");
      setIsDeleting(null);
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to delete user");
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    try {
      await axios.post(`/api/users/${id}/reset-password`, { newPassword });
      toast.success("Password reset successfully");
      setIsResettingPassword(null);
      setNewPassword("");
    } catch (error: any) {
      toast.error("Failed to reset password");
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't show password
      role: user.role,
      status: user.status || "active",
      storeId: user.storeId || "",
      permissions: user.permissions || []
    });
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'inactive': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'suspended': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity size={12} />;
      case 'inactive': return <UserX size={12} />;
      case 'suspended': return <ShieldAlert size={12} />;
      default: return <User size={12} />;
    }
  };

  return (
    <Gate id={195}>
      <div className="space-y-16 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Personnel</h1>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">
              Staff Management & Access Matrix (ID 195)
            </p>
          </div>
          <button 
            onClick={() => {
              setEditingUser(null);
              setFormData({ name: "", email: "", password: "", role: "cashier", status: "active", storeId: "", permissions: [] });
              setIsModalOpen(true);
            }}
            className="px-10 py-5 bg-primary text-primary-foreground rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <Plus size={20} />
            Hire New Staff
          </button>
        </header>

        <div className="relative max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" size={20} />
          <input 
            type="text"
            placeholder="Search staff by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border border-border rounded-[1.5rem] py-5 pl-16 pr-8 text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner placeholder:opacity-30"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-6">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">Synchronizing Personnel Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredUsers.map((user) => (
              <motion.div
                key={user._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-container-lowest border border-border rounded-[3.5rem] p-10 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 bg-primary/5 text-primary rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <User size={32} />
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => setIsResettingPassword(user._id)}
                      title="Reset Password"
                      className="p-4 bg-surface border border-border hover:bg-yellow-500 hover:text-white rounded-2xl transition-all active:scale-90 shadow-sm"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <button 
                      onClick={() => openEditModal(user)}
                      title="Edit User"
                      className="p-4 bg-surface border border-border hover:bg-primary hover:text-white rounded-2xl transition-all active:scale-90 shadow-sm"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => setIsDeleting(user._id)}
                      title="Delete User"
                      className="p-4 bg-surface border border-border hover:bg-red-500 hover:text-white rounded-2xl transition-all active:scale-90 shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-serif italic group-hover:text-primary transition-colors">{user.name}</h3>
                  <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(user.status)}`}>
                    {getStatusIcon(user.status)}
                    {user.status}
                  </div>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 opacity-60">{user.email}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <div className="p-2 bg-muted rounded-lg"><Shield size={14} className="text-primary" /></div>
                    Role: <span className="text-foreground">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <div className="p-2 bg-muted rounded-lg"><Store size={14} className="text-primary" /></div>
                    Store: <span className="text-foreground">{stores.find(s => s._id === user.storeId)?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <div className="p-2 bg-muted rounded-lg"><Key size={14} className="text-primary" /></div>
                    Permissions: <span className="text-foreground">{user.permissions?.length || 0} Active</span>
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-border flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                    Active Node
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground opacity-40">UID: {user._id.slice(-6).toUpperCase()}</span>
                </div>

                {/* Delete Confirmation Overlay */}
                <AnimatePresence>
                  {isDeleting === user._id && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-red-600/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-10"
                    >
                      <AlertTriangle size={48} className="text-white mb-6 animate-bounce" />
                      <h4 className="text-2xl font-serif italic text-white mb-2">Terminate Access?</h4>
                      <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-8">This action is permanent and will revoke all system privileges.</p>
                      <div className="flex gap-4 w-full">
                        <button 
                          onClick={() => setIsDeleting(null)}
                          className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="flex-1 py-4 bg-white text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
                        >
                          Confirm
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reset Password Overlay */}
                <AnimatePresence>
                  {isResettingPassword === user._id && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-yellow-600/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-10"
                    >
                      <Key size={48} className="text-white mb-6 animate-pulse" />
                      <h4 className="text-2xl font-serif italic text-white mb-2">Reset Password</h4>
                      <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-6">Enter a new secure access key for this operator.</p>
                      
                      <input 
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/20 border border-white/30 rounded-xl p-4 text-white placeholder:text-white/50 text-xs font-black uppercase tracking-widest mb-6 outline-none focus:bg-white/30"
                      />

                      <div className="flex gap-4 w-full">
                        <button 
                          onClick={() => {
                            setIsResettingPassword(null);
                            setNewPassword("");
                          }}
                          className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleResetPassword(user._id)}
                          className="flex-1 py-4 bg-white text-yellow-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
                        >
                          Update Key
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-background/60 backdrop-blur-3xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-surface-container-lowest border border-border rounded-[4rem] shadow-2xl w-full max-w-3xl overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-3 bg-primary" />
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-10 right-10 p-4 hover:bg-surface-container rounded-full text-muted-foreground transition-all active:scale-90"
                >
                  <X size={24} />
                </button>

                <div className="p-16">
                  <h2 className="text-6xl font-serif italic mb-4">
                    {editingUser ? "Edit Profile" : "Hire Staff"}
                  </h2>
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-12 opacity-60">Personnel Registry Entry</p>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60">Full Name</label>
                        <input 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-surface border border-border rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60">Email Address</label>
                        <input 
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-surface border border-border rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                          placeholder="john@lakkiphone.com"
                        />
                      </div>
                    </div>

                    {!editingUser && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60">Initial Password</label>
                        <div className="relative">
                          <input 
                            required
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full bg-surface border border-border rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                            placeholder="••••••••"
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30"><Key size={18} /></div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60">System Role</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['superadmin', 'manager', 'cashier', 'technician', 'inventory', 'auditor'].map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setFormData({...formData, role})}
                              className={`py-4 rounded-xl border font-black text-[9px] uppercase tracking-[0.1em] transition-all duration-300 ${formData.role === role ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border text-muted-foreground hover:border-primary/50'}`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60">Account Status</label>
                        <div className="grid grid-cols-1 gap-3">
                          {['active', 'inactive', 'suspended'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setFormData({...formData, status})}
                              className={`py-4 rounded-xl border font-black text-[9px] uppercase tracking-[0.1em] transition-all duration-300 flex items-center justify-center gap-2 ${formData.status === status ? (status === 'active' ? 'bg-green-500 text-white border-green-500' : status === 'inactive' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-red-500 text-white border-red-500') : 'bg-surface border-border text-muted-foreground hover:border-primary/50'}`}
                            >
                              {getStatusIcon(status)}
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-4 opacity-60">Assigned Store</label>
                      <select 
                        value={formData.storeId}
                        onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                        className="w-full bg-surface border border-border rounded-[1.5rem] p-5 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner appearance-none"
                      >
                        <option value="">Select a store...</option>
                        {stores.map(store => (
                          <option key={store._id} value={store._id}>{store.name}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-primary text-primary-foreground py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all mt-10"
                    >
                      <CheckCircle2 size={24} />
                      {editingUser ? "Update Profile" : "Complete Hiring"}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Gate>
  );
};

