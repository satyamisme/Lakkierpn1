import React from "react";
import { LeaderboardEntry } from "../../api/services/commission";
import { Trophy, Medal, TrendingUp, Zap, DollarSign } from "lucide-react";
import { motion } from "motion/react";

interface StaffLeaderboardProps {
  entries: LeaderboardEntry[];
}

export const StaffLeaderboard: React.FC<StaffLeaderboardProps> = ({ entries }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-amber-100 p-2 rounded-lg">
          <Trophy className="text-amber-600 w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Top Performers</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {entries.map((entry, idx) => (
          <motion.div
            key={entry.staffId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-card border p-5 flex items-center justify-between group transition-all ${
              idx === 0 ? 'border-amber-400 shadow-lg shadow-amber-400/10' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                  idx === 0 ? 'bg-amber-400 text-white' : 
                  idx === 1 ? 'bg-slate-300 text-slate-700' : 
                  idx === 2 ? 'bg-orange-300 text-orange-800' : 'bg-muted text-muted-foreground'
                }`}>
                  {idx + 1}
                </div>
                {idx < 3 && (
                  <Medal className="absolute -top-2 -right-2 text-white fill-current w-5 h-5" />
                )}
              </div>
              
              <div>
                <h3 className="font-black uppercase tracking-tight text-lg">{entry.name}</h3>
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  <span className="flex items-center gap-1"><TrendingUp size={10} /> {entry.salesCount} Sales</span>
                  <span className="flex items-center gap-1"><Zap size={10} /> {entry.repairsCount} Repairs</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-10">
              <div className="text-right hidden md:block">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Revenue</div>
                <div className="text-lg font-black font-mono">{entry.salesValue.toFixed(3)} KD</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary">Commission</div>
                <div className="text-xl font-black text-primary font-mono flex items-center gap-1 justify-end">
                  <DollarSign size={16} />
                  {entry.commissionEarned.toFixed(3)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
