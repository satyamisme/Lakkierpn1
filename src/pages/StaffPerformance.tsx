import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Target, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Loader2
} from 'lucide-react';
import { commissionService } from '../api/services/commission';

/**
 * ID 188: Staff Performance
 * KPI tracking, sales leaderboards, and attendance.
 */
export const StaffPerformance: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const data = await commissionService.getLeaderboard("monthly");
      setLeaderboard(data);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight text-foreground">Staff Performance</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">KPIs & Leaderboards (ID 188)</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-muted border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all">Attendance Log</button>
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">Commission Report</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Avg Sales / Staff', value: '4,250 KD', trend: '+8.4%', up: true, icon: <TrendingUp className="w-5 h-5" /> },
          { label: 'Target Achievement', value: '92.4%', trend: '+2.1%', up: true, icon: <Target className="w-5 h-5" /> },
          { label: 'Avg Repair Time', value: '42m', trend: '-5m', up: true, icon: <Clock className="w-5 h-5" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest border border-border p-6 rounded-2xl shadow-sm group hover:border-primary/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-primary transition-colors">{stat.icon}</div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <h2 className="text-2xl font-mono font-black">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-border rounded-[3rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif italic">Sales Leaderboard</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input type="text" placeholder="Search Staff..." className="bg-muted border border-border pl-10 pr-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary" />
            </div>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Calculating Performance...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <Award size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest">No performance data yet</p>
              </div>
            ) : leaderboard.map((staff, i) => (
              <div key={staff.staffId} className="flex items-center justify-between p-6 bg-muted/30 border border-border rounded-3xl group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    {i === 0 ? <Award className="w-6 h-6 text-amber-500" /> : <Users className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{staff.staffName}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">Staff ID: {staff.staffId.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm font-mono font-black">{staff.totalSales.toFixed(3)} KD</p>
                    <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min((staff.totalSales / 5000) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-500">
                    +{staff.commission.toFixed(3)} KD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary text-primary-foreground p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <Award className="w-12 h-12 mb-6 opacity-20" />
            <h3 className="text-2xl font-serif italic mb-4">Employee of the Month</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 overflow-hidden">
                <img src="https://picsum.photos/seed/ahmed/200/200" alt="Ahmed" className="w-full h-full object-cover grayscale" />
              </div>
              <div>
                <p className="text-xl font-black uppercase tracking-tighter">Ahmed K.</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Senior Sales Executive</p>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10 pb-2">
                <span>Monthly Revenue</span>
                <span>12,450 KD</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-b border-primary-foreground/10 pb-2">
                <span>Customer Rating</span>
                <span>4.9 / 5.0</span>
              </div>
            </div>
            <button className="w-full py-4 bg-background text-primary rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl">
              View Full Profile
            </button>
          </div>
          <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};
