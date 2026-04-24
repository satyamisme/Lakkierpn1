import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';

interface RepairStatsProps {
  repairs: any[];
}

export const RepairStats: React.FC<RepairStatsProps> = ({ repairs }) => {
  const activeCount = repairs.filter(r => !['collected', 'cancelled'].includes(r.status)).length;
  const readyCount = repairs.filter(r => r.status === 'ready').length;
  const overdueCount = repairs.filter(r => {
    if (['collected', 'cancelled', 'ready'].includes(r.status)) return false;
    if (!r.expectedReadyDate) return false;
    return new Date(r.expectedReadyDate) < new Date();
  }).length;

  const stats = [
    { label: 'Active Matrix', value: activeCount, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Ready for Collection', value: readyCount, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Temporal Drift', value: overdueCount, icon: Clock, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Efficiency Quotient', value: '94%', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="surface-container p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
        >
          <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[80px] opacity-20 group-hover:opacity-40 transition-all`} />
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                   <stat.icon size={20} />
                </div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{stat.label}</p>
             </div>
             <p className="text-4xl font-black text-white font-mono tracking-tighter">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
