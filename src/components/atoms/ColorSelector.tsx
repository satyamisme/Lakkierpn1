import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface ColorSelectorProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ value, onChange, options }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newColor, setNewColor] = useState("");

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase text-white/30 ml-2">Select or Add Color</label>
      {!isAdding ? (
        <select 
          value={value}
          onChange={(e) => e.target.value === "ADD" ? setIsAdding(true) : onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary transition-all hover:bg-white/10"
        >
          <option value="">Choose Color...</option>
          {options.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
          <option value="ADD" className="text-primary font-bold bg-black">+ ADD NEW COLOR</option>
        </select>
      ) : (
        <div className="flex gap-2 animate-in slide-in-from-right-2">
          <input 
            autoFocus
            className="flex-1 bg-primary/10 border border-primary/30 rounded-xl p-3 text-xs text-white outline-none"
            value={newColor} 
            onChange={(e) => setNewColor(e.target.value)} 
            placeholder="Type color..."
          />
          <button 
            type="button" 
            onClick={() => { 
                if (newColor.trim()) {
                    onChange(newColor.trim()); 
                    setIsAdding(false); 
                    setNewColor("");
                } else {
                    setIsAdding(false);
                }
            }} 
            className="bg-primary p-3 rounded-xl text-black hover:scale-105 active:scale-95 transition-all"
          >
            <Check size={14}/>
          </button>
        </div>
      )}
    </div>
  );
};
