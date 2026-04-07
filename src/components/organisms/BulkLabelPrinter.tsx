import React, { useState } from "react";
import { Printer, Search, Plus, Trash2, Loader2, Tag } from "lucide-react";
import { bulkService } from "../../api/services/bulk";
import { toast } from "sonner";

export const BulkLabelPrinter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const handleAdd = () => {
    if (!query) return;
    setSelectedIds([...selectedIds, query]);
    setQuery("");
  };

  const handlePrint = async () => {
    setLoading(true);
    try {
      await bulkService.bulkLabelPrint(selectedIds);
      toast.success("Print job sent to queue");
      setSelectedIds([]);
    } catch (error) {
      toast.error("Failed to start print job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-card p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Printer className="text-primary w-6 h-6" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter italic">Mass Label Print</h2>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter SKU or Product ID..."
            className="w-full bg-muted border-none pl-10 pr-4 py-3 text-xs font-bold uppercase tracking-widest focus:ring-2 ring-primary/20 outline-none"
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-muted p-3 rounded-lg hover:bg-primary hover:text-white transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
        {selectedIds.map((id, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group">
            <div className="flex items-center gap-3">
              <Tag size={16} className="text-primary" />
              <span className="text-xs font-black uppercase tracking-widest">{id}</span>
            </div>
            <button
              onClick={() => setSelectedIds(selectedIds.filter((_, i) => i !== idx))}
              className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {selectedIds.length === 0 && (
          <div className="text-center py-12 opacity-20">
            <Printer size={48} className="mx-auto mb-2" />
            <p className="font-black uppercase tracking-widest text-xs">No items selected</p>
          </div>
        )}
      </div>

      <button
        onClick={handlePrint}
        disabled={loading || selectedIds.length === 0}
        className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />}
        Print {selectedIds.length} Labels
      </button>
    </div>
  );
};
