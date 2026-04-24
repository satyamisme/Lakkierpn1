import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Search, 
  ArrowRight, 
  Bell, 
  Package, 
  Smartphone, 
  ShoppingCart,
  Zap,
  MoreVertical,
  X,
  Mail,
  MessageCircle
} from 'lucide-react';
import { toast } from "sonner";

interface WishlistItem {
  _id: string;
  customerId: { name: string; email: string };
  productId: { name: string; sku: string; price: number; stock: number };
  createdAt: string;
}

export const Wishlist: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking wishlist data
    setItems([
      { 
        _id: 'W-001', 
        customerId: { name: 'Faisal Al-Otaibi', email: 'faisal@example.com' }, 
        productId: { name: 'iPhone 15 Pro Max 256GB Black', sku: 'IP15-PM-256-BK', price: 345.000, stock: 0 },
        createdAt: new Date().toISOString()
      },
      { 
        _id: 'W-002', 
        customerId: { name: 'Sarah Ahmed', email: 'sarah@example.com' }, 
        productId: { name: 'AirPods Pro Gen 2', sku: 'APP-G2', price: 75.000, stock: 12 },
        createdAt: new Date().toISOString()
      }
    ]);
    setLoading(false);
  }, []);

  const handleNotify = (item: WishlistItem) => {
    toast.success(`Notification queued for ${item.customerId.name}`);
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-serif italic tracking-tighter text-white leading-none">Aspiration Matrix</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
            Customer Wishlists & Back-in-Stock Intelligence (ID 202)
          </p>
        </div>
        <div className="flex items-center gap-6">
            <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-6">
                <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Total Aspirations</p>
                    <p className="text-xl font-black font-mono tracking-tighter">{items.length}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <Heart className="text-primary fill-primary" size={24} />
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
             <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <Search className="text-white/20" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search wishlists..." 
                        className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest w-64 placeholder:text-white/10 text-white"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                        <MoreVertical size={16} />
                    </button>
                </div>
             </div>

             <div className="space-y-6 relative z-10">
                {items.map(item => (
                    <motion.div 
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-primary/30 transition-all"
                    >
                        <div className="flex items-center gap-8">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 transition-all ${item.productId.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">{item.productId.name}</h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.customerId.name}</p>
                                    <span className="w-1 h-1 bg-white/10 rounded-full" />
                                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${item.productId.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {item.productId.stock > 0 ? `${item.productId.stock} IN STOCK` : 'OUT OF STOCK'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-lg font-black font-mono tracking-tighter">{item.productId.price.toFixed(3)} KD</p>
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest uppercase mt-1">Added {new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleNotify(item)}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${item.productId.stock > 0 ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                >
                                    <Bell size={18} />
                                </button>
                                <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
             </div>
          </div>
        </div>

        <aside className="space-y-10">
          <div className="bg-primary text-black rounded-[4rem] p-10 space-y-10 shadow-2xl shadow-primary/20">
             <div className="flex items-center justify-between">
                <Zap size={32} />
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Auto-Campaigns</p>
                    <p className="text-xs font-black uppercase tracking-widest">ENABLED</p>
                </div>
             </div>
             <div>
                <h3 className="text-3xl font-serif italic mb-4">Stock Trigger</h3>
                <p className="text-xs font-bold leading-relaxed uppercase opacity-80">
                    System automatically broadcasts WhatsApp & SMS alerts to 142 clients when target SKUs are replenished.
                </p>
             </div>
             <button className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                Campaign Settings
             </button>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-10 space-y-8">
             <h4 className="text-xl font-serif italic">Communication Matrix</h4>
             <div className="space-y-4">
                {[
                    { label: 'Bulk Email Sync', icon: Mail, percentage: 88 },
                    { label: 'WhatsApp API', icon: MessageCircle, percentage: 94 },
                    { label: 'Direct SMS', icon: Zap, percentage: 100 }
                ].map(comm => (
                    <div key={comm.label} className="space-y-3">
                        <div className="flex items-center justify-between px-2">
                             <div className="flex items-center gap-3">
                                 <comm.icon size={14} className="text-white/40" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">{comm.label}</span>
                             </div>
                             <span className="text-[10px] font-mono font-black">{comm.percentage}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-primary" style={{ width: `${comm.percentage}%` }} />
                        </div>
                    </div>
                ))}
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Wishlist;
