import React from 'react';

interface PaymentInputProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: string) => void;
  colorClass: string;
}

export const PaymentInput: React.FC<PaymentInputProps> = ({ label, icon, value, onChange, colorClass }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
        <span className={colorClass}>{icon}</span>
        {label}
      </label>
      <div className="relative">
        <input 
          type="number"
          step="0.001"
          className="w-full pl-4 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition-all text-xl font-black text-gray-900"
          placeholder="0.000"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">KD</span>
      </div>
    </div>
  );
};
