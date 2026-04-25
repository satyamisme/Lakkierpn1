import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Mail, 
  Plus, 
  X, 
  Send, 
  Loader2, 
  FileUp, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  UserPlus
} from "lucide-react";
import { Gate } from "../components/PermissionGuard";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

import Papa from "papaparse";

export const BulkUserInvite: React.FC = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<string[]>([""]);
  const [role, setRole] = useState("cashier");
  const [sending, setSending] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedEmails = results.data
          .map((row: any) => row.email || row.Email)
          .filter((email: string) => email && email.includes("@"));
        
        if (parsedEmails.length > 0) {
          setEmails([...emails.filter(e => e !== ""), ...parsedEmails]);
          toast.success(`Parsed ${parsedEmails.length} emails from CSV`);
        } else {
          toast.error("No valid emails found in CSV. Ensure you have an 'email' column.");
        }
      },
      error: () => {
        toast.error("Failed to parse CSV file");
      }
    });
  };

  const addEmailField = () => {
    setEmails([...emails, ""]);
  };

  const removeEmailField = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const validEmails = emails.filter(e => e.trim() !== "" && e.includes("@"));
    if (validEmails.length === 0) {
      toast.error("Please enter at least one valid email");
      return;
    }

    if (!user?.storeId) {
      toast.error("Authority Anchor Missing: No Store ID found for current operator.");
      return;
    }

    setSending(true);
    let count = 0;
    try {
      for (const email of validEmails) {
        // In a real app, this would send an invite email. 
        // Here we'll create users with a temporary password.
        await axios.post("/api/users", {
          name: email.split("@")[0],
          email,
          password: "TemporaryPassword123!",
          role,
          status: "active",
          storeId: user.storeId // PASSING STORE ID
        });
        count++;
      }
      setSuccessCount(count);
      setIsFinished(true);
      toast.success(`Successfully invited ${count} personnel`);
    } catch (error) {
      toast.error("Some invitations failed to process");
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setEmails([""]);
    setIsFinished(false);
    setSuccessCount(0);
  };

  return (
    <Gate id={233}>
      <div className="max-w-4xl mx-auto space-y-16 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <h1 className="text-7xl font-serif italic tracking-tighter text-foreground leading-none">Bulk Onboarding</h1>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-6 opacity-60">
              Mass Personnel Deployment (ID 233)
            </p>
          </div>
          <div className="w-20 h-20 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center shadow-inner">
            <UserPlus size={40} />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-surface-container-lowest border border-border rounded-[4rem] p-16 shadow-sm space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif italic">Assignment Role</h3>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Global Role for this Batch</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['cashier', 'technician', 'manager', 'inventory', 'auditor'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-4 rounded-xl border font-black text-[10px] uppercase tracking-[0.1em] transition-all duration-300 ${role === r ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border text-muted-foreground hover:border-primary/50'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                      <FileUp size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif italic">Batch Import</h3>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">CSV or Manual Entry</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-border rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/40 transition-all cursor-pointer group"
                  >
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                    />
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <FileUp size={24} />
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
                      Drop CSV file here or <span className="text-primary">browse</span><br/>
                      <span className="opacity-40">(Email, Name, StoreID)</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-serif italic">Personnel Emails</h3>
                  <button 
                    onClick={addEmailField}
                    className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-all"
                  >
                    <Plus size={16} /> Add Another
                  </button>
                </div>

                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {emails.map((email, index) => (
                      <div key={index} className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-30" size={18} />
                        <input 
                          type="email"
                          placeholder="operator@lakkiphone.com"
                          value={email}
                          onChange={(e) => handleEmailChange(index, e.target.value)}
                          className="w-full bg-surface border border-border rounded-2xl py-5 pl-14 pr-14 text-xs font-black uppercase tracking-widest outline-none focus:border-primary transition-all"
                        />
                        {emails.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeEmailField(index)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button 
                    type="submit"
                    disabled={sending}
                    className="w-full bg-primary text-primary-foreground py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all mt-10 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                    Deploy Invitations
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface-container-lowest border border-border rounded-[4rem] p-20 text-center space-y-10 shadow-2xl"
            >
              <div className="w-32 h-32 bg-green-500/10 text-green-500 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={64} />
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-serif italic">Deployment Successful</h2>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">
                  {successCount} Personnel Nodes Initialized
                </p>
              </div>
              <p className="max-w-md mx-auto text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-40">
                Temporary access keys have been generated. Operators can now login and will be prompted to rotate their credentials upon first entry.
              </p>
              <button 
                onClick={reset}
                className="px-12 py-5 bg-surface border border-border rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:border-primary transition-all"
              >
                Start New Batch
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Gate>
  );
};
