import React, { useEffect } from "react";
import { useWarehouseStore } from "../../store/useWarehouseStore";
import { Box, CheckCircle, Loader2, Printer } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export const WarehousePacking: React.FC = () => {
  const { packingLists, isLoading, fetchPackingLists, completePacking } = useWarehouseStore();

  useEffect(() => {
    fetchPackingLists();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await completePacking(id);
      toast.success("Packing list completed & labels generated");
    } catch (error) {
      toast.error("Failed to complete packing");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <Box className="text-primary w-6 h-6" />
          Packing Station
        </h2>
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {packingLists.length} Ready to Pack
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : packingLists.map((list) => (
          <motion.div
            layout
            key={list.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black uppercase tracking-tight text-lg">Order #{list.orderId}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Packing ID: {list.id}</p>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-primary">
                <Printer size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {list.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-card p-2 rounded-lg border border-border">
                      <Box size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{item.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Qty</div>
                      <div className="text-lg font-black">{item.quantity}</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.packed ? 'bg-green-500 border-green-500 text-white' : 'border-border'}`}>
                      {item.packed && <CheckCircle size={14} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="bg-muted text-muted-foreground py-3 font-black uppercase tracking-widest text-[10px] hover:bg-muted/80 transition-all">
                Print Packing Slip
              </button>
              <button
                onClick={() => handleComplete(list.id)}
                disabled={!list.items.every(i => i.packed)}
                className="bg-primary text-primary-foreground py-3 font-black uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                Ship & Close
              </button>
            </div>
          </motion.div>
        ))}
        {!isLoading && packingLists.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <Box size={48} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest">No orders ready for packing</p>
          </div>
        )}
      </div>
    </div>
  );
};
