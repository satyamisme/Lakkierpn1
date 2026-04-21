import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Hash, Layers, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../api/client';

interface AttributeChipProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const AttributeChip: React.FC<AttributeChipProps> = ({ label, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
      isSelected 
        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
        : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
    }`}
  >
    {label}
  </button>
);

interface VariationMatrixProps {
  baseProduct: {
    brand: string;
    name: string;
    price: number;
    cost: number;
  };
  onMatrixChange: (variants: any[]) => void;
}

export const VariationMatrix: React.FC<VariationMatrixProps> = ({ baseProduct, onMatrixChange }) => {
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  const [storageOptions, setStorageOptions] = useState<string[]>([]);
  const [ramOptions, setRamOptions] = useState<string[]>([]);
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  
  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    // Fetch suggestions from Attribute Engine
    const fetchAttr = async () => {
      const storage = await api.get('/attributes/suggestions?field=storage');
      const ram = await api.get('/attributes/suggestions?field=ram');
      const colors = await api.get('/attributes/suggestions?field=color');
      
      setStorageOptions(storage.data);
      setRamOptions(ram.data);
      setColorOptions(colors.data);
    };
    fetchAttr();
  }, []);

  // Generate Matrix when selections change
  useEffect(() => {
    let newVariants: any[] = [];
    
    // Cross product logic
    const storages = selectedStorage.length > 0 ? selectedStorage : [''];
    const rams = selectedRam.length > 0 ? selectedRam : [''];
    const colors = selectedColors.length > 0 ? selectedColors : [''];

    storages.forEach(s => {
      rams.forEach(r => {
        colors.forEach(c => {
          if (!s && !r && !c) return;
          
          const attributes: any = {};
          if (s) attributes.storage = s;
          if (r) attributes.ram = r;
          if (c) attributes.color = c;

          // Prediction Logic: Generate temporary SKU for UI feedback
          const bPrefix = (baseProduct.brand || 'UNK').substring(0, 3).toUpperCase();
          const mPrefix = (baseProduct.name || 'MOD').substring(0, 3).toUpperCase();
          const sCode = s.replace('GB', '') || '000';
          const rCode = r.replace('GB', '') || '00';
          const colorCode = c.substring(0, 2).toUpperCase() || 'XX';
          
          const mmYY = new Date().toLocaleString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '');
          const tempSku = `${bPrefix}-${mPrefix}-${sCode}-${rCode}-${colorCode}-${mmYY}`;

          newVariants.push({
            attributes,
            sku: tempSku,
            price: baseProduct.price || 0,
            cost: baseProduct.cost || 0,
            stock: 0,
            trackingMethod: 'imei'
          });
        });
      });
    });

    setVariants(newVariants);
    onMatrixChange(newVariants);
  }, [selectedStorage, selectedRam, selectedColors, baseProduct]);

  const toggleAttribute = (list: string[], setter: (l: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setter(list.filter(v => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Selector Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="text-blue-500" size={16} />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Storage Selection</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {storageOptions.map(opt => (
              <AttributeChip 
                key={opt} 
                label={opt} 
                isSelected={selectedStorage.includes(opt)}
                onClick={() => toggleAttribute(selectedStorage, setSelectedStorage, opt)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-purple-500" size={16} />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">RAM Configuration</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ramOptions.map(opt => (
              <AttributeChip 
                key={opt} 
                label={opt} 
                isSelected={selectedRam.includes(opt)}
                onClick={() => toggleAttribute(selectedRam, setSelectedRam, opt)}
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Color Esthetics</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(opt => (
              <AttributeChip 
                key={opt} 
                label={opt} 
                isSelected={selectedColors.includes(opt)}
                onClick={() => toggleAttribute(selectedColors, setSelectedColors, opt)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Generated Matrix View */}
      <div className="pt-8 border-t border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Hash className="text-white/20" size={18} />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Configuration Matrix</h3>
          </div>
          <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase">
            {variants.length} Variations Staged
          </span>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar pr-2">
          <AnimatePresence mode="popLayout">
            {variants.map((v, idx) => (
              <motion.div
                key={v.sku}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex gap-2 mb-1">
                      {Object.entries(v.attributes).map(([key, val]: any) => (
                        <span key={key} className="text-[9px] font-black text-white/40 uppercase bg-white/5 px-2 py-0.5 rounded">
                          {val}
                        </span>
                      ))}
                    </div>
                    <code className="text-[11px] font-bold text-white/60 tracking-wider font-mono">{v.sku}</code>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-white/20 uppercase mb-1">Retail Price</span>
                    <input 
                      type="number"
                      value={v.price}
                      onChange={(e) => {
                        const newVs = [...variants];
                        newVs[idx].price = parseFloat(e.target.value);
                        setVariants(newVs);
                        onMatrixChange(newVs);
                      }}
                      className="bg-transparent border-b border-white/10 text-right font-black text-white outline-none w-24 pb-1 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const newVs = variants.filter((_, i) => i !== idx);
                      setVariants(newVs);
                      onMatrixChange(newVs);
                    }}
                    className="p-3 text-white/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {variants.length === 0 && (
            <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/5 rounded-[3rem]">
              <p className="text-xs font-bold text-white/10 uppercase tracking-[0.3em]">
                Select attributes to build matrix
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
