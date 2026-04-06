import React from 'react';
import { motion } from 'motion/react';
import { Users, Clock, Calendar, CreditCard, UserPlus, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';

/**
 * ID 188: Staff Directory
 * ID 190: Attendance Matrix
 * ID 192: Payroll & Commission
 */
export const HRDashboard: React.FC = () => {
  const staff = [
    { id: 'ST-001', name: 'John Doe', role: 'Super Admin', status: 'Active', shift: 'Morning', commission: '£1,240.00' },
    { id: 'ST-002', name: 'Jane Smith', role: 'Technician', status: 'Active', shift: 'Morning', commission: '£850.00' },
    { id: 'ST-003', name: 'Mike Johnson', role: 'Cashier', status: 'On Leave', shift: 'Evening', commission: '£420.00' },
    { id: 'ST-004', name: 'Sarah Wilson', role: 'Manager', status: 'Active', shift: 'Full Day', commission: '£2,100.00' },
  ];

  const stats = [
    { label: 'Total Staff', value: '12', icon: Users, color: 'text-primary' },
    { label: 'Present Today', value: '10', icon: CheckCircle2, color: 'text-green-500' },
    { label: 'On Leave', value: '2', icon: XCircle, color: 'text-red-500' },
    { label: 'Total Payroll', value: '£18,500.00', icon: CreditCard, color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">HR & Staffing</h1>
          <p className="text-muted-foreground text-xs font-mono">ID 188, 190, 192 | PERSONNEL & PAYROLL MANAGEMENT</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-muted border border-border text-foreground px-4 py-2 rounded-none font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-colors">
            Attendance Log
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-none font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2">
            <UserPlus size={14} />
            Hire Staff
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border p-6 flex items-center gap-4 group hover:border-primary/50 transition-colors"
          >
            <div className={`p-3 rounded-none bg-muted/50 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{stat.label}</p>
              <h3 className="text-xl font-black font-mono tracking-tighter">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Staff Directory */}
      <div className="bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Users size={14} className="text-primary" />
            Staff Directory
          </h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Active
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
              <div className="w-2 h-2 rounded-full bg-red-500" /> On Leave
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="p-4 border-b border-border">Staff ID</th>
                <th className="p-4 border-b border-border">Name</th>
                <th className="p-4 border-b border-border">Role</th>
                <th className="p-4 border-b border-border">Shift</th>
                <th className="p-4 border-b border-border">Commission</th>
                <th className="p-4 border-b border-border">Status</th>
                <th className="p-4 border-b border-border"></th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="p-4 border-b border-border font-bold text-primary">{s.id}</td>
                  <td className="p-4 border-b border-border font-bold">{s.name}</td>
                  <td className="p-4 border-b border-border text-muted-foreground">{s.role}</td>
                  <td className="p-4 border-b border-border flex items-center gap-2">
                    <Clock size={12} className="text-muted-foreground" />
                    {s.shift}
                  </td>
                  <td className="p-4 border-b border-border font-bold text-green-500">{s.commission}</td>
                  <td className="p-4 border-b border-border">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      s.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 border-b border-border text-right">
                    <button className="p-1 hover:bg-muted rounded transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
