import React, { useEffect } from "react";
import { useWarehouseStore } from "../../store/useWarehouseStore";
import { Package, CheckCircle, MapPin, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export const WarehousePicking: React.FC = () => {
  const { pickingLists, isLoading, fetchPickingLists, completePicking } = useWarehouseStore();

  useEffect(() => {
    fetchPickingLists();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await completePicking(id);
      toast.success("Picking list completed");
    } catch (error) {
      toast.error("Failed to complete picking");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <Search className="text-primary w-6 h-6" />
          Picking Queue
        </h2>
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {pickingLists.length} Active Lists
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : pickingLists.map((list) => (
          <motion.div
            layout
            key={list.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black uppercase tracking-tight text-lg">Order #{list.orderId}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Picking ID: {list.id}</p>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                {list.status}
              </span>
            </div>

            <div className="space-y-2">
              {list.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group">
                  <div className="flex items-center gap-4">
                    <div className="bg-card p-2 rounded-lg border border-border">
                      <Package size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{item.name}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span>SKU: {item.sku}</span>
                        <span className="w-1 h-1 bg-border rounded-full" />
                        <span className="flex items-center gap-1 text-primary"><MapPin size={10} /> {item.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Qty</div>
                      <div className="text-lg font-black">{item.quantity}</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.picked ? 'bg-green-500 border-green-500 text-white' : 'border-border'}`}>
                      {item.picked && <CheckCircle size={14} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleComplete(list.id)}
              disabled={!list.items.every(i => i.picked)}
              className="w-full bg-primary text-primary-foreground py-3 font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              Complete Picking
            </button>
          </motion.div>
        ))}
        {!isLoading && pickingLists.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <Package size={48} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest">No picking tasks assigned</p>
          </div>
        )}
      </div>
    </div>
  );
};
