import React, { useState } from "react";
import { warehouseService } from "../../api/services/warehouse";
import { Truck, Package, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const WarehouseReceiving: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [poId, setPoId] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [newItem, setNewItem] = useState({ productId: "", quantity: 1 });

  const handleAddItem = () => {
    if (!newItem.productId) return;
    setItems([...items, newItem]);
    setNewItem({ productId: "", quantity: 1 });
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poId || items.length === 0) return;
    setLoading(true);
    try {
      await warehouseService.receivePurchaseOrder(poId, items);
      toast.success("Purchase order received & stock updated");
      setPoId("");
      setItems([]);
    } catch (error) {
      toast.error("Failed to receive purchase order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-card p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Truck className="text-primary w-6 h-6" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter italic">Receive Shipment</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">PO Number / ID</label>
          <input
            type="text"
            required
            value={poId}
            onChange={(e) => setPoId(e.target.value)}
            className="w-full bg-muted border-none px-4 py-3 text-sm font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
            placeholder="PO-XXXX-XXXX"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product ID / SKU</label>
              <input
                type="text"
                value={newItem.productId}
                onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
                className="w-full bg-muted border-none px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none"
                placeholder="PROD-XXXX"
              />
            </div>
            <div className="w-24 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Qty</label>
              <input
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                className="w-full bg-muted border-none px-4 py-2 text-xs font-bold outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-muted p-2 rounded-lg hover:bg-primary hover:text-white transition-all"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group">
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-muted-foreground" />
                  <span className="text-xs font-black uppercase tracking-widest">{item.productId}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full bg-primary text-primary-foreground py-4 font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Confirm Receipt</>}
        </button>
      </form>
    </div>
  );
};
