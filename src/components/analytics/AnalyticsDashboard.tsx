import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, PieChart, TrendingUp, Activity, ShieldCheck, AlertTriangle, FileText, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

/**
 * ID 201: Performance Analytics
 * ID 205: Audit Logs
 */
export const AnalyticsDashboard: React.FC = () => {
  const data = [
    { name: 'Mon', sales: 4000, repairs: 2400 },
    { name: 'Tue', sales: 3000, repairs: 1398 },
    { name: 'Wed', sales: 2000, repairs: 9800 },
    { name: 'Thu', sales: 2780, repairs: 3908 },
    { name: 'Fri', sales: 1890, repairs: 4800 },
    { name: 'Sat', sales: 2390, repairs: 3800 },
    { name: 'Sun', sales: 3490, repairs: 4300 },
  ];

  const logs = [
    { id: 'LOG-101', user: 'Admin', action: 'Modified Permissions', target: 'Role: Cashier', time: '10 mins ago', severity: 'High' },
    { id: 'LOG-102', user: 'Cashier-01', action: 'Processed Sale', target: 'Order #POS-1234', time: '15 mins ago', severity: 'Low' },
    { id: 'LOG-103', user: 'Tech-02', action: 'Updated Repair', target: 'Job #RP-5678', time: '22 mins ago', severity: 'Medium' },
    { id: 'LOG-104', user: 'System', action: 'Backup Completed', target: 'Cloud Storage', time: '1 hour ago', severity: 'Low' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Analytics & Audit</h1>
          <p className="text-muted-foreground text-xs font-mono">ID 201, 205 | PERFORMANCE & SECURITY MONITORING</p>
        </div>
        <button className="bg-muted border border-border text-foreground px-4 py-2 rounded-none font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-colors flex items-center gap-2">
          <Download size={14} />
          Export Report
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6">
          <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart3 size={14} className="text-primary" />
            Weekly Sales vs Repairs
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="repairs" fill="#444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border p-6">
          <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            System Activity Trend
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="repairs" stroke="#444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={14} className="text-primary" />
            Security Audit Trail
          </h2>
          <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Live Stream</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="p-4 border-b border-border">Log ID</th>
                <th className="p-4 border-b border-border">User</th>
                <th className="p-4 border-b border-border">Action</th>
                <th className="p-4 border-b border-border">Target</th>
                <th className="p-4 border-b border-border">Time</th>
                <th className="p-4 border-b border-border">Severity</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4 border-b border-border font-bold text-primary">{log.id}</td>
                  <td className="p-4 border-b border-border font-bold">{log.user}</td>
                  <td className="p-4 border-b border-border">{log.action}</td>
                  <td className="p-4 border-b border-border text-muted-foreground">{log.target}</td>
                  <td className="p-4 border-b border-border text-[10px]">{log.time}</td>
                  <td className="p-4 border-b border-border">
                    <span className={`flex items-center gap-1.5 ${
                      log.severity === 'High' ? 'text-red-500' :
                      log.severity === 'Medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      <AlertTriangle size={12} />
                      {log.severity}
                    </span>
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
