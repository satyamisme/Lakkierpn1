import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Phone, Mail, User } from 'lucide-react';
import api from '../../api/client';

interface CustomerSelectorProps {
  selectedCustomer: any;
  onSelect: (customer: any) => void;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({ selectedCustomer, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 1) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/customers?search=${searchQuery}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (selectedCustomer) {
    return (
      <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl group transition-all hover:bg-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
            {selectedCustomer.name[0]}
          </div>
          <div>
            <p className="text-sm font-black text-white uppercase">{selectedCustomer.name}</p>
            <p className="text-[10px] font-bold text-white/40">{selectedCustomer.phone}</p>
          </div>
        </div>
        <button 
          onClick={() => onSelect(null)}
          className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase text-white/40 hover:text-white transition-all"
        >
          Change Identity
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
        <input 
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 text-sm font-bold text-white outline-none focus:border-blue-500"
          placeholder="Search by name, phone, or email vector..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
        {results.map(c => (
          <button 
            key={c._id}
            onClick={() => onSelect(c)}
            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                {c.name[0]}
              </div>
              <div>
                <p className="text-[11px] font-bold text-white tracking-tight">{c.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] text-white/20 flex items-center gap-1 font-mono uppercase"><Phone size={8} /> {c.phone}</span>
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/10">
               <User size={14} />
            </div>
          </button>
        ))}
        {searchQuery.length > 0 && results.length === 0 && !isSearching && (
          <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl">
             <p className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-4">No match found</p>
             <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase mx-auto">
               <UserPlus size={12} /> New Customer
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
