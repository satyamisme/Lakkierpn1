import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus, Loader2, User, Phone, Mail, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
}

interface CustomerSelectorProps {
  onSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({ onSelect, selectedCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // New Customer Form
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length > 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const { data } = await axios.get(`/api/customers/search?q=${searchTerm}`);
      setResults(data);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error("Name and Phone are required");
      return;
    }
    try {
      const { data } = await axios.post('/api/customers', newCustomer);
      onSelect(data);
      setIsCreating(false);
      setNewCustomer({ name: '', phone: '', email: '' });
      toast.success("Customer registered successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  if (selectedCustomer) {
    return (
      <div className="p-4 bg-primary-foreground/20 border border-primary-foreground/30 rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden group">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/5">
            <User size={18} />
          </div>
          <div>
            <h4 className="font-black uppercase tracking-tight text-[11px] text-white/90">{selectedCustomer.name}</h4>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 mt-0.5">
              <Phone size={8} className="text-primary-foreground" /> {selectedCustomer.phone}
            </p>
          </div>
        </div>
        <button 
          onClick={() => onSelect(null)}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white relative z-10"
        >
          <Search size={14} />
        </button>
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-foreground/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-primary-foreground" size={14} />
          <input 
            type="text" 
            placeholder="FIND CUSTOMER / PHONE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container-highest/20 border border-white/5 pl-10 pr-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:border-primary-foreground/40 transition-all placeholder:text-white/10 text-white"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-3 h-3 animate-spin text-primary-foreground" />
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-3 bg-white/[0.02] hover:bg-primary-foreground hover:text-white border border-white/5 rounded-xl transition-all text-white/20"
        >
          <UserPlus size={16} />
        </button>
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-surface-container-low/80 backdrop-blur-xl border border-white/5 rounded-[1.25rem] overflow-hidden shadow-2xl max-h-40 overflow-y-auto custom-scrollbar"
          >
            {results.map(c => (
              <button
                key={c._id}
                onClick={() => onSelect(c)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] border-b border-white/5 last:border-0 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                    <User size={12} className="text-white/20 group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-white/60 group-hover:text-white transition-colors">{c.name}</p>
                    <p className="text-[8px] font-mono font-black text-white/20 tracking-widest uppercase mt-0.5">{c.phone}</p>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_8px_rgba(var(--primary-foreground-rgb),0.5)]" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 bg-surface-container-low/60 backdrop-blur-xl border border-primary-foreground/20 rounded-[1.5rem] space-y-4 overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-primary-foreground italic">Customer Node Registry</h4>
              <button onClick={() => setIsCreating(false)} className="text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all">Abort</button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="FULL NAME" 
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full bg-white/[0.02] border border-white/5 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:border-primary-foreground/40 text-white placeholder:text-white/10" 
                />
                <input 
                  type="text" 
                  placeholder="PHONE" 
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full bg-white/[0.02] border border-white/5 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:border-primary-foreground/40 text-white placeholder:text-white/10" 
                />
              </div>
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS (OPTIONAL)" 
                value={newCustomer.email}
                onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                className="w-full bg-white/[0.02] border border-white/5 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:border-primary-foreground/40 text-white placeholder:text-white/10" 
              />
              <button 
                onClick={handleCreateCustomer}
                className="w-full bg-primary-foreground/20 text-primary-foreground py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-primary-foreground/5 hover:bg-primary-foreground hover:text-white transition-all active:scale-[0.98] mt-2"
              >
                Commit Vector
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
