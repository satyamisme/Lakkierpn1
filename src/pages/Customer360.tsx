import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  AlertCircle
} from 'lucide-react';
import { Gate } from '../components/Gate';

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
  const [error, setError] = useState('');

  const searchCustomer = async () => {
    setIsLoading(true);
    setError('');
    try {
      const searchRes = await fetch(`/api/crm/customers/search?phone=${phone}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const searchData = await searchRes.json();
      
      if (searchData.length > 0) {
        const fullRes = await fetch(`/api/crm/customer/${searchData[0]._id}/360`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setData(await fullRes.json());
      } else {
        setError('Customer not found');
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Customer 360 View</h1>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">Omnichannel Profile & History (ID 256)</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Enter Customer Phone (e.g. 965...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-card border border-border pl-12 pr-4 py-4 text-sm font-mono focus:border-primary outline-none shadow-sm"
            />
          </div>
          <button 
            onClick={searchCustomer}
            disabled={isLoading || !phone}
            className="bg-primary text-primary-foreground px-8 py-4 font-black text-xs uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      {data && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <User size={64} className="text-primary" />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <User size={32} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">{data.customer.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                      {data.customer.tier} Tier
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <Phone size={14} className="text-muted-foreground" />
                  <span>{data.customer.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <Mail size={14} className="text-muted-foreground" />
                  <span>{data.customer.email || 'No Email'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <Star size={14} className="text-amber-500" />
                  <span className="font-black text-amber-500">{data.customer.loyaltyPoints} Loyalty Points</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/30 border border-border">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Spent</p>
                  <p className="text-lg font-black font-mono">{data.customer.totalSpent.toFixed(3)} KD</p>
                </div>
                <div className="text-center p-4 bg-muted/30 border border-border">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Visits</p>
                  <p className="text-lg font-black font-mono">{data.history.sales.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* History Tabs */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border p-8 shadow-sm h-full">
              <div className="flex items-center gap-3 mb-8">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black uppercase tracking-tighter italic">Omnichannel History</h3>
              </div>

              <div className="space-y-6">
                {/* Sales History */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <ShoppingBag size={12} /> Sales History
                  </h4>
                  {data.history.sales.map((sale: any) => (
                    <div key={sale._id} className="flex items-center justify-between p-4 bg-muted/30 border border-border hover:border-primary transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-card border border-border">
                          <ShoppingBag size={14} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest">Sale #{sale._id.substr(-6).toUpperCase()}</p>
                          <p className="text-[8px] font-mono text-muted-foreground">{new Date(sale.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black font-mono">{sale.total.toFixed(3)} KD</p>
                        <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest">{sale.status}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Repair History */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Wrench size={12} /> Repair History
                  </h4>
                  {data.history.repairs.map((repair: any) => (
                    <div key={repair._id} className="flex items-center justify-between p-4 bg-muted/30 border border-border hover:border-primary transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-card border border-border">
                          <Wrench size={14} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest">{repair.deviceModel}</p>
                          <p className="text-[8px] font-mono text-muted-foreground">{repair.issue}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black font-mono">{repair.estimatedQuote.toFixed(3)} KD</p>
                        <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">{repair.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
