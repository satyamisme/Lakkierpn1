import React from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Store, Activity, Database, Cpu, HardDrive, RefreshCcw, Save } from 'lucide-react';
import { FeatureToggleBoard } from '../FeatureToggleBoard';
import { RoleSwitcher } from '../RoleSwitcher';

/**
 * ID 195: Role Manager
 * ID 199: Store Profile
 * ID 232: System Health
 */
export const AdminDashboard: React.FC = () => {
  const systemStats = [
    { label: 'CPU Usage', value: '12%', icon: Cpu, color: 'text-green-500' },
    { label: 'Memory', value: '1.2GB / 4GB', icon: HardDrive, color: 'text-blue-500' },
    { label: 'DB Connections', value: '42', icon: Database, color: 'text-primary' },
    { label: 'Uptime', value: '99.9%', icon: Activity, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">System Administration</h1>
          <p className="text-muted-foreground text-xs font-mono">ID 195, 199, 232 | CORE SYSTEM CONFIGURATION</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-muted border border-border text-foreground px-4 py-2 rounded-none font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-colors flex items-center gap-2">
            <RefreshCcw size={14} />
            Check Health
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-none font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2">
            <Save size={14} />
            Save Changes
          </button>
        </div>
      </div>

      {/* System Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border p-4 flex items-center gap-4"
          >
            <div className={`p-2 rounded-none bg-muted/50 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{stat.label}</p>
              <h3 className="text-lg font-black font-mono tracking-tighter">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Store Profile & Role Switcher */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-6">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Store size={14} className="text-primary" />
              Store Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Store Name</label>
                <input type="text" defaultValue="Lakki Phone ERP" className="w-full bg-muted border border-border px-3 py-2 text-xs font-mono focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Location ID</label>
                <input type="text" defaultValue="LAKKI-MAIN-01" className="w-full bg-muted border border-border px-3 py-2 text-xs font-mono focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Currency</label>
                <select className="w-full bg-muted border border-border px-3 py-2 text-xs font-mono focus:border-primary outline-none">
                  <option>GBP (£)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Shield size={14} className="text-primary" />
              Active Role Session
            </h2>
            <RoleSwitcher />
            <p className="text-[9px] text-muted-foreground mt-4 italic font-mono">
              * Changing roles will immediately update your permission matrix [1-300].
            </p>
          </div>
        </div>

        {/* Right Column: Feature Toggles */}
        <div className="lg:col-span-2 bg-card border border-border p-6">
          <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <Settings size={14} className="text-primary" />
            Global Feature Matrix
          </h2>
          <FeatureToggleBoard userId="65f1a2b3c4d5e6f7a8b9c0d1" />
        </div>
      </div>
    </div>
  );
};
