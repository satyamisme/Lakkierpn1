import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Plus, Check, ChevronDown, X } from 'lucide-react';

interface SmartSelectorProps {
  label: string;
  field?: string;
  options?: string[];
  value: string;
  onChange: (val: string) => void;
  onAddNew?: (val: string) => void;
}

export const SmartSelector: React.FC<SmartSelectorProps> = ({ 
  label, 
  field, 
  options: staticOptions, 
  value, 
  onChange, 
  onAddNew 
}) => {
  const [options, setOptions] = useState<string[]>(staticOptions || []);
  const [isAdding, setIsAdding] = useState(false);
  const [customVal, setCustomVal] = useState("");

  useEffect(() => {
    if (field && !staticOptions) {
      const fetchOptions = async () => {
        try {
          const res = await api.get(`/attributes/suggestions?field=${field}`);
          setOptions(res.data);
        } catch (err) {
          console.error(`Failed to fetch suggestions for ${field}:`, err);
        }
      };
      fetchOptions();
    }
  }, [field, staticOptions]);

  // Update options if staticOptions change
  useEffect(() => {
    if (staticOptions) setOptions(staticOptions);
  }, [staticOptions]);

  const handleAddNew = () => {
    if (customVal.trim()) {
      const val = customVal.trim();
      if (onAddNew) onAddNew(val);
      onChange(val);
      setOptions(prev => [...new Set([...prev, val])]);
      setIsAdding(false);
      setCustomVal("");
    }
  };

  return (
    <div className="flex flex-col gap-1.5 group">
      <div className="flex items-center justify-between px-2">
        <label className="text-[9px] font-black uppercase text-white/20 tracking-widest">{label}</label>
        {value && !options.includes(value) && !isAdding && (
          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">Custom</span>
        )}
      </div>
      
      <div className="flex gap-2">
        {!isAdding ? (
          <div className="relative flex-1">
            <select 
              value={value} 
              onChange={(e) => e.target.value === "NEW" ? setIsAdding(true) : onChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 appearance-none cursor-pointer transition-all"
            >
              <option value="" className="bg-[#0A0A0A]">Select {label}</option>
              {options.map((opt: string) => (
                <option key={opt} value={opt} className="bg-[#0A0A0A]">{opt}</option>
              ))}
              <option value="NEW" className="bg-[#0A0A0A] text-blue-500 font-extrabold">+ ADD NEW...</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
          </div>
        ) : (
          <div className="flex-1 flex gap-2 animate-in slide-in-from-right-2 duration-300">
            <input 
              autoFocus
              className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-xs font-bold text-white outline-none placeholder:text-white/20"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
              placeholder={`Enter new ${label}...`}
            />
            <button 
              type="button"
              onClick={handleAddNew} 
              className="bg-blue-500 p-4 rounded-xl text-black hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20"
            >
              <Check size={16}/>
            </button>
            <button 
              type="button"
              onClick={() => setIsAdding(false)} 
              className="bg-white/5 p-4 rounded-xl text-white/40 hover:text-white transition-all border border-white/10"
            >
              <X size={16}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
