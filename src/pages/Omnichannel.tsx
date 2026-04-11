import React from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Smartphone, 
  ShoppingCart, 
  Truck, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

/**
 * ID 241: Omnichannel
 * BOPIS, Stock Sync, and Webhooks.
 */
export const Omnichannel: React.FC = () => {
  const channels = [
    { label: 'Shopify Store', status: 'Connected', orders: 12, icon: <Globe className="w-5 h-5" /> },
    { label: 'WooCommerce', status: 'Syncing', orders: 5, icon: <Globe className="w-5 h-5" /> },
    { label: 'WhatsApp Business', status: 'Active', orders: 28, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Instagram Shop', status: 'Connected', orders: 8, icon: <Smartphone className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-5xl font-serif italic tracking-tight text-foreground">Omnichannel Hub</h1>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Unified Commerce & Sync (ID 241)</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {channels.map((channel) => (
          <div key={channel.label} className="bg-surface-container-lowest border border-border p-6 rounded-[2rem] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-muted rounded-2xl text-primary">{channel.icon}</div>
              <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                channel.status === 'Connected' || channel.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {channel.status}
              </span>
            </div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-1">{channel.label}</h3>
            <p className="text-2xl font-mono font-black">{channel.orders} <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Pending</span></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-border rounded-[3rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif italic">BOPIS Fulfillment Queue</h3>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Buy Online, Pickup In Store (ID 241)</span>
          </div>
          <div className="space-y-4">
            {[
              { id: 'WEB-9902', customer: 'Sarah J.', item: 'iPhone 15 Pro Max', time: '10m ago', status: 'Ready' },
              { id: 'WEB-9901', customer: 'Mike R.', item: 'AirPods Pro 2', time: '25m ago', status: 'Picking' },
              { id: 'WEB-9900', customer: 'Lina K.', item: 'USB-C Cable', time: '1h ago', status: 'Ready' },
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between p-6 bg-muted/30 border border-border rounded-3xl group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-card border border-border rounded-2xl text-muted-foreground group-hover:text-primary transition-colors">
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{order.id} • {order.customer}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{order.item}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-mono text-muted-foreground">{order.time}</span>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    order.status === 'Ready' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {order.status}
                  </span>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors"><ArrowRight size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary text-primary-foreground p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <Truck className="w-12 h-12 mb-6 opacity-20" />
            <h3 className="text-2xl font-serif italic mb-4">Mandoob Tracker</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-8">
              Real-time driver assignment and delivery routing for omnichannel orders.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10 pb-2">
                <span>Active Drivers</span>
                <span>4</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10 pb-2">
                <span>Avg Delivery Time</span>
                <span>24m</span>
              </div>
            </div>
            <button className="w-full py-4 bg-background text-primary rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl">
              Open Dispatch Map
            </button>
          </div>
          <Globe className="absolute -bottom-8 -right-8 w-48 h-48 opacity-5" />
        </div>
      </div>
    </div>
  );
};
