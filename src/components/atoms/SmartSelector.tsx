import React, { useState, useEffect } from 'react';
import api from '../../api/client';

interface SmartSelectorProps {
  field: string;
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export const SmartSelector: React.FC<SmartSelectorProps> = ({ field, value, onChange, label }) => {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get(`/attributes/suggest?field=${field}`);
        setOptions(res.data);
      } catch (err) {
        console.error(`Failed to fetch suggestions for ${field}:`, err);
      }
    };
    fetchOptions();
  }, [field]);

  return (
    <div className="space-y-2">
      {label && <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">{label}</label>}
      <div className="relative">
        <input 
          list={`${field}-options`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:ring-2 ring-blue-500/20 outline-none transition-all placeholder:text-white/10"
          placeholder={`Enter or select ${field}...`}
        />
        <datalist id={`${field}-options`}>
          {options.map(opt => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      </div>
    </div>
  );
};
