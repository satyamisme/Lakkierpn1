import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Phone, 
  Mail, 
  Star, 
  ShoppingBag, 
  Wrench, 
  History, 
  Loader2, 
  RefreshCcw, 
  TrendingUp, 
  Calendar, 
  CreditCard,
  Search,
  AlertCircle,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { Gate } from '../components/PermissionGuard';
import axios from 'axios';

interface Customer360Data {
  customer: any;
  history: {
    sales: any[];
    repairs: any[];
    loyalty: any[];
  };
}

export const Customer360: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [data, setData] = useState<Customer360Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('repairs');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setIsLoading(true);
    try {
      const searchRes = await axios.get(`/api/customers/search?phone=${phone}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (searchRes.data.length === 0) {
        toast.error("No customer found with this phone number");
        setData(null);
        return;
      }

      const customer = searchRes.data[0];
      const detailsRes = await axios.get(`/api/crm/customer/${customer._id}/360`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setData(detailsRes.data);
      toast.success("Customer profile synchronized");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch customer data");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-6xl font-serif italic tracking-tight text-foreground leading-none">Customer 360</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-4 opacity-60">Unified intelligence & relationship matrix (ID 141)</p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Search by Phone / ID..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-surface-container-lowest border border-border pl-14 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary transition-all shadow-sm"
          />
          {isLoading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-primary" size={18} />}
        </form>
      </div>

      {data && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-surface-container-lowest border border-border p-10 rounded-[4rem] shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-8 relative z-10">
              <div className="w-32 h-32 rounded-full bg-muted overflow-hidden border-4 border-primary/20 shadow-2xl group-hover:scale-105 transition-transform duration-700">
                <img src={data.customer.image} alt="Profile" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-5xl font-serif italic tracking-tight">{data.customer.name}</h2>
                  <span className="px-4 py-1.5 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-amber-500/30">
                    {data.customer.tier || 'Silver'} Member
                  </span>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"><Phone size={14} className="text-primary" /> {data.customer.phone}</span>
                  <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"><Mail size={14} className="text-primary" /> {data.customer.email}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-6 relative z-10">
              <div className="bg-surface border border-border p-6 rounded-3xl text-center min-w-[160px] shadow-sm hover:border-amber-500/50 transition-all">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-60">Loyalty Points</p>
                <p className="text-3xl font-mono font-black text-amber-600 tracking-tighter">{(data.customer.loyaltyPoints || 0).toLocaleString()}</p>
              </div>
              <div className="bg-surface border border-border p-6 rounded-3xl text-center min-w-[160px] shadow-sm hover:border-primary/50 transition-all">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 opacity-60">Store Credit</p>
                <p className="text-3xl font-mono font-black text-primary tracking-tighter">{(data.customer.storeCredit || 0).toFixed(3)} <span className="text-xs">KD</span></p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-[100px] pointer-events-none" />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3 space-y-8">
              <div className="flex gap-2 p-1.5 bg-surface-container border border-border rounded-2xl w-fit shadow-sm">
                {['repairs', 'sales', 'loyalty'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab ? 'bg-surface-container-lowest text-primary shadow-md' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-surface-container-lowest border border-border rounded-[3.5rem] p-10 min-h-[500px] shadow-sm">
                <AnimatePresence mode="wait">
                  {activeTab === 'repairs' && (
                    <motion.div 
                      key="repairs"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-3xl font-serif italic">Active Repair Matrix</h3>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest">Live Status</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {data.history.repairs.map((repair: any) => (
                          <div key={repair._id} className="bg-surface border border-border p-8 rounded-[2.5rem] group hover:border-primary/50 hover:shadow-2xl transition-all relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                              <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all"><Wrench size={24} /></div>
                              <span className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest">{repair.ticketId}</span>
                            </div>
                            <h4 className="text-xl font-black uppercase tracking-tighter mb-2">{repair.phoneModel}</h4>
                            <p className="text-sm text-muted-foreground mb-6 font-medium">{repair.issue}</p>
                            <div className="flex items-center justify-between pt-6 border-t border-border">
                              <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">{repair.status}</span>
                              <span className="font-mono font-black text-lg text-primary">{repair.estimatedQuote.toFixed(3)} KD</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'sales' && (
                    <motion.div 
                      key="sales"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-serif italic">Purchase History</h3>
                      </div>
                      <div className="space-y-4">
                        {data.history.sales.map((sale: any) => (
                          <div key={sale._id} className="flex items-center justify-between p-8 bg-surface border border-border rounded-[2.5rem] group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border group-hover:bg-primary/10 group-hover:text-primary transition-all"><ShoppingBag size={28} /></div>
                              <div>
                                <p className="font-black text-lg uppercase tracking-tighter">{sale.saleNumber || 'INV-OLD'}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">{new Date(sale.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-primary uppercase tracking-widest">{sale.total.toFixed(3)} KD</p>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2 opacity-60">{sale.items.length} Items</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'loyalty' && (
                    <motion.div 
                      key="loyalty"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-serif italic">Loyalty Ledger</h3>
                      </div>
                      <div className="space-y-4">
                        {data.history.loyalty.map((log: any) => (
                          <div key={log._id} className="flex items-center justify-between p-8 bg-surface border border-border rounded-[2.5rem] group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border group-hover:bg-primary/10 group-hover:text-primary transition-all"><Star size={28} /></div>
                              <div>
                                <p className="font-black text-lg uppercase tracking-tighter">{log.reason}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">{new Date(log.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-black uppercase tracking-widest ${log.pointsEarned > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {log.pointsEarned > 0 ? `+${log.pointsEarned}` : log.pointsRedeemed ? `-${log.pointsRedeemed}` : '0'} Points
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-surface-container-lowest border border-border p-8 rounded-[3rem] shadow-sm">
                <h3 className="text-2xl font-serif italic mb-8">Device Gallery</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-muted rounded-[1.5rem] overflow-hidden border border-border group cursor-pointer relative">
                      <img src={`https://picsum.photos/seed/device${i}/400/400`} alt="Device" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all" />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-4 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all">View All Media</button>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[3rem] relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-serif italic text-red-600 mb-2">Account Governance</h3>
                  <p className="text-[10px] text-red-500/70 uppercase tracking-widest font-black mb-8">Security & Fraud Prevention</p>
                  <button className="w-full py-5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-red-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    <AlertCircle size={18} /> Freeze Account (ID 347)
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
