import React, { useState } from "react";
import { DollarSign, Upload, Save, Loader2, AlertCircle } from "lucide-react";
import { bulkService } from "../../api/services/bulk";
import { toast } from "sonner";

export const BulkPriceUpdater: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // In a real app, we'd parse the CSV here for a preview
      setPreview([
        { sku: "IPH15P-256", oldPrice: 350.000, newPrice: 345.000 },
        { sku: "SAM-S24U", oldPrice: 320.000, newPrice: 315.000 },
      ]);
    }
  };

  const handleUpdate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // For demo, we'll use the preview data as if it was parsed
      await bulkService.bulkPriceUpdate(preview.map(p => ({ productId: p.sku, newPrice: p.newPrice })));
      toast.success("Bulk price update job started");
      setFile(null);
      setPreview([]);
    } catch (error) {
      toast.error("Failed to start price update job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-card p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <DollarSign className="text-primary w-6 h-6" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter italic">Bulk Price Updater</h2>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
        <AlertCircle className="text-blue-600 shrink-0" size={20} />
        <p className="text-xs text-blue-800 font-medium">
          Upload a CSV file with <span className="font-bold">SKU</span> and <span className="font-bold">NewPrice</span> columns. 
          Prices will be updated across all branches instantly.
        </p>
      </div>

      <div className="relative group">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
          <Upload className="mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" size={32} />
          <p className="font-black uppercase tracking-widest text-xs text-muted-foreground group-hover:text-primary">
            {file ? file.name : "Click or drag CSV file to upload"}
          </p>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Update Preview</h3>
          <div className="bg-muted/30 rounded-xl overflow-hidden border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-black uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Old Price</th>
                  <th className="p-3">New Price</th>
                  <th className="p-3">Change</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                {preview.map((p, i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="p-3 font-mono">{p.sku}</td>
                    <td className="p-3 text-muted-foreground">{p.oldPrice.toFixed(3)}</td>
                    <td className="p-3 text-primary">{p.newPrice.toFixed(3)}</td>
                    <td className="p-3 text-red-500">-{ (p.oldPrice - p.newPrice).toFixed(3) }</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Apply Changes to {preview.length} Items
          </button>
        </div>
      )}
    </div>
  );
};
