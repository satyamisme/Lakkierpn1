import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subValue?: string;
  trend?: 'up' | 'down';
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, value, icon: Icon, subValue, trend, color = 'blue' 
}) => {
  const colorMap: any = {
    blue: 'text-blue-500 border-blue-500/10 bg-blue-500/5',
    green: 'text-green-500 border-green-500/10 bg-green-500/5',
    purple: 'text-purple-500 border-purple-500/10 bg-purple-500/5',
    orange: 'text-orange-500 border-orange-500/10 bg-orange-500/5',
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] group hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 rounded-2xl ${colorMap[color] || colorMap.blue} transition-all`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`text-[10px] font-black uppercase tracking-widest ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? '▲' : '▼'} High Growth
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">{label}</p>
        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{value}</h3>
        {subValue && (
          <p className="text-[9px] text-white/10 font-bold uppercase mt-2 tracking-widest">{subValue}</p>
        )}
      </div>
    </div>
  );
};
