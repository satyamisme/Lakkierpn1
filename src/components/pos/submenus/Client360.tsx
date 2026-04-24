import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, User, Mail, Phone, Calendar, Package, Wrench, Heart, Users, ArrowRight, Loader2, Activity } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  tier?: string;
}

export const Client360: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'repairs' | 'wishlist'>('info');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSummary, setCustomerSummary] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchTerm) {
      fetchRecentCustomers();
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/customers/search?q=${searchTerm}`);
      setCustomers(data);
    } catch (e) {
      toast.error("Cluster search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentCustomers = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/customers?limit=10');
      setCustomers(data);
    } catch (e) {
      toast.error("Failed to fetch principal registry");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerSummary = async (id: string) => {
    try {
      const { data } = await axios.get(`/api/customers/${id}/summary`);
      setCustomerSummary(data);
    } catch (e) {
      console.error("Summary fetch error", e);
    }
  };

  useEffect(() => {
    fetchRecentCustomers();
  }, []);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchCustomerSummary(customer._id);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic text-white leading-none">Client 360</h2>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-3">Identity & Lifecycle Intelligence</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input 
            type="text" 
            placeholder="SEARCH MOBILE / EMAIL / NAME..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black tracking-widest text-white placeholder:text-white/10 focus:border-primary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
               <Loader2 className="animate-spin" size={32} />
            </div>
          ) : customers.map((c) => (
            <div 
              key={c._id} 
              onClick={() => handleSelectCustomer(c)}
              className={`p-5 border rounded-3xl transition-all cursor-pointer group ${
                selectedCustomer?._id === c._id ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${
                  selectedCustomer?._id === c._id ? 'bg-primary text-white' : 'bg-white/5 text-white/20'
                }`}>
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">{c.name}</h4>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{c.phone}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-2">
                   <span className="text-[7px] font-black text-primary uppercase tracking-widest">{c.loyaltyPoints || 0} Points</span>
                </div>
                <ArrowRight size={14} className={`transition-all ${selectedCustomer?._id === c._id ? 'text-primary' : 'text-white/10 group-hover:translate-x-1'}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-8 bg-white/[0.02] border border-white/5 rounded-[3rem] flex flex-col overflow-hidden">
           {selectedCustomer ? (
             <>
                <div className="flex border-b border-white/5">
                  {[
                    { id: 'info', label: 'Demographics', icon: User },
                    { id: 'history', label: 'Purchase History', icon: Package },
                    { id: 'repairs', label: 'Repair Matrix', icon: Wrench },
                    { id: 'wishlist', label: 'Loyalty & Wishlist', icon: Heart }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
                        activeTab === tab.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-transparent text-white/20 hover:text-white/40'
                      }`}
                    >
                      <tab.icon size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                    </button>
                  ))}
              </div>

              <div className="flex-1 p-10 overflow-y-auto custom-scrollbar space-y-12">
                  {activeTab === 'info' && (
                    <div className="grid grid-cols-2 gap-10">
                       <div className="space-y-6">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Principal Context</label>
                          <div className="space-y-4">
                             <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Email Terminal</p>
                                <p className="text-sm font-black text-white">{selectedCustomer.email || 'NOT_ASSIGNED'}</p>
                             </div>
                             <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Phone Handshake</p>
                                <p className="text-sm font-black text-white">{selectedCustomer.phone}</p>
                             </div>
                          </div>
                       </div>
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 border border-primary/20 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
                             <Activity size={24} />
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2">Lifecycle Value</p>
                          <h3 className="text-4xl font-black text-white font-mono tracking-tighter">{(selectedCustomer.totalSpent || 0).toFixed(3)} <span className="text-xs">KD</span></h3>
                          <div className="flex gap-4 mt-8">
                             <div className="text-center">
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Points</p>
                                <p className="text-xl font-black text-white">{selectedCustomer.loyaltyPoints || 0}</p>
                             </div>
                             <div className="w-px h-10 bg-white/10" />
                             <div className="text-center">
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Tier</p>
                                <p className="text-xl font-black text-blue-500 uppercase tracking-tighter">{selectedCustomer.tier || 'MEMBER'}</p>
                             </div>
                          </div>
                       </motion.div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-4">
                       {customerSummary?.recentSales?.length > 0 ? (
                         customerSummary.recentSales.map((s: any) => (
                           <div key={s._id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                             <div>
                                <p className="text-[10px] font-black text-white uppercase">{s.saleNumber}</p>
                                <p className="text-[8px] text-white/20 font-black mt-1">{new Date(s.createdAt).toLocaleDateString()}</p>
                             </div>
                             <p className="text-sm font-black text-primary font-mono">{s.total.toFixed(3)} KD</p>
                           </div>
                         ))
                       ) : (
                         <p className="text-center py-20 text-[10px] font-black uppercase tracking-widest text-white/10">No purchase records found</p>
                       )}
                    </div>
                  )}
              </div>
             </>
           ) : (
             <div className="flex-1 p-8 overflow-y-auto custom-scrollbar text-center flex flex-col items-center justify-center opacity-20">
                <Users size={64} className="mb-6" />
                <p className="text-[12px] font-black uppercase tracking-[0.5em]">Select client to aggregate 360 view</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
