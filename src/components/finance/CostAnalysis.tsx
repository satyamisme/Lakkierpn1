import React from 'react';
import { TrendingDown, PieChart, DollarSign } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Labor', value: 4500 },
  { name: 'Parts', value: 3200 },
  { name: 'Rent', value: 1500 },
  { name: 'Utilities', value: 800 },
  { name: 'Marketing', value: 1200 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const CostAnalysis: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
          <TrendingDown className="text-primary w-8 h-8" />
          Cost Analysis
        </h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Deep dive into operational expenditures</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border p-8 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <PieChart className="text-primary w-4 h-4" />
            Expense Distribution
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.name} className="bg-card border border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
              </div>
              <span className="text-sm font-black font-mono">{item.value.toFixed(2)} KD</span>
            </div>
          ))}
          <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl shadow-primary/20 mt-8">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Operational Cost</p>
            <p className="text-3xl font-black italic tracking-tighter mt-1 flex items-center gap-2">
              <DollarSign size={24} />
              11,200.00
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
