import React from 'react';
import { motion } from 'motion/react';
import { User, Heart, Star, MessageSquare, Search, UserPlus, Phone, Mail, MapPin } from 'lucide-react';

/**
 * ID 151: CRM Matrix
 * ID 155: Loyalty Points
 */
export const CRMDashboard: React.FC = () => {
  const customers = [
    { id: 'CU-001', name: 'Alice Brown', points: 1250, visits: 12, lastVisit: '2026-04-01', tier: 'Gold' },
    { id: 'CU-002', name: 'Bob Smith', points: 450, visits: 4, lastVisit: '2026-03-28', tier: 'Silver' },
    { id: 'CU-003', name: 'Charlie Davis', points: 2100, visits: 24, lastVisit: '2026-04-05', tier: 'Platinum' },
    { id: 'CU-004', name: 'Diana Prince', points: 150, visits: 1, lastVisit: '2026-04-04', tier: 'Bronze' },
  ];

  const stats = [
    { label: 'Total Customers', value: '1,240', icon: User, color: 'text-primary' },
    { label: 'Loyalty Points Issued', value: '45,200', icon: Star, color: 'text-yellow-500' },
    { label: 'Active This Month', value: '342', icon: Heart, color: 'text-red-500' },
    { label: 'Feedback Score', value: '4.8/5', icon: MessageSquare, color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">CRM & Loyalty</h1>
          <p className="text-muted-foreground text-xs font-mono">ID 151, 155 | CUSTOMER RELATIONSHIP MANAGEMENT</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input 
              type="text" 
              placeholder="Search Customers..." 
              className="bg-muted border border-border pl-9 pr-4 py-2 rounded-none font-black text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-none font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2">
            <UserPlus size={14} />
            New Customer
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border p-6 relative group overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
              <stat.icon size={80} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black font-mono tracking-tighter">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <User size={14} className="text-primary" />
              Customer Matrix
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <th className="p-4 border-b border-border">Customer</th>
                  <th className="p-4 border-b border-border">Tier</th>
                  <th className="p-4 border-b border-border">Points</th>
                  <th className="p-4 border-b border-border">Visits</th>
                  <th className="p-4 border-b border-border">Last Visit</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 border-b border-border">
                      <div className="font-bold">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground">{c.id}</div>
                    </td>
                    <td className="p-4 border-b border-border">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        c.tier === 'Platinum' ? 'bg-purple-500/10 text-purple-500' :
                        c.tier === 'Gold' ? 'bg-yellow-500/10 text-yellow-500' :
                        c.tier === 'Silver' ? 'bg-gray-500/10 text-gray-500' :
                        'bg-orange-500/10 text-orange-500'
                      }`}>
                        {c.tier}
                      </span>
                    </td>
                    <td className="p-4 border-b border-border font-bold text-primary">{c.points}</td>
                    <td className="p-4 border-b border-border">{c.visits}</td>
                    <td className="p-4 border-b border-border text-muted-foreground">{c.lastVisit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Contact Card */}
        <div className="space-y-4">
          <div className="bg-card border border-border p-6">
            <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Phone size={14} className="text-primary" />
              Quick Contact
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary font-black">JD</div>
                <div>
                  <p className="text-xs font-bold">John Doe</p>
                  <p className="text-[10px] text-muted-foreground">Active Repair: #RP-1024</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 p-2 bg-muted border border-border text-[10px] font-black uppercase hover:bg-muted/80 transition-colors">
                  <Phone size={12} /> Call
                </button>
                <button className="flex items-center justify-center gap-2 p-2 bg-muted border border-border text-[10px] font-black uppercase hover:bg-muted/80 transition-colors">
                  <Mail size={12} /> Email
                </button>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-6">
            <h2 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <Star size={14} className="text-primary" />
              Loyalty Promo
            </h2>
            <p className="text-[10px] text-muted-foreground mb-4">Send 20% discount coupon to all Platinum members.</p>
            <button className="w-full bg-primary text-primary-foreground py-2 font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity">
              Send Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
