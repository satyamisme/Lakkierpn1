import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Trash2, Scan, Hash, Layers, Cpu } from 'lucide-react';

interface StockIntakeMatrixProps {
  items: any[];
  onRemove: (id: string) => void;
  onUpdateUnit: (itemId: string, unitId: string, field: string, value: any) => void;
  onAddUnit: (itemId: string) => void;
  onRemoveUnit: (itemId: string, unitId: string) => void;
  onBulkIdentifiers: (itemId: string, text: string) => void;
}

export const StockIntakeMatrix: React.FC<StockIntakeMatrixProps> = ({ 
  items, 
  onRemove, 
  onUpdateUnit, 
  onAddUnit, 
  onRemoveUnit,
  onBulkIdentifiers
}) => {
  return (
    <div className="space-y-6">
      {/* Header Grid */}
      <div className="terminal-matrix-header">
        <div>Full Identity (Name + Specs)</div>
        <div className="text-center">Storage</div>
        <div className="text-center">RAM</div>
        <div className="text-center">Color</div>
        <div className="text-center">SKU DNA</div>
        <div className="text-right px-4">Action</div>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 border border-dashed border-white/5 rounded-[3rem] text-center bg-white/[0.01]"
          >
            <Package size={48} className="mx-auto mb-4 text-white/10" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Staging Matrix Empty</p>
          </motion.div>
        ) : (
          items.map((item) => (
            <motion.div 
              key={item._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/20 transition-all mb-4"
            >
              {/* Main Variant Row */}
              <div className="terminal-matrix-row border-b-0 bg-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden border border-white/5">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="variant-label truncate max-w-[200px]">{item.name}</h4>
                    <span className="text-[7px] font-black uppercase text-primary/40 tracking-widest">{item.brand}</span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-black font-mono text-white/60 bg-white/5 px-3 py-1 rounded-lg">
                    {item.attributes?.storage || 'N/A'}
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-black font-mono text-white/60 bg-white/5 px-3 py-1 rounded-lg">
                    {item.attributes?.ram || 'N/A'}
                  </span>
                </div>

                <div className="text-center">
                   <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.attributes?.color?.toLowerCase() }} />
                      <span className="text-[9px] font-black text-white/40 uppercase">{item.attributes?.color || 'GEN'}</span>
                   </div>
                </div>

                <div className="text-center">
                  <code className="text-[10px] font-bold text-primary/60 font-mono tracking-tighter">{item.sku}</code>
                </div>

                <div className="text-right">
                  <button 
                    onClick={() => onRemove(item._id)}
                    className="p-3 text-white/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Unit Controls - The Expansion Area */}
              <div className="px-8 pb-8 pt-4 grid grid-cols-12 gap-8 border-t border-white/5 bg-white/[0.01]">
                 {/* Landed Cost / Bin */}
                 <div className="col-span-3 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-widest pl-1">Landed Cost (KD)</label>
                      <input 
                        type="number"
                        value={item.units[0]?.cost || 0}
                        onChange={(e) => onUpdateUnit(item._id, item.units[0].id, 'cost', parseFloat(e.target.value))}
                        className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-black text-white outline-none focus:border-primary/40 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-widest pl-1">Target Bin</label>
                      <input 
                        placeholder="A-01"
                        value={item.binLocation || ''}
                        className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-black text-white outline-none focus:border-primary/40 uppercase"
                      />
                    </div>
                 </div>

                 {/* Tokenized Scanning */}
                 <div className="col-span-9 space-y-4">
                    <div className="flex items-center justify-between">
                       <h5 className="text-[9px] font-black text-white/20 uppercase tracking-widest">Serial / IMEI Capture ({item.quantity} Units)</h5>
                       <button 
                        onClick={() => onAddUnit(item._id)}
                        className="text-[8px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-all"
                       >
                        Manually Link Node
                       </button>
                    </div>
                    
                    <div className="relative group">
                       <textarea 
                        onBlur={(e) => onBulkIdentifiers(item._id, e.target.value)}
                        placeholder={`BULK SCAN ${item.trackingMethod?.toUpperCase() || 'ID'}...`}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-white/60 outline-none focus:border-primary/40 min-h-[80px] shadow-inner"
                       />
                       <div className="absolute right-4 bottom-4 opacity-20 pointer-events-none flex items-center gap-2">
                          <Scan size={14} className="text-primary" />
                          <span className="text-[7px] font-black uppercase tracking-widest">Global Scan active</span>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                       {item.units.map((u: any, idx: number) => (
                         <div key={u.id} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 group/unit">
                            <span className="text-[8px] font-black text-white/20">#{idx + 1}</span>
                            <input 
                              value={u.identifier}
                              onChange={(e) => onUpdateUnit(item._id, u.id, 'identifier', e.target.value)}
                              className="bg-transparent border-none outline-none text-[10px] font-mono text-primary w-24"
                              placeholder="Capturing..."
                            />
                            <button onClick={() => onRemoveUnit(item._id, u.id)} className="opacity-0 group-hover/unit:opacity-100 transition-opacity text-white/20 hover:text-red-500">
                               <Trash2 size={10} />
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};
