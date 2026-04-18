import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Download, 
  Filter, 
  User, 
  Activity, 
  Database, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface AuditLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: 'create' | 'update' | 'delete';
  entity: 'sale' | 'repair' | 'product' | 'user';
  entityId: string;
  ip: string;
  timestamp: string;
  newValue?: any;
}

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    entity: '',
    action: '',
  });

  const [activeTab, setActiveTab] = useState<'activity' | 'shift' | 'financial'>('activity');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/audit/logs', {
        params: {
          page,
          ...filters
        }
      });
      setLogs(response.data.logs);
      setTotalPages(response.data.pages);
    } catch (error) {
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/audit/logs/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Export failed");
    }
  };

  return (
    <div className="space-y-8">
      {/* Audit Navigation Matrix */}
      <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-2xl w-fit">
        {[
          { id: 'activity', label: 'Activity Logs', icon: Database },
          { id: 'shift', label: 'Shift Audits', icon: Clock },
          { id: 'financial', label: 'Financial Matrix', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'activity' && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                <select 
                  value={filters.entity}
                  onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                  className="bg-surface border border-border pl-10 pr-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all appearance-none min-w-[150px]"
                >
                  <option value="">All Entities</option>
                  <option value="sale">Sales</option>
                  <option value="repair">Repairs</option>
                  <option value="product">Products</option>
                  <option value="user">Users</option>
                </select>
              </div>
              <div className="relative group">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                <select 
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  className="bg-surface border border-border pl-10 pr-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all appearance-none min-w-[150px]"
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Timestamp</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">User</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Action</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Entity</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Entity ID</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Fetching Audit Trail...</p>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center opacity-40">
                        <Database size={48} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No logs found</p>
                      </td>
                    </tr>
                  ) : logs.map((log) => (
                    <tr key={log._id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-muted-foreground">
                          <Clock size={12} className="text-primary" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-tighter">{log.userId?.name || 'System'}</p>
                            <p className="text-[9px] text-muted-foreground font-bold">{log.userId?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          log.action === 'create' ? 'bg-green-500/5 text-green-600 border-green-500/20' : 
                          log.action === 'delete' ? 'bg-red-500/5 text-red-600 border-red-500/20' : 
                          'bg-blue-500/5 text-blue-600 border-blue-500/20'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                          <FileText size={12} className="text-muted-foreground" />
                          {log.entity}
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px] text-muted-foreground font-bold">
                        {log.entityId}
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px] text-muted-foreground font-bold">
                        {log.ip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-8 border-t border-border flex items-center justify-between bg-muted/10">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-3 bg-surface border border-border rounded-xl disabled:opacity-30 hover:bg-muted transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-3 bg-surface border border-border rounded-xl disabled:opacity-30 hover:bg-muted transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'shift' && (
        <div className="bg-surface-container-lowest border border-border rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[400px] text-center">
           <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-8 text-muted-foreground">
             <Clock size={40} />
           </div>
           <h3 className="text-2xl font-serif italic tracking-tighter mb-4">Shift Pulse Auditor</h3>
           <p className="max-w-md text-[10px] font-black uppercase tracking-widest leading-loose text-muted-foreground opacity-60">
             Real-time monitoring of staff shift cycles, duration variances, and operational throughput metrics.
           </p>
           <div className="grid grid-cols-3 gap-8 mt-12 w-full max-w-2xl">
              {[
                { label: 'Avg Shift Duration', value: '8h 12m' },
                { label: 'Time Compliance', value: '98.4%' },
                { label: 'System Overlays', value: '14 Active' }
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-muted/30 border border-border rounded-2xl">
                   <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
                   <p className="text-xl font-mono font-black">{stat.value}</p>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="bg-surface-container-low/40 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32" />
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                 <div>
                    <h3 className="text-3xl font-serif italic tracking-tighter">Fiscal Integrity Report</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 mt-2">Detailed Reconciliation & VAT Allocation Matrix</p>
                 </div>
                 <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">Archive Period</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'Taxable Revenue', value: 'KD 14,200', trend: '+4%' },
                   { label: 'VAT Collected', value: 'KD 1,420', trend: 'STABLE' },
                   { label: 'Discounts Applied', value: 'KD 840', trend: '-2%' },
                   { label: 'Net Liquidity', value: 'KD 11,940', trend: '+12%' }
                 ].map((stat, i) => (
                   <div key={i} className="bg-surface-container border border-border p-8 rounded-[2rem] shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-4">{stat.label}</p>
                      <h4 className="text-2xl font-black font-mono tracking-tighter mb-2">{stat.value}</h4>
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{stat.trend}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
